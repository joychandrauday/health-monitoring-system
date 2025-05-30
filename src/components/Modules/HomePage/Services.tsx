'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Stethoscope, HeartPulse, Video, UserCheck } from 'lucide-react';

const services = [
    {
        title: 'Remote Health Monitoring',
        description:
            'Track your vital signs in real-time with our advanced monitoring tools. Stay connected with healthcare professionals for timely insights and support.',
        icon: HeartPulse,
        image: 'https://res.cloudinary.com/dklikxmpm/image/upload/v1748288034/pexels-shvetsa-3683051_p65fba.jpg',
        link: '/register',
        cta: 'Get Started',
    },
    {
        title: 'Teleconsultation Appointments',
        description:
            'Schedule virtual consultations with top doctors from the comfort of your home. Enjoy flexible, secure, and convenient healthcare access.',
        icon: Video,
        image: 'https://res.cloudinary.com/dklikxmpm/image/upload/v1748287841/pexels-karolina-grabowska-7195084_kqe7g5.jpg',
        link: '/appointment',
        cta: 'Book Now',
    },
    {
        title: 'Personalized Health Insights',
        description:
            'Receive tailored health recommendations based on your data. Our platform provides actionable insights to improve your well-being.',
        icon: UserCheck,
        image: 'https://res.cloudinary.com/dklikxmpm/image/upload/v1748284819/pexels-shvetsa-3683101_ujalnr.jpg',
        link: '/register',
        cta: 'Explore Insights',
    },
    {
        title: 'Real-Time Support',
        description:
            'Connect instantly with healthcare providers through our integrated chat system for quick answers and ongoing care.',
        icon: Stethoscope,
        image: 'https://res.cloudinary.com/dklikxmpm/image/upload/v1748287944/pexels-padrinan-745365_ftmz4i.jpg',
        link: '/contact',
        cta: 'Contact Us',
    },
];

const Services: React.FC = () => {
    return (
        <div className="w-full bg-white pt-16 md:pt-20">
            {/* Header Section */}
            <section className="bg-gray-50 py-12 md:py-16">
                <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-800">
                        Our Services
                    </h1>
                    <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover how our Remote Healthcare Monitoring System empowers you with cutting-edge tools and personalized care.
                    </p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 sm:px-6 md:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                            >
                                <div className="relative w-full h-40 sm:h-48">
                                    <Image
                                        src={service.image}
                                        alt={service.title}
                                        fill
                                        className="object-cover"
                                        priority={index === 0}
                                    />
                                </div>
                                <div className="p-4 sm:p-6 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <service.icon className="w-5 h-5 text-teal-600" />
                                        <h3 className="text-lg sm:text-xl font-medium text-gray-800">
                                            {service.title}
                                        </h3>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        {service.description}
                                    </p>
                                    <Link
                                        href={service.link}
                                        className="inline-block px-4 py-1.5 sm:px-5 sm:py-2 bg-teal-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-teal-700 transition-colors duration-200"
                                        aria-label={service.cta}
                                    >
                                        {service.cta}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call-to-Action Section */}
            <section className="bg-teal-600 py-12 md:py-16">
                <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white">
                        Ready to Transform Your Healthcare Experience?
                    </h2>
                    <p className="mt-4 text-sm sm:text-base md:text-lg text-teal-100 max-w-xl mx-auto">
                        Join our platform today and take control of your health with our innovative solutions.
                    </p>
                    <Link
                        href="/register"
                        className="mt-6 inline-block px-6 sm:px-8 py-2 sm:py-3 bg-white text-teal-600 text-sm sm:text-base font-medium rounded-md hover:bg-gray-100 transition-colors duration-200"
                        aria-label="Get Started Now"
                    >
                        Get Started Now
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Services;