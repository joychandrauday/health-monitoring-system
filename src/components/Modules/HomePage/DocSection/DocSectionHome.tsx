'use client';

import React from 'react';
import { IDoctor } from '@/types';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface DocSectionHomeProps {
    doctors: IDoctor[];
}

const DocSectionHome: React.FC<DocSectionHomeProps> = ({ doctors }) => {
    // Animation variants for card hover and overlay
    const cardVariants = {
        rest: { scale: 1, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
        hover: {
            scale: 1.05,
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
            transition: { duration: 0.3, ease: 'easeOut' },
        },
    };

    const overlayVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    // Swiper configuration
    const swiperSettings = {
        slidesPerView: 3,
        spaceBetween: 24,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: { clickable: true, dynamicBullets: true },
        autoplay: { delay: 4000, disableOnInteraction: true },
        modules: [Navigation, Pagination, Autoplay],
        breakpoints: {
            0: {
                slidesPerView: 1,
                spaceBetween: 16,
            },
            640: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 24,
            },
        },
    };

    return (
        <section className="py-12 md:py-20 ">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10 md:mb-12"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                        Meet Our Expert Doctors
                    </h2>
                    <p className="mt-4 text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                        Connect with our highly qualified medical professionals dedicated to your care.
                    </p>
                </motion.div>

                {doctors.length > 0 ? (
                    <div className="relative ">
                        <Swiper {...swiperSettings} className="mySwiper ">
                            {doctors.map((doctor, index) => (
                                <SwiperSlide key={doctor._id || `doctor-${index}`}>
                                    <motion.div
                                        className="bg-white rounded-2xl p-6  text-center border border-gray-100 relative "
                                        variants={cardVariants}
                                        initial="rest"
                                        whileHover="hover"
                                        whileTap={{ scale: 0.98 }}
                                        role="article"
                                        aria-labelledby={`doctor-name-${doctor._id || index}`}
                                    >
                                        <div className="relative w-28 h-28 mx-auto mb-6 group">
                                            <Image
                                                src={
                                                    typeof doctor.user === 'object' && doctor.user?.avatar
                                                        ? doctor.user.avatar
                                                        : '/default-doctor-avatar.png'
                                                }
                                                alt={
                                                    typeof doctor.user === 'object' && doctor.user?.name
                                                        ? doctor.user.name
                                                        : 'Doctor'
                                                }
                                                fill
                                                className="rounded-full object-cover border-4 border-teal-100"
                                                priority={index < 3}
                                                sizes="(max-width: 640px) 112px, 112px"
                                                placeholder="blur"
                                                blurDataURL="/default-doctor-avatar.png"
                                            />
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-t from-teal-600/80 to-transparent flex items-center justify-center rounded-full backdrop-blur-sm"
                                                variants={overlayVariants}
                                                initial="hidden"
                                                whileHover="visible"
                                            >
                                                <p className="text-sm font-medium text-white">
                                                    {doctor.major || 'Specialist'}
                                                </p>
                                            </motion.div>
                                        </div>
                                        <h3
                                            id={`doctor-name-${doctor._id || index}`}
                                            className="text-xl font-semibold text-gray-800 mb-2"
                                        >
                                            {typeof doctor.user === 'object' && doctor.user?.name
                                                ? doctor.user.name
                                                : 'Unknown Doctor'}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-3">{doctor.major || 'General Practitioner'}</p>

                                    </motion.div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center py-12"
                    >
                        <Image
                            src="/no-doctors.png"
                            alt="No doctors available"
                            width={200}
                            height={200}
                            className="mx-auto mb-4"
                        />
                        <p className="text-lg text-gray-600">No doctors available at the moment.</p>

                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default DocSectionHome;