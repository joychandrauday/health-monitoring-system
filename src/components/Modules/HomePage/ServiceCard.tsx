'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Video, UserCheck } from 'lucide-react';
import Link from 'next/link';

interface Service {
    title: string;
    subtitle: string;
    icon: React.ElementType;
    link: string;
}

const boxContent: Service[] = [
    {
        title: 'Remote Health Monitoring',
        subtitle: 'Track vital signs in real-time with seamless professional support.',
        icon: HeartPulse,
        link: '/register',
    },
    {
        title: 'Teleconsultation',
        subtitle: 'Book virtual appointments with top doctors anytime.',
        icon: Video,
        link: '/appointment',
    },
    {
        title: 'Personalized Insights',
        subtitle: 'Get tailored health recommendations based on your data.',
        icon: UserCheck,
        link: '/register',
    },
];

const ServiceCard: React.FC = () => {
    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
        hover: { scale: 1.05, transition: { duration: 0.3 } },
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    return (
        <div
            className="w-full py-16 bg-gradient-to-br from-[#14532d] via-[#1e4620] to-[#1b3020] text-white relative bg-cover bg-center"
            style={{
                backgroundImage: `url('https://res.cloudinary.com/dklikxmpm/image/upload/v1748319901/pexels-zandatsu-32213424_ij58kb.jpg'), linear-gradient(to bottom right, #14532d, #1e4620, #1b3020)`,
                backgroundBlendMode: 'overlay',
                backgroundColor: 'rgba(107, 114, 128, 0.7)', // Secondary color overlay
            }}
        >
            <div className="absolute inset-0 bg-black/20 z-0" />

            <motion.h2
                className="text-3xl sm:text-4xl font-bold text-center relative z-10"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
            >
                Why Choose Our System?
            </motion.h2>

            <motion.p
                className="mt-4 text-base sm:text-lg text-center max-w-2xl mx-auto relative z-10 text-white/80"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
            >
                Experience innovative healthcare with tools designed for your well-being.
            </motion.p>

            <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 mt-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {boxContent.map((service, index) => (
                        <motion.div
                            key={index}
                            className="bg-white/10 border-2 border-white/50 rounded-xl shadow-xl backdrop-blur-xl p-6 group transition duration-300"
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            whileHover="hover"
                            viewport={{ once: true }}
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <service.icon className="w-12 h-12 text-white group-hover:drop-shadow-[0_0_15px_rgba(46,125,50,0.9)] transition duration-300" />
                                <h3 className="text-xl font-semibold text-white drop-shadow-md">
                                    {service.title}
                                </h3>
                                <p className="text-white/90 text-sm">{service.subtitle}</p>
                                <Link
                                    href={service.link}
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#2E7D32] hover:bg-[#256429] rounded-md text-white text-sm font-medium transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(46,125,50,0.6)]"
                                >
                                    Learn More
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;
