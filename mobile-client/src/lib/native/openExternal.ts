import { Browser } from "@capacitor/browser";

// In a Capacitor WebView, a plain <a target="_blank"> either does nothing or
// navigates the whole app away from itself. Browser.open() presents an
// in-app SFSafariViewController on iOS instead, keeping the app in the
// foreground - App.open() falls back to a normal new-tab window.open() when
// there's no native Browser implementation (i.e. running as a plain website).
export async function openExternal(url: string): Promise<void> {
  try {
    await Browser.open({ url });
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
