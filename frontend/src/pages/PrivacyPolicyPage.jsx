import React from 'react';
import { LucideShieldCheck } from 'lucide-react';

const PrivacyPolicyPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 sm:p-12">
                <div className="flex items-center justify-center mb-8">
                    <div className="bg-blue-100 p-4 rounded-full">
                        <LucideShieldCheck size={40} className="text-blue-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Privacy Policy</h1>
                <p className="text-center text-gray-500 mb-10">Last Updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-blue max-w-none text-gray-600 space-y-8">
                    <section>
                        <p>
                            At RanX24 Home Service ("we," "us," or "our"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website www.ranx24.com and use our home services (plumbing, cleaning, electrical, repairs, salon at home , beautician at home etc.).
                        </p>
                        <p className="mt-4">
                            By accessing or using our Service, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
                        <p className="mb-3">We collect information to provide better services to all our users. The types of information we collect include:</p>

                        <h3 className="font-semibold text-gray-800 mt-4 mb-2">A. Personal Data</h3>
                        <p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you, such as:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Identity Data:</strong> Name, username, or similar identifier.</li>
                            <li><strong>Contact Data:</strong> Billing address, service delivery address, email address, and telephone numbers.</li>
                            <li><strong>Transaction Data:</strong> Details about payments to and from you and details of services you have purchased from us.</li>
                        </ul>

                        <h3 className="font-semibold text-gray-800 mt-4 mb-2">B. Service-Specific Data</h3>
                        <p>To provide accurate home services, we may collect:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Location Information:</strong> We may collect the precise location of your home to dispatch technicians.</li>
                            <li><strong>Property Details:</strong> Information regarding the specific problem (e.g., photos of a leak, type of appliance, size of the room) to prepare our technicians.</li>
                        </ul>

                        <h3 className="font-semibold text-gray-800 mt-4 mb-2">C. Usage Data</h3>
                        <p>We may automatically collect information on how the Service is accessed and used. This may include your computer's Internet Protocol address (IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, and other diagnostic data.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
                        <p>RanX24 Home Service uses the collected data for various purposes:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>To Provide and Maintain our Service:</strong> Including scheduling appointments and dispatching service professionals to your location.</li>
                            <li><strong>To Manage Your Account:</strong> To manage your registration as a user of the Service.</li>
                            <li><strong>To Process Payments:</strong> To verify and complete financial transactions for services rendered.</li>
                            <li><strong>To Communicate with You:</strong> To contact you by email, telephone calls, SMS, or mobile notifications regarding updates, service completion, or security alerts.</li>
                            <li><strong>Customer Support:</strong> To provide customer support and troubleshoot issues.</li>
                            <li><strong>Marketing (Optional):</strong> To provide you with news, special offers, and general information about other goods, services, and events which we offer (unless you have opted not to receive such information).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">3. Sharing Your Information</h2>
                        <p>We do not sell your personal information. However, we may share your information in the following situations:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>With Service Providers:</strong> We may share your information (Address, Phone Number, Service Request) with our contractors, technicians, or third-party service providers who perform services on our behalf (e.g., the plumber or electrician coming to your home).</li>
                            <li><strong>For Business Transfers:</strong> If we are involved in a merger, acquisition, or asset sale, your Personal Data may be transferred.</li>
                            <li><strong>With Law Enforcement:</strong> We may disclose your Personal Data if required to do so by law or in response to valid requests by public authorities.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Security of Your Data</h2>
                        <p>The security of your data is important to us. We use commercially acceptable means (such as SSL encryption for payments and secure servers) to protect your Personal Data. However, remember that no method of transmission over the Internet or method of electronic storage is 100% secure.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Cookies and Tracking Technologies</h2>
                        <p>We use Cookies and similar tracking technologies to track the activity on our Service and hold certain information.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Session Cookies:</strong> To operate our Service.</li>
                            <li><strong>Preference Cookies:</strong> To remember your preferences and various settings.</li>
                            <li><strong>Security Cookies:</strong> For security purposes.</li>
                        </ul>
                        <p className="mt-2">You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your Data Rights</h2>
                        <p>Depending on your location, you may have the following rights regarding your data:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
                            <li><strong>The right to rectification:</strong> You can request that we correct any information you believe is inaccurate.</li>
                            <li><strong>The right to erasure:</strong> You can request that we erase your personal data under certain conditions.</li>
                            <li><strong>The right to withdraw consent:</strong> If you gave us consent to use your data (e.g., for marketing), you can withdraw it at any time.</li>
                        </ul>
                        <p className="mt-2">To exercise these rights, please contact us at support@ranx24.com</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">7. Children's Privacy</h2>
                        <p>Our Service does not address anyone under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your Child has provided us with Personal Data, please contact us.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">8. Changes to This Privacy Policy</h2>
                        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Lastest Updated" date at the top. You are advised to review this Privacy Policy periodically for any changes.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact Us</h2>
                        <p className="mb-2">If you have any questions about this Privacy Policy, please contact us:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>By email:</strong> support@ranx24.com</li>
                            <li><strong>By phone:</strong> 9546806196</li>
                            <li><strong>By mail:</strong> info@ranx24.com</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
