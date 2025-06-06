import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import SessionProviders from "@/lib/sessionProviders";
import StoreProvider from "@/lib/storeProvider";
import ChatIconModal from "@/components/Modules/Chat/ChatIconModal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { SocketProvider } from "@/lib/SocketContext";
import { GlobalVideoCallHandler } from "@/lib/GlobalVideoCallHandler";

export const metadata: Metadata = {
  title: "Joy Chandra Uday | Full Stack Developer",
  description: "I am a passionate MERN Stack Developer specializing in building dynamic and responsive web applications",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en" data-theme="light" className="font-sans">
      <head />
      <body>
        <SessionProviders>
          <SocketProvider>
            <GlobalVideoCallHandler>

              <StoreProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="light"
                  enableSystem={false}
                  forcedTheme="light"
                >
                  <div className="">
                    <main className="min-h-screen  overflow-hidden">{children}</main>
                    {
                      session?.user &&
                      <ChatIconModal />
                    }
                  </div>
                  <Toaster />
                </ThemeProvider>
              </StoreProvider>
            </GlobalVideoCallHandler>
          </SocketProvider>
        </SessionProviders>
      </body>
    </html >
  );
}