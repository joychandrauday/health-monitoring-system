'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { signOut } from 'next-auth/react';
import { Phone, Mail } from 'lucide-react';
import NotificationBell from '../Modules/Notifications/NotificationBell';
import { useNotifications } from '@/hooks/useNotification';
import { useMessages } from '@/hooks/useMessages';
import useSocket from '@/hooks/useSocket';

export interface Session {
  user?: {
    name?: string | null;
    accessToken?: string | null;
    email?: string | null;
    role?: string | null;
    avatar?: string | null;
    id?: string | null;
  };
}

const NavbarDesign = ({ session }: { session: Session | null }) => {
  const [scrolling, setScrolling] = useState(false);
  const { notifications, acknowledgeNotification } = useNotifications();
  const { socket } = useSocket();
  const { logout } = useMessages(session?.user?.id as string, socket);
  const navbarRef = useRef<HTMLElement>(null);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight);
    }
  }, [navbarRef]);

  const handleLogout = async () => {
    await logout();
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      {/* Placeholder to prevent content shift */}
      {scrolling && <div style={{ height: `${navbarHeight}px` }} aria-hidden="true" />}

      <header
        ref={navbarRef}
        className={`w-full transition-all duration-300 z-50 ${scrolling ? 'fixed top-0 left-0 right-0 shadow-sm' : ''}`}
      >
        {/* Top Row: Contact Info and User Actions */}
        <div
          className={`bg-secondary text-white py-2 px-2 sm:px-4 md:px-8 flex flex-wrap justify-between items-center text-sm transition-all duration-300 ${scrolling ? 'backdrop-blur-md bg-opacity-70' : 'bg-opacity-100'}`}
          aria-label="Contact and User Actions"
        >
          {/* Left: Contact Info */}
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="tel:+1234567890"
              className="flex items-center gap-1.5 hover:text-gray-300 transition-colors duration-200 text-xs sm:text-sm"
              aria-label="Contact Phone Number"
            >
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">+1 (234) 567-890</span>
              <span className="sm:hidden">Call Us</span>
            </a>
            <a
              href="mailto:support@remotehealth.com"
              className="flex items-center gap-1.5 hover:text-gray-300 transition-colors duration-200 text-xs sm:text-sm"
              aria-label="Contact Email"
            >
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">support@remotehealth.com</span>
              <span className="sm:hidden">Email Us</span>
            </a>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {session?.user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="flex items-center border gap-2 text-white hover:bg-gray-700/50 rounded-full px-2 sm:px-3 py-1.5 transition-colors duration-200"
                    aria-label={`User menu for ${session.user.name ?? 'User'}`}
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 flex items-center rounded-full overflow-hidden">
                      <Image
                        src={session.user.avatar || '/avatar_male.png'}
                        width={28}
                        height={28}
                        sizes="(max-width: 640px) 24px, 28px"
                        alt="Profile picture"
                        className="object-cover"
                        priority
                      />
                    </div>
                    <span className="hidden md:inline text-xs sm:text-sm">{session.user.name ?? 'unknown'}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-white shadow-lg rounded-md border-none mt-2">
                    <DropdownMenuItem className="px-3 py-2 text-gray-700 text-sm">
                      Welcome, {session.user.name ?? 'unknown'}
                    </DropdownMenuItem>
                    {session.user.role && (
                      <DropdownMenuItem className="px-3 py-2">
                        <Link
                          href={`/${session.user.role}/dashboard`}
                          className="w-full text-gray-700 hover:text-teal-600 text-sm transition-colors"
                        >
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="px-3 py-2 text-gray-700 hover:text-red-500 text-sm cursor-pointer"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <NotificationBell acknowledgeNotification={acknowledgeNotification} notifications={notifications} />
              </>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/login"
                  className="text-xs sm:text-sm hover:text-primary transition-colors"
                  aria-label="Sign In"
                >
                  Sign In
                </Link>
                <span className="text-gray-400">/</span>
                <Link
                  href="/register"
                  className="text-xs sm:text-sm hover:text-primary transition-colors"
                  aria-label="Register"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row: Main Navigation */}
        <div
          className={`flex justify-between items-center px-2 sm:px-4 md:px-8 py-2 sm:py-3 bg-white border-b border-gray-100 transition-all duration-300 ${scrolling ? 'backdrop-blur-md bg-opacity-95 shadow-sm' : 'bg-opacity-100'}`}
          aria-label="Main Navigation"
        >
          {/* Logo */}
          <div className="flex items-center w-1/3 gap-1 sm:gap-2">
            <Link href="/" className="flex items-center gap-1" aria-label="Remote Health Monitoring System Home">
              <Image
                src="https://res.cloudinary.com/dklikxmpm/image/upload/v1748054896/image_fjiqey.png"
                width={36}
                height={36}
                alt="Remote Health Monitoring System Logo"
                className="sm:w-12 sm:h-12"
                priority
              />
              <span className="text-base sm:text-lg md:text-xl font-bold leading-tight text-gray-900 hidden sm:inline">
                Remote Healthcare<br />
                Monitoring System
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex w-1/3 justify-center items-center gap-4 lg:gap-6">
            <Link
              href="/"
              className="text-gray-700 font-bold text-sm lg:text-md hover:text-primary transition-colors duration-200"
              aria-label="Home"
            >
              Home
            </Link>
            <Link
              href="/services"
              className="text-gray-700 font-bold text-sm lg:text-md hover:text-primary transition-colors duration-200"
              aria-label="Services"
            >
              Services
            </Link>
            <Link
              href="/about"
              className="text-gray-700 font-bold text-sm lg:text-md hover:text-primary transition-colors duration-200"
              aria-label="About"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 font-bold text-sm lg:text-md hover:text-primary transition-colors duration-200"
              aria-label="Contact"
            >
              Contact
            </Link>
          </nav>

          {/* Call to Action and Mobile Menu */}
          <div className="flex justify-end w-1/3 gap-2 sm:gap-3">
            {
              session?.user?.role === 'patient' ? <Link
                href={`${session?.user?.role}/dashboard/appointments/`}
                className="px-2 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-full text-xs sm:text-sm whitespace-nowrap hover:bg-teal-700 transition-colors duration-200 flex items-center"
                aria-label="Book Appointment"
              >
                Book Appointment
              </Link> :
                <Link
                  href={`${session?.user?.role}/dashboard/appointments/`}
                  className="px-2 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-full text-xs sm:text-sm whitespace-nowrap hover:bg-teal-700 transition-colors duration-200 flex items-center"
                  aria-label="Book Appointment"
                >
                  View Appointments
                </Link>
            }
            <DropdownMenu onOpenChange={setIsMobileMenuOpen}>
              <DropdownMenuTrigger
                className="lg:hidden p-2 sm:p-3 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Mobile Menu"
                aria-expanded={isMobileMenuOpen}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white shadow-lg rounded-md border-none mt-2">
                <DropdownMenuItem>
                  <Link href="/" className="w-full text-gray-700 hover:text-teal-600 text-sm transition-colors py-2">
                    Home
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/services" className="w-full text-gray-700 hover:text-teal-600 text-sm transition-colors py-2">
                    Services
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/about" className="w-full text-gray-700 hover:text-teal-600 text-sm transition-colors py-2">
                    About
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/contact" className="w-full text-gray-700 hover:text-teal-600 text-sm transition-colors py-2">
                    Contact
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
};

export default NavbarDesign;