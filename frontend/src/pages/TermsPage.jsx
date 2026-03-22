import React from 'react';
import { LucideFileText } from 'lucide-react';

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 sm:p-12">
                <div className="flex items-center justify-center mb-8">
                    <div className="bg-blue-100 p-4 rounded-full">
                        <LucideFileText size={40} className="text-blue-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Terms and Conditions</h1>
                <p className="text-center text-gray-500 mb-10">Welcome to RanX24 Home Service</p>

                <div className="prose prose-blue max-w-none text-gray-600 space-y-8">
                    <section>
                        <p>
                            By accessing our website, booking an appointment, or using our services (plumbing, cleaning, electrical, repairs, salon at home , beautician at home etc.)., you agree to be bound by these Terms and Conditions ("Terms").
                        </p>
                        <p className="mt-4 font-medium">
                            Please read these Terms carefully before booking a service. If you do not agree with any part of these terms, you may not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Scope of Services</h2>
                        <p>RanX24 Home Service ("we," "us," or "our") connects customers with skilled technicians/professionals to perform home maintenance and repair services.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li><strong>Service Quality:</strong> We strive to provide high-quality service. However, we reserve the right to refuse service to anyone for any reason at any time (e.g., unsafe working conditions).</li>
                            <li><strong>Estimates:</strong> Any price quotes provided over the phone or online are estimates based on the information provided. The final price may change once the technician inspects the issue in person. We will always seek your approval for the revised price before starting work.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">2. Booking and Scheduling</h2>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li><strong>Appointments:</strong> You agree to provide accurate and complete information when booking a service, including your address, contact details, and a description of the problem.</li>
                            <li><strong>Access to Property:</strong> You must ensure that a person at least 18 years of age is present at the property for the duration of the service. You agree to provide our technicians with access to the necessary areas, water, and electricity required to complete the job.</li>
                            <li><strong>Safety:</strong> You are responsible for securing any pets and removing any hazards from the workspace before the technician arrives.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">3. Cancellations and Rescheduling</h2>
                        <p>We understand that plans change. However, late cancellations affect our technicians' schedules.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li><strong>Cancellation Notice:</strong> You may cancel or reschedule your appointment free of charge up to 24 hours before the scheduled time.</li>
                            <li><strong>Late Cancellation Fee:</strong> If you cancel within 24 hours of the appointment, or if you are not home when the technician arrives, we reserve the right to charge a visiting fee.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Payments and Billing</h2>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li><strong>Payment Terms:</strong> Payment is due immediately upon completion of the service unless otherwise agreed in writing.</li>
                            <li><strong>Accepted Methods:</strong> We accept Cash, Credit Cards, Debit Cards, UPI, Bank Transfers.</li>
                            <li><strong>Materials and Parts:</strong> The cost of spare parts or materials required for the repair is not included in the service charge unless explicitly stated. You may purchase the parts yourself, or we can source them for you at an additional cost.</li>
                            <li><strong>Late Payments:</strong> Invoices not paid within 3 days may be subject to a late fee of 12% per month.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Limited Warranty</h2>
                        <p>We stand by the quality of our workmanship.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li><strong>Service Warranty:</strong> We offer a 15-day service warranty on labour. If the same issue reoccurs within this period due to our workmanship, we will fix it free of charge.</li>
                            <li><strong>Exclusions:</strong> This warranty does not cover:
                                <ul className="list-circle pl-5 mt-1 space-y-1 text-sm">
                                    <li>Issues caused by misuse or negligence after the service.</li>
                                    <li>Pre-existing damage to the property.</li>
                                    <li>Defects in parts or materials (parts carry the manufacturer's warranty, not ours).</li>
                                    <li>Blockages in drainage that reoccur due to foreign objects (wipes, grease, etc.) being flushed after our service.</li>
                                </ul>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">6. Limitation of Liability</h2>
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                            <p className="font-semibold text-yellow-800 mb-2">This is a critical section. Please read carefully.</p>
                            <p className="mb-2">To the fullest extent permitted by law, RanX24 Home Service shall not be liable for:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Indirect Damages:</strong> Any indirect, incidental, or consequential damages (e.g., loss of income, water damage to flooring caused by a pre-existing burst pipe before we arrived).</li>
                                <li><strong>Pre-existing Conditions:</strong> Damages resulting from old, fragile, or deteriorating plumbing, wiring, or fixtures that break during standard repair attempts.</li>
                                <li><strong>Third-Party Parts:</strong> Failure of parts or materials purchased by the customer or supplied by third-party manufacturers.</li>
                            </ul>
                            <p className="mt-2 text-sm italic">Our total liability to you for any claim arising out of the service shall not exceed the total amount paid by you for that specific service.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">7. Independent Contractors</h2>
                        <p>Some technicians operating under RanX24 Home Service may be independent contractors. While we vet our professionals, RanX24 is not liable for the independent acts or omissions of these contractors beyond the scope of the service warranty.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">8. User Conduct</h2>
                        <p>You agree to treat our technicians with respect. We have a zero-tolerance policy for harassment, abuse, or threatening behavior. We reserve the right to terminate the service immediately and vacate the premises if our staff feels unsafe.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">9. Changes to Terms</h2>
                        <p>We reserve the right to modify these Terms at any time. Your continued use of the Service following any changes indicates your acceptance of the new Terms.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">10. Governing Law</h2>
                        <p>These Terms shall be governed by and construed in accordance with the laws of Bihar, India. Any disputes relating to these terms will be subject to the exclusive jurisdiction of the courts in Muzaffarpur, Bihar.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Us</h2>
                        <p className="mb-2">If you have any questions about these Terms and Conditions, please contact us:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Email:</strong> support@ranx24.com</li>
                            <li><strong>Phone:</strong> 9546806196</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
