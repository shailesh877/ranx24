import React from 'react';
import { LucideInfo, LucideCheckCircle, LucideHeart, LucideClock, LucideShield, LucidePenTool } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 sm:p-12">
                <div className="flex items-center justify-center mb-8">
                    <div className="bg-blue-100 p-4 rounded-full">
                        <LucideInfo size={40} className="text-blue-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">About RanX24 Home Service</h1>
                <p className="text-center text-xl text-blue-600 font-medium mb-8">Making Home Maintenance Simple, Safe, and Reliable.</p>

                <div className="prose prose-blue max-w-none text-gray-600 space-y-10">
                    <section>
                        <p className="text-lg leading-relaxed">
                            At RanX24 Home Service, we understand that your home is your sanctuary. But we also know that maintaining a home can be stressful—leaky faucets, faulty wiring, and dusty corners always seem to pop up at the worst times.
                        </p>
                        <p className="text-lg leading-relaxed mt-4">
                            That is why we started RanX24: to bridge the gap between skilled professionals and homeowners who need help fast. We are not just a service provider; we are your reliable partner in keeping your home running smoothly.
                        </p>
                    </section>

                    <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <LucideHeart className="text-blue-600" /> Our Mission
                        </h2>
                        <p className="text-lg font-medium text-gray-800 mb-2">
                            To deliver high-quality home services with speed, transparency, and trust.
                        </p>
                        <p>
                            We aim to take the hassle out of home repairs. No more chasing down contractors, waiting for callbacks, or worrying about hidden costs. With RanX24, you get professional service at the click of a button.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose RanX24?</h2>
                        <p className="mb-6">We know you have choices when it comes to home services. Here is why thousands of customers trust us with their homes:</p>

                        <div className="grid gap-6 md:grid-cols-2">
                            <FeatureCard
                                icon={<LucideShield className="text-green-600" size={24} />}
                                title="Verified Professionals"
                                description="Your safety is our top priority. Every technician on our platform undergoes a background check and rigorous skills assessment before wearing the RanX24 uniform."
                            />
                            <FeatureCard
                                icon={<LucideCheckCircle className="text-blue-600" size={24} />}
                                title="Transparent Pricing"
                                description="We hate hidden fees as much as you do. We provide clear, upfront estimates so you know exactly what you are paying for before the work begins."
                            />
                            <FeatureCard
                                icon={<LucideClock className="text-orange-600" size={24} />}
                                title="On-Time Service"
                                description="We respect your time. When we say we will be there, we will be there."
                            />
                            <FeatureCard
                                icon={<LucideCheckCircle className="text-purple-600" size={24} />}
                                title="Quality Guarantee"
                                description="We stand by our work. If something isn’t right, we come back and fix it. (See our Terms and Conditions for warranty details)."
                            />
                            <FeatureCard
                                icon={<LucideClock className="text-red-600" size={24} />}
                                title="24/7 Availability"
                                description="Emergencies don’t look at the clock, and neither do we. Whether it's a pipe burst at midnight or a fuse blown on a Sunday, we are ready to help."
                            />
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Do</h2>
                        <p className="mb-4">We are your one-stop solution for all household needs. Our core services include:</p>
                        <ul className="grid gap-3 md:grid-cols-2 list-none p-0">
                            {[
                                "🔧 Plumbing: From dripping taps to complex pipe installations.",
                                "⚡ Electrical: Safety inspections, wiring repairs, and appliance installation.",
                                "🧹 Cleaning: Deep home cleaning, sofa cleaning, and tank cleaning.",
                                "🔨 Carpentry & Repairs: Furniture assembly and general home fixes.",
                                "❄️ AC, RO & Appliance Repair: Maintenance and repair for all major brands.",
                                "💇‍♀️ Salon at Home",
                                "💄 Beautician at Home",
                                "🪑 Carpenter",
                                "🏠 Home repair, renovation and home decor"
                            ].map((item, index) => (
                                <li key={index} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg text-sm font-medium text-gray-700">
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="text-center py-8 bg-gray-50 rounded-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Promise to You</h2>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            When you book a service with RanX24, you aren’t just hiring a worker; you are hiring a team dedicated to excellence. We treat your home with the same care and respect as we would our own, ensuring we leave your space cleaner and better than we found it.
                        </p>
                        <h3 className="text-xl font-bold text-blue-600 mb-6">Ready to experience the RanX24 difference?</h3>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <a href="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors">
                                Book a Service Now
                            </a>
                            <a href="tel:9546806196" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors">
                                Contact Us: 9546806196
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
    </div>
);

export default AboutPage;
