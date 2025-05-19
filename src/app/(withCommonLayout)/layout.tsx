// CommonLayout component
import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";
import { Toaster } from "sonner";

const CommonLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);
  return (
    <>
      <Navbar session={session} />
      <main className="min-h-screen">{children}</main>
      <Toaster position="top-center" richColors toastOptions={{
        style: {
          backgroundColor: "#F98700",
          color: "#ffffff",
        },
      }} />
      <Footer />
    </>
  );
};

export default CommonLayout;
