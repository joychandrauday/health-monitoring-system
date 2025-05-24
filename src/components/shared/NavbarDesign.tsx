'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { signOut } from 'next-auth/react';
import { Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';
import NotificationBell from '../Modules/Notifications/NotificationBell';
import { useNotifications } from '@/hooks/useNotification';

export interface Session {
  user?: {
    name?: string | null;
    accessToken?: string | null;
    email?: string | null;
    role?: string | null;
    avatar?: string | null;
    id?: string | null; // Added for notification fetching
  };
}

const NavbarDesign = ({ session }: { session: Session | null }) => {
  const [scrolling, setScrolling] = useState(false);
  const { notifications, acknowledgeNotification, } = useNotifications()

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  return (
    <header className="fixed w-full z-50 transition-all duration-300 font-sans">
      {/* Top Row: Contact Info and User Actions */}
      <div
        className={`bg-secondary text-white py-3 px-6 md:px-12 flex justify-between items-center text-sm ${scrolling ? 'backdrop-blur-md bg-opacity-95' : 'bg-opacity-100'
          }`}
        aria-label="Contact and User Actions"
      >
        {/* Left: Contact Info and Social Links */}
        <div className="flex items-center gap-6">
          <a
            href="tel:+1234567890"
            className="flex items-center gap-2 hover:text-blue-300 transition-colors duration-200"
            aria-label="Contact Phone Number"
          >
            <Phone className="w-4 h-4" />
            <span>+1 (234) 567-890</span>
          </a>
          <a
            href="mailto:support@remotehealth.com"
            className="flex items-center gap-2 hover:text-blue-300 transition-colors duration-200"
            aria-label="Contact Email"
          >
            <Mail className="w-4 h-4" />
            <span>support@remotehealth.com</span>
          </a>
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-300 transition-colors duration-200"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-300 transition-colors duration-200"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-300 transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex items-center gap-2 text-white hover:bg-blue-700/50 rounded-full px-3 py-1 transition-colors duration-200"
                  aria-label={`User menu for ${session.user.name ?? 'User'}`}
                >
                  <Image
                    src={session.user.avatar || '/avatar_male.png'}
                    width={32}
                    height={32}
                    alt="User Avatar"
                    className="rounded-full"
                    priority
                  />
                  <span className="hidden md:inline font-medium">{session.user.name ?? 'User'}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white shadow-xl rounded-lg border-none mt-2">
                  <DropdownMenuItem className="px-4 py-3 text-gray-800 font-semibold">
                    Welcome, {session.user.name ?? 'User'}
                  </DropdownMenuItem>
                  {session.user.role && (
                    <DropdownMenuItem className="px-4 py-3">
                      <Link
                        href={`/${session.user.role}/dashboard`}
                        className="w-full text-gray-800 hover:text-blue-600 transition-colors"
                      >
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="px-4 py-3 text-gray-800 hover:text-red-600 cursor-pointer"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <NotificationBell acknowledgeNotification={acknowledgeNotification} notifications={notifications} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 hover:underline"
                aria-label="Sign In"
              >
                Sign In
              </Link>
              /
              <Link
                href="/register"
                className="px-4 py-2 hover:underline"
                aria-label="Sign In"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Bottom Row: Main Navigation */}
      <div
        className={`flex justify-between items-center px-6 md:px-12 py-4 border-b border-gray-200 ${scrolling ? 'backdrop-blur-md bg-white/95' : 'bg-white'
          }`}
        aria-label="Main Navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Remote Health Monitoring System Home">
            <Image
              src="https://res.cloudinary.com/dklikxmpm/image/upload/v1748054375/telemiconwhite_dbpbmr.png"
              width={48}
              height={48}
              alt="Remote Health Monitoring System Logo"
              priority
            />
          </Link>
          <span className="text-2xl leading-none font-bold text-gray-900 hidden md:inline">
            Remote Health<br />Monitoring System
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-10">
          <Link
            href="/"
            className="text-gray-700 text-lg hover:text-blue-600 transition-colors duration-200"
            aria-label="Home"
          >
            Home
          </Link>
          <Link
            href="/services"
            className="text-gray-700 text-lg hover:text-blue-600 transition-colors duration-200"
            aria-label="Services"
          >
            Services
          </Link>
          <Link
            href="/about"
            className="text-gray-700 text-lg hover:text-blue-600 transition-colors duration-200"
            aria-label="About"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-gray-700 text-lg hover:text-blue-600 transition-colors duration-200"
            aria-label="Contact"
          >
            Contact
          </Link>
        </nav>

        {/* Call to Action */}
        <div className="flex items-center gap-4">
          <Link
            href="/appointment"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg font-medium"
            aria-label="Book Appointment"
          >
            Book Appointment
          </Link>
          {/* Mobile Menu Toggle (Hidden on Desktop) */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Mobile Menu"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white shadow-xl rounded-lg border-none mt-2">
              <DropdownMenuItem>
                <Link href="/" className="w-full text-gray-800 hover:text-blue-600 transition-colors py-2">
                  Home
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/services" className="w-full text-gray-800 hover:text-blue-600 transition-colors py-2">
                  Services
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/about" className="w-full text-gray-800 hover:text-blue-600 transition-colors py-2">
                  About
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/contact" className="w-full text-gray-800 hover:text-blue-600 transition-colors py-2">
                  Contact
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <NotificationBell acknowledgeNotification={acknowledgeNotification} notifications={notifications} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header >
  );
};

export default NavbarDesign;