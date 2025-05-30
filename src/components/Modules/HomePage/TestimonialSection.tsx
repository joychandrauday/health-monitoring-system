'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Sample testimonials data (replace with your actual data source)
const testimonials = [
    {
        name: 'Mill Johnson',
        role: 'Cardiologist',
        quote: 'This platform has transformed how I connect with my patients. The interface is intuitive and efficient!',
        image: 'https://res.cloudinary.com/dklikxmpm/image/upload/v1748625880/download_10_vwcd8k.png',
        rating: 5,
    },
    {
        name: 'Michael Chen',
        role: 'Patient',
        quote: 'Booking appointments and accessing my medical records has never been easier. Highly recommend!',
        image: 'https://res.cloudinary.com/dklikxmpm/image/upload/v1748625857/download_8_aqevb3.png',
        rating: 4,
    },
    {
        name: 'Henry Bean',
        role: 'Patient',
        quote: 'Booking appointments and accessing my medical records has never been easier. Highly recommend!',
        image: 'https://res.cloudinary.com/dklikxmpm/image/upload/v1748625866/download_7_ekrzr5.png',
        rating: 4,
    },
    {
        name: 'Dr. Emily Patel',
        role: 'Pediatrician',
        quote: 'The tools provided here streamline my practice, allowing me to focus on patient care.',
        image: 'https://res.cloudinary.com/dklikxmpm/image/upload/v1748626023/download_12_ouikzy.png',
        rating: 5,
    },
];

// Animation variants
const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const cardVariants = {
    rest: { scale: 1, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
    hover: {
        scale: 1.03,
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
        transition: { duration: 0.3, ease: 'easeOut' },
    },
};

export const TestimonialsSection = () => {
    // Swiper configuration
    const swiperSettings = {
        slidesPerView: 3,
        spaceBetween: 24,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: { clickable: true, dynamicBullets: true },
        autoplay: { delay: 5000, disableOnInteraction: true },
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

    // Star rating component
    const StarRating = ({ rating }: { rating: number }) => (
        <div className="flex justify-center space-x-1 mb-4">
            {[...Array(5)].map((_, i) => (
                <svg
                    key={i}
                    className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );

    return (
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.h2
                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 text-center"
                    variants={fadeIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    What Our Users Say
                </motion.h2>
                <motion.p
                    className="mt-4 text-base md:text-lg text-gray-600 text-center max-w-2xl mx-auto"
                    variants={fadeIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                >
                    Hear from our doctors and patients about their experiences with our platform.
                </motion.p>
                <div className="relative mt-10">
                    <Swiper {...swiperSettings} className="mySwiper">
                        {testimonials.map((testimonial, index) => (
                            <SwiperSlide key={index}>
                                <motion.div
                                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-gray-100/50"
                                    variants={cardVariants}
                                    initial="rest"
                                    whileHover="hover"
                                    whileTap={{ scale: 0.98 }}
                                    role="article"
                                    aria-labelledby={`testimonial-${index}`}
                                >
                                    <div className="relative w-20 h-20 mb-4">
                                        <Image
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            fill
                                            className="rounded-full object-cover border-4 border-teal-100"
                                            priority={index < 3}
                                            sizes="(max-width: 640px) 80px, 80px"
                                            placeholder="blur"
                                            blurDataURL="/default-avatar.png"
                                        />
                                    </div>
                                    <StarRating rating={testimonial.rating} />
                                    <p className="text-sm text-gray-700 italic leading-relaxed mb-4">
                                        &ldquo;{testimonial.quote}&rdquo;
                                    </p>
                                    <h3
                                        id={`testimonial-${index}`}
                                        className="text-lg font-semibold text-gray-800"
                                    >
                                        {testimonial.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    {/* Custom navigation buttons */}
                    <div className="swiper-button-prev bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"></div>
                    <div className="swiper-button-next bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"></div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;