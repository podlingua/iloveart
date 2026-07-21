import { LocalNotifications } from "@capacitor/local-notifications";

const REMINDER_ID = 1;

// One fixed, cancelable local notification - scheduling a new one replaces
// the last one rather than stacking duplicates.
export async function schedulePracticeReminder(hoursFromNow: number): Promise<boolean> {
  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display !== "granted") {
      const { display: requested } = await LocalNotifications.requestPermissions();
      if (requested !== "granted") return false;
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title: "Speech Coach",
          body: "Time for today's speaking practice.",
          schedule: { at: new Date(Date.now() + hoursFromNow * 60 * 60 * 1000) },
        },
      ],
    });
    return true;
  } catch {
    // Not running on a platform with local notification support (e.g. plain web).
    return false;
  }
}

export async function cancelPracticeReminder(): Promise<void> {
  try {
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  } catch {
    // Nothing to cancel on this platform.
  }
}
