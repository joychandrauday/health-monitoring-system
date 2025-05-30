'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import type { Swiper as SwiperType } from 'swiper';

interface Banner {
    title: string;
    description: string;
    image: string;
    cta: string;
    link: string;
}

const banners: Banner[] = [
    {
        title: 'Monitor Your Health Anytime, Anywhere',
        description: 'Track vital signs and stay connected with healthcare professionals remotely.',
        image: 'https://res.cloudinary.com/dklikxmpm/image/upload/v1748284819/pexels-gustavo-fring-3985166_fyvwvz.jpg',
        cta: 'Learn More',
        link: '/services',
    },
    {
        title: 'Book Appointments with Ease',
        description: 'Schedule consultations with top doctors from the comfort of your home.',
        image: 'https://res.cloudinary.com/dklikxmpm/image/upload/v1748284832/pexels-shvetsa-4225920_ovvivd.jpg',
        cta: 'Book Now',
        link: '/appointment',
    },
    {
        title: 'Personalized Care at Your Fingertips',
        description: 'Access tailored health insights and real-time support.',
        image: 'https://res.cloudinary.com/dklikxmpm/image/upload/v1748284834/julia-zyablova-S1v7hVUiCg0-unsplash_z3e9dm.jpg',
        cta: 'Get Started',
        link: '/register',
    },
];

const BannerSlider: React.FC = () => {
    const swiperRef = useRef<SwiperType | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    return (
        <div className="relative w-full h-[24rem] sm:h-[28rem] md:h-[32rem] lg:h-[36rem] overflow-hidden">
            <Swiper
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
                loop={true}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                slidesPerView={1}
                allowTouchMove={true}
                className="h-full"
            >
                {banners.map((banner, index) => (
                    <SwiperSlide key={index}>
                        <div
                            className="relative w-full h-full bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${banner.image})`,
                            }}
                        >
                            <div className="absolute inset-0 bg-black bg-opacity-50" />
                            <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-4 sm:px-8">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-md animate-fadeIn">
                                    {banner.title}
                                </h2>
                                <p className="text-sm sm:text-base md:text-lg text-gray-200 mt-2 sm:mt-4 max-w-xl animate-fadeIn delay-100">
                                    {banner.description}
                                </p>
                                <a
                                    href={banner.link}
                                    className="mt-4 sm:mt-6 inline-block px-6 py-2 bg-secondary hover:bg-teal-600 text-white font-medium rounded-full shadow-lg transition duration-300 animate-fadeIn delay-200"
                                >
                                    {banner.cta}
                                </a>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Navigation Arrows */}
            <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-20"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button
                onClick={() => swiperRef.current?.slideNext()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-20"
                aria-label="Next slide"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => swiperRef.current?.slideToLoop(index)}
                        className={`w-2 h-2 rounded-full ${currentIndex === index ? 'bg-teal-400 scale-125' : 'bg-white/50'} transition-all`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default BannerSlider;
