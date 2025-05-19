import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import SessionProviders from "@/lib/sessionProviders";
import StoreProvider from "@/lib/storeProvider";

export const metadata: Metadata = {
  title: "Joy Chandra Uday | Full Stack Developer",
  description: "I am a passionate MERN Stack Developer specializing in building dynamic and responsive web applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" className="font-sans">
      <head />
      <body>
        <SessionProviders>
          <StoreProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              forcedTheme="light"
            >
              <div className="flex">
                <main className="min-h-screen flex-1">{children}</main>
              </div>
              <Toaster />
            </ThemeProvider>
          </StoreProvider>
        </SessionProviders>
      </body>
    </html>
  );
}