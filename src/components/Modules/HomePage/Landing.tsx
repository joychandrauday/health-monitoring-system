'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Monitor, Lock, Calendar, MessageSquare, UserPlus, Heart, StethoscopeIcon, File } from 'lucide-react';
import BannerSlider from './BannerSlider';
import ServiceCard from './ServiceCard';
import { Accordion, AccordionContent } from '@radix-ui/react-accordion';
import { AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TextHoverEffect } from '@/components/ui/text-hover-effect';
import DocSectionHome from './DocSection/DocSectionHome';
import { IDoctor } from '@/types';
import TestimonialsSection from './TestimonialSection';
interface LandingProps {
    doctors: IDoctor[];
}

const features = [
    { title: 'Real-Time Monitoring', description: 'Track vitals instantly with advanced sensors.', icon: Monitor },
    { title: 'Secure Data', description: 'Your health data is protected with end-to-end encryption.', icon: Lock },
    { title: 'Easy Appointments', description: 'Schedule consultations in just a few clicks.', icon: Calendar },
    { title: '24/7 Support', description: 'Access help anytime through our chat system.', icon: MessageSquare },
];

const steps = [
    { title: 'Sign Up', description: 'Create your account in minutes.', icon: <UserPlus size={48} className="text-white" /> },
    { title: 'Monitor Health', description: 'Use our tools to track your vitals.', icon: <Heart size={48} className="text-white" /> },
    { title: 'Consult Doctors', description: 'Book virtual appointments with ease.', icon: <StethoscopeIcon size={48} className="text-white" /> },
    { title: 'Get Prescription', description: 'Get A Automated prescription provided by certified Doctors.', icon: <File size={48} className="text-white" /> },
];

// const pricingPlans = [
//     { name: 'Basic', price: 'Free', features: ['Vital Tracking', 'Limited Consultations', 'Basic Support'], cta: 'Get Started' },
//     { name: 'Premium', price: '$19/mo', features: ['Advanced Monitoring', 'Unlimited Consultations', 'Priority Support'], cta: 'Choose Premium' },
// ];

const faqs = [
    { question: 'How secure is my data?', answer: 'We use end-to-end encryption to ensure your health data is fully protected.' },
    { question: 'Can I consult with any doctor?', answer: 'Yes, choose from a wide range of certified professionals on our platform.' },
    { question: 'Is the system easy to use?', answer: 'Our intuitive interface is designed for users of all ages.' },
];

const Landing: React.FC<LandingProps> = ({ doctors }) => {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    const stagger = {
        visible: { transition: { staggerChildren: 0.2 } },
    };

    return (
        <div className="w-full bg-white">
            {/* Hero Section with BannerSlider */}
            <section className="relative">
                <BannerSlider />
            </section>

            {/* How It Works Section */}
            <section className="flex items-center justify-center min-h-screen  bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 md:px-8">
                    <motion.h2
                        className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 text-center"
                        variants={fadeIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        How It Works
                    </motion.h2>
                    <motion.div
                        className="mt-8 flex flex-col sm:flex-row justify-between gap-6 relative"
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                className="flex-1 group pb-4 text-center bg-white/10 backdrop-blur-2xl rounded-lg step-card shadow"
                                variants={fadeIn}

                            >
                                <div className="flex justify-center items-center w-full h-40 mb-4 rounded-b-none rounded-lg bg-primary bg-no-repeat bg-blend-overlay group-hover:bg-blend-soft-light relative"
                                >
                                    {step.icon}
                                </div>
                                <TextHoverEffect text={`${index + 1}`} />
                                <h3 className="text-lg font-semibold text-secondary">{step.title}</h3>
                                <p className="mt-2 text-sm text-gray-600">{step.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>
            {/* Services Section */}

            <div className="">
                <ServiceCard />
            </div>

            {/* Features Section */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 sm:px-6 md:px-8">
                    <motion.h2
                        className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 text-center"
                        variants={fadeIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        Our Key Features
                    </motion.h2>
                    <motion.div
                        className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="bg-white rounded-lg shadow-md p-6 text-center border-gray-100 border"
                                variants={fadeIn}
                            >
                                <feature.icon className="w-8 h-8 text-teal-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-800">{feature.title}</h3>
                                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>



            {/* Pricing Section
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 sm:px-6 md:px-8">
                    <motion.h2
                        className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 text-center"
                        variants={fadeIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        Pricing Plans
                    </motion.h2>
                    <motion.div
                        className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6"
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {pricingPlans.map((plan, index) => (
                            <motion.div
                                key={index}
                                className="bg-white rounded-lg shadow-md p-6 text-center"
                                variants={fadeIn}
                            >
                                <h3 className="text-xl font-semibold text-gray-800">{plan.name}</h3>
                                <p className="mt-2 text-2xl font-bold text-teal-600">{plan.price}</p>
                                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center justify-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-teal-600" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/register"
                                    className="mt-6 inline-block px-6 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors duration-200"
                                    aria-label={`Choose ${plan.name}`}
                                >
                                    {plan.cta}
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section> */}

            <TestimonialsSection />

            <DocSectionHome doctors={doctors} />
            {/* Call-to-Action Section */}
            <section className="bg-primary py-12 md:py-16">
                <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center">
                    <motion.h2
                        className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white"
                        variants={fadeIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        Start Your Healthcare Journey Today
                    </motion.h2>
                    <motion.p
                        className="mt-4 text-sm sm:text-base md:text-lg text-teal-100 max-w-xl mx-auto"
                        variants={fadeIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        Join thousands of users who trust our platform for their health needs.
                    </motion.p>
                    <motion.div
                        variants={fadeIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <Link
                            href="/register"
                            className="mt-6 inline-block px-6 sm:px-8 py-2 sm:py-3 bg-white text-primary text-sm sm:text-base font-medium rounded-full hover:bg-gray-100 transition-colors duration-200"
                            aria-label="Sign Up Now"
                        >
                            Sign Up Now
                        </Link>
                    </motion.div>
                </div>
            </section>
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 sm:px-6 md:px-8">
                    <motion.h2
                        className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 text-center"
                        variants={fadeIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        Frequently Asked Questions
                    </motion.h2>
                    <motion.div
                        className="mt-8 max-w-3xl mx-auto"
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <Accordion type="single" collapsible className="space-y-4">
                            {faqs.map((faq, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeIn}
                                >
                                    <AccordionItem value={`item-${index}`} className="bg-white rounded-lg shadow-md">
                                        <AccordionTrigger className="text-lg font-medium text-gray-800 px-4 sm:px-6 py-4 hover:no-underline">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-sm text-gray-600 px-4 sm:px-6 pb-4">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                </motion.div>
                            ))}
                        </Accordion>
                    </motion.div>
                </div>
            </section>
        </div >
    );
};

export default Landing;