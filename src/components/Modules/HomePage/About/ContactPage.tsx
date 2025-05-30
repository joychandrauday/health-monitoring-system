'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate form submission (replace with actual API call)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsSubmitting(false);
        setFormData({ name: '', email: '', message: '' });
        alert('Message sent successfully!');
    };

    return (
        <div className="w-full bg-white">
            {/* Header Section */}
            <section className=" py-12 md:py-16">
                <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center">
                    <motion.h1
                        className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-800"
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                    >
                        Contact Us
                    </motion.h1>
                    <motion.p
                        className="mt-4 text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto"
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                    >
                        We’re here to assist you. Reach out with any questions or to learn more about our services.
                    </motion.p>
                </div>
            </section>

            {/* Contact Form & Info Section */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 sm:px-6 md:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Form */}
                        <motion.div
                            className="bg-white rounded-lg shadow-md p-6 sm:p-8"
                            variants={fadeIn}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
                                Send Us a Message
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                                        rows={4}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2 bg-secondary text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors duration-200 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </motion.div>

                        {/* Contact Info */}
                        <motion.div
                            className="space-y-6"
                            variants={fadeIn}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">Get in Touch</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-teal-600" />
                                    <a href="tel:+1234567890" className="text-sm text-gray-600 hover:text-teal-600">
                                        +1 (234) 567-890
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-teal-600" />
                                    <a href="mailto:support@remotehealth.com" className="text-sm text-gray-600 hover:text-teal-600">
                                        support@remotehealth.com
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-teal-600" />
                                    <p className="text-sm text-gray-600">123 Health St, Wellness City, USA</p>
                                </div>
                            </div>
                            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                                <p className="text-sm text-gray-600">Map Placeholder (Embed Google Maps here)</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;