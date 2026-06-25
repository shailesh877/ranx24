import React from 'react';
import { Link } from 'react-router-dom';
import { LucideFacebook, LucideTwitter, LucideInstagram, LucideLinkedin, LucideMail, LucidePhone, LucideMapPin, LucideYoutube } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold tracking-tight text-white">
                                RanX<span className="text-blue-500">24</span>
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your trusted partner for home services. We connect you with top-rated professionals for quality, reliability, and speed.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <SocialLink href="https://www.facebook.com/profile.php?id=61584155575066" icon={<LucideFacebook size={18} />} />
                            <SocialLink href="https://www.instagram.com/ranx24homeservice/" icon={<LucideInstagram size={18} />} />
                            <SocialLink href="https://www.youtube.com/@RanX24" icon={<LucideYoutube size={18} />} />
                            <SocialLink href="#" icon={<LucideLinkedin size={18} />} />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-white">Company</h3>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><FooterLink to="/">Home</FooterLink></li>
                            <li><FooterLink to="/about">About Us</FooterLink></li>
                            <li><FooterLink to="/categories">Our Services</FooterLink></li>
                            <li><FooterLink to="/contact">Contact Us</FooterLink></li>
                            <li><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
                            <li><FooterLink to="/terms">Terms and Conditions</FooterLink></li>
                            <li><FooterLink to="/faq">FAQ</FooterLink></li>
                        </ul>
                    </div>

                    {/* For Professionals */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-white">For Professionals</h3>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><FooterLink to="/worker-register">Join as a Professional</FooterLink></li>
                            <li><FooterLink to="/worker-login">Worker Login</FooterLink></li>
                            <li><a href="https://crm.ranx24.com/event/login" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors block">Lawn Or Palace Login</a></li>
                            <li><FooterLink to="/help">Help Center</FooterLink></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-white">Contact Us</h3>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li className="flex items-start gap-3">
                                <LucideMail size={18} className="text-blue-500 mt-0.5" />
                                <span>support@ranx24.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <LucidePhone size={18} className="text-blue-500 mt-0.5" />
                                <span>+91 9546806196</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <LucideMapPin size={18} className="text-blue-500 mt-0.5" />
                                <span>Shubhankarpur,Patahi,Muzaffarpur,Bihar 843113</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} RanX24. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

const SocialLink = ({ href, icon }) => (
    <a
        href={href}
        className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300"
    >
        {icon}
    </a>
);

const FooterLink = ({ to, children }) => (
    <Link to={to} className="hover:text-blue-400 transition-colors block">
        {children}
    </Link>
);

