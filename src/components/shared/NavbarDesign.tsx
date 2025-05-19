"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
export interface Session {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    image?: string | null;
  };
}

const NavbarDesign = ({ session }: { session: Session | null }) => {
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolling(true);
      } else {
        setScrolling(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  return (
    <div
      className={`fixed w-full md:justify-around z-50 flex justify-between border-b px-8 py-3 border-gray-500 transition-all duration-300 ${scrolling ? "backdrop-blur-md bg-opacity-75 " : "bg-transparent"
        }`}
    >
      {/* Navbar Start */}
      <div className="navbar-start flex items-center gap-4 w-1/3">
        <Link href="/">
          <Image src="https://i.ibb.co/K0NmH2J/favicon.png" width={30} height={30} alt="Logo" priority />
        </Link>
      </div>

      {/* Navbar End */}
      <div className="navbar-end flex items-center justify-end gap-4 w-1/3">
        {/* User Dropdown */}
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="btn btn-ghost btn-circle avatar">
              <Image src={session.user.image || "https://i.ibb.co/K0NmH2J/favicon.png"} width={40} height={40} alt="User Avatar" className="rounded-full" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44">
              <DropdownMenuItem className="font-bold">
                Welcome,<br />
                <h1>{session.user?.name ?? 'Unknown'}</h1>
              </DropdownMenuItem>

              {session.user?.role && (
                <DropdownMenuItem className="font-bold">
                  <Link href={`/${session.user.role}/dashboard`} className="w-full">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>

          </DropdownMenu>
        ) : (
          <Link href="/login" className="btn btn-outline">
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};



export default NavbarDesign;
