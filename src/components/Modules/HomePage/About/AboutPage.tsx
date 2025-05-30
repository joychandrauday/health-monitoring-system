'use client';

import React from 'react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    const stagger = {
        visible: { transition: { staggerChildren: 0.2 } },
    };

    return (
        <div className="w-full bg-white ">
            {/* Header Section */}
            <section className=" py-12 md:py-16">
                <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center">
                    <motion.h1
                        className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-800"
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                    >
                        About Us
                    </motion.h1>
                    <motion.p
                        className="mt-4 text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto"
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                    >
                        We are dedicated to transforming healthcare through innovative remote monitoring and personalized care solutions.
                    </motion.p>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 sm:px-6 md:px-8">
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <motion.div variants={fadeIn} className="space-y-4">
                            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">Our Mission</h2>
                            <p className="text-sm sm:text-base text-gray-600">
                                To empower individuals with accessible, real-time health monitoring tools, ensuring seamless connections with healthcare professionals for better outcomes.
                            </p>
                        </motion.div>
                        <motion.div variants={fadeIn} className="space-y-4">
                            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">Our Vision</h2>
                            <p className="text-sm sm:text-base text-gray-600">
                                To lead the future of healthcare by integrating cutting-edge technology with compassionate care, making wellness universal.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

        </div>
    );
};

export default About;