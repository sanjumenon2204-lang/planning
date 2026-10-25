export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { PersonProvider } from "@/components/PersonContext";
import { getProfiles, isSupabaseConfigured } from "@/lib/data";
import { Profile } from "@/lib/types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Our Household Budget",
  description: "A calm, shared monthly budget for the two of us.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  let profiles: Profile[] = [];
  if (isSupabaseConfigured) {
    try {
      profiles = await getProfiles();
    } catch {
      profiles = [];
    }
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PersonProvider profiles={profiles}>
          <NavBar />
          <main className="flex-1">{children}</main>
        </PersonProvider>
      </body>
    </html>
  );
}
