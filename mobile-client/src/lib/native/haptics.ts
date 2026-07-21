import { Haptics, ImpactStyle } from "@capacitor/haptics";

// @capacitor/haptics already falls back to the Vibration API on web, but
// older/unsupported browsers throw - never let haptics feedback break a
// user-facing action.
export async function hapticImpact(style: ImpactStyle = ImpactStyle.Light): Promise<void> {
  try {
    await Haptics.impact({ style });
  } catch {
    // No haptics support on this platform/browser - ignore.
  }
}
