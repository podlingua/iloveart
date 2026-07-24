import type { Metadata } from "next";
import { AlarmWatcher } from "@/components/AlarmWatcher";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rise",
  description: "The operating system for mornings.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full min-h-screen bg-black antialiased">
        <AlarmWatcher />
        {children}
      </body>
    </html>
  );
}
