import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { guardRequest, handlePreflight } from "@/lib/security/guard";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const STORAGE_BUCKET = "recordings";
const CONFIRMATION_VALUE = "DELETE";

export async function OPTIONS(req: NextRequest) {
  return handlePreflight(req);
}

export async function POST(req: NextRequest) {
  const guard = await guardRequest(req);
  if (guard instanceof NextResponse) return guard;
  const { userId, headers } = guard;

  const body = await req.json().catch(() => null);
  if (body?.confirm !== CONFIRMATION_VALUE) {
    return NextResponse.json(
      { error: `Confirmation required. Send { "confirm": "${CONFIRMATION_VALUE}" }.` },
      { status: 400, headers }
    );
  }

  let admin: SupabaseClient;
  try {
    admin = getSupabaseAdminClient();
  } catch (err) {
    console.error("Account deletion misconfigured:", err);
    return NextResponse.json(
      { error: "Account deletion is not configured on the server." },
      { status: 500, headers }
    );
  }

  try {
    // userId comes only from the verified bearer token (see guardRequest ->
    // verifyBearerToken) - never from anything in the request body.
    const { data: sessions, error: sessionsError } = await admin
      .from("sessions")
      .select("id")
      .eq("user_id", userId);
    if (sessionsError) throw sessionsError;
    const sessionIds = (sessions ?? []).map((s) => s.id as string);

    const knownStoragePaths: string[] = [];

    if (sessionIds.length > 0) {
      const { data: recordings, error: recordingsError } = await admin
        .from("recordings")
        .select("id, storage_path")
        .in("session_id", sessionIds);
      if (recordingsError) throw recordingsError;

      const recordingIds = (recordings ?? []).map((r) => r.id as string);
      knownStoragePaths.push(
        ...(recordings ?? [])
          .map((r) => r.storage_path as string | null)
          .filter((p): p is string => Boolean(p))
      );

      // Explicit, ordered, child-to-parent deletion. This does NOT rely on
      // ON DELETE CASCADE for this irreversible operation: reading
      // supabase/migrations/0001_init.sql confirms
      // attempt_comparisons.analysis_1_id/analysis_2_id have no cascade
      // defined, and it cannot be verified from application code whether
      // supabase.auth.admin.deleteUser() triggers public-schema cascades
      // the same way a direct SQL `DELETE FROM auth.users` would. Deleting
      // every table explicitly, in foreign-key-safe order, removes that
      // uncertainty entirely rather than assuming it works.
      const { error: comparisonsError } = await admin
        .from("attempt_comparisons")
        .delete()
        .in("session_id", sessionIds);
      if (comparisonsError) throw comparisonsError;

      const { error: drillsError } = await admin
        .from("drills")
        .delete()
        .in("session_id", sessionIds);
      if (drillsError) throw drillsError;

      if (recordingIds.length > 0) {
        const { error: analysesError } = await admin
          .from("ai_analyses")
          .delete()
          .in("recording_id", recordingIds);
        if (analysesError) throw analysesError;

        const { error: transcriptsError } = await admin
          .from("transcripts")
          .delete()
          .in("recording_id", recordingIds);
        if (transcriptsError) throw transcriptsError;
      }

      const { error: recordingsDeleteError } = await admin
        .from("recordings")
        .delete()
        .in("session_id", sessionIds);
      if (recordingsDeleteError) throw recordingsDeleteError;

      const { error: sessionsDeleteError } = await admin
        .from("sessions")
        .delete()
        .in("id", sessionIds);
      if (sessionsDeleteError) throw sessionsDeleteError;
    }

    // Delete storage objects: paths known from the recordings table, plus a
    // defensive recursive walk of the user's storage folder in case any
    // object exists in storage but was never recorded in the database (e.g.
    // an upload that succeeded but the follow-up DB write failed).
    const allPaths = new Set(knownStoragePaths);
    await collectStoragePaths(admin, userId, allPaths);

    if (allPaths.size > 0) {
      const { error: storageError } = await admin.storage
        .from(STORAGE_BUCKET)
        .remove(Array.from(allPaths));
      if (storageError) throw storageError;
    }

    // Finally, delete the auth user itself.
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
    if (deleteUserError) throw deleteUserError;

    return NextResponse.json({ success: true }, { headers });
  } catch (err) {
    console.error("Account deletion failed:", err);
    return NextResponse.json(
      { error: "Account deletion failed. Please try again or contact support." },
      { status: 502, headers }
    );
  }
}

/**
 * Recursively walks a folder in the recordings bucket (userId/sessionId/file)
 * and adds every file path found to `paths`. Supabase Storage's list() API
 * returns folder placeholders with `id: null` and real files with a
 * non-null id.
 */
async function collectStoragePaths(
  admin: SupabaseClient,
  prefix: string,
  paths: Set<string>,
  depth = 0
): Promise<void> {
  if (depth > 4) return; // guard against unexpectedly deep/cyclical structures
  const { data: entries, error } = await admin.storage.from(STORAGE_BUCKET).list(prefix);
  if (error || !entries) return;

  for (const entry of entries) {
    const entryPath = `${prefix}/${entry.name}`;
    if (entry.id === null) {
      await collectStoragePaths(admin, entryPath, paths, depth + 1);
    } else {
      paths.add(entryPath);
    }
  }
}
