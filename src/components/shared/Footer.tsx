import Link from 'next/link';
import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-secondary py-8">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center text-white">
                <p className="text-xs sm:text-sm">
                    &copy; 2025 Remote Healthcare Monitoring System. All rights reserved.
                </p>
                <div className="mt-4 flex justify-center gap-4">
                    <Link href="/about" className="text-xs sm:text-sm hover:text-teal-400 transition-colors">
                        About
                    </Link>
                    <Link href="/contact" className="text-xs sm:text-sm hover:text-teal-400 transition-colors">
                        Contact
                    </Link>
                    <Link href="/privacy" className="text-xs sm:text-sm hover:text-teal-400 transition-colors">
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
