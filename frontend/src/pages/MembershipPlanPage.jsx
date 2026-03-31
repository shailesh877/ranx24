import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance, { getRazorpayConfig } from '../utils/axiosConfig';
import { LucideCheck, LucideCrown, LucideShieldCheck, LucideZap, LucideLoader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MembershipCard from '../components/MembershipCard';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';

export default function MembershipPlanPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [plans, setPlans] = useState([]);
    const [activeMembership, setActiveMembership] = useState(null);
    const [loading, setLoading] = useState(true);
    const [buyingId, setBuyingId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const plansRes = await axiosInstance.get(`/membership-plans`);
                setPlans(plansRes.data);

                if (isAuthenticated) {
                    const membRes = await axiosInstance.get(`/membership-plans/my-membership`);
                    if (membRes.data.success) {
                        setActiveMembership(membRes.data.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load membership data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isAuthenticated]);

    const handleBuy = async (planId) => {
        if (!isAuthenticated) {
            toast.error('Please login to purchase a membership');
            navigate('/login');
            return;
        }

        const plan = plans.find(p => p._id === planId);
        if (!plan) return;

        try {
            setBuyingId(planId);
            const razorpayKey = await getRazorpayConfig();

            // 1. Create Order
            const { data: orderData } = await axiosInstance.post(
                `/payment/order`,
                { amount: plan.price }
            );

            // 2. Open Razorpay
            const options = {
                key: razorpayKey,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "RanX24",
                description: `Membership Purchase: ${plan.name}`,
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        const verifyRes = await axiosInstance.post(
                            `/payment/verify`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                isMembershipPurchase: true,
                                planId: planId
                            }
                        );

                        if (verifyRes.data.success) {
                            toast.success('Membership activated successfully!');
                            setTimeout(() => navigate('/'), 2000);
                        } else {
                            toast.error('Payment verification failed');
                        }
                    } catch (err) {
                        console.error('Verification error:', err);
                        toast.error('Payment verification failed');
                    } finally {
                        setBuyingId(null);
                    }
                },
                theme: { color: "#3B82F6" },
                modal: {
                    ondismiss: function() {
                        setBuyingId(null);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Purchase error:', error);
            const message = error.response?.data?.message || 'Failed to initiate purchase';
            toast.error(message);
            setBuyingId(null);
        }
    };

    const renderDescription = (desc) => {
        if (!desc) return null;
        
        // Remove "Facilities" if it's at the start and treat as optional header
        let cleanDesc = desc;
        let showFacilities = false;
        if (desc.startsWith("Facilities")) {
            showFacilities = true;
            cleanDesc = desc.replace("Facilities", "").trim();
        }
        
        // Simple and robust split: looks for a space followed by a number and period.
        // This ensures all points are captured and multi-digit numbers stay intact.
        const points = cleanDesc.split(/(?=\s\d+\.)/).map(p => p.trim()).filter(p => p !== "");
        
        return (
            <div className="mt-4 space-y-2.5">
                {showFacilities && (
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                        Core Facilities
                    </p>
                )}
                {points.length > 0 ? (
                    points.map((point, index) => (
                        <div key={index} className="flex gap-3 text-[13px] font-semibold text-gray-600 leading-snug items-start group">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500/40 group-hover:bg-blue-500 transition-colors flex-shrink-0" />
                            <span>{point}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-sm font-medium text-gray-500 leading-relaxed">
                        {desc}
                    </p>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="pt-32 pb-20 flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 bg-gray-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        Choose Your <span className="text-blue-600">Membership</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
                        Unlock exclusive benefits, priority support, and extra savings on every service.
                    </p>
                </div>

                {activeMembership && (
                    <div className="mb-20 flex flex-col items-center">
                        <div className="w-full max-w-md flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-gray-900">Your Active Membership</h2>
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm border border-green-200">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Active
                            </div>
                        </div>
                        <MembershipCard 
                            userName={user?.name}
                            cardNumber={activeMembership.card_number}
                            expiryDate={activeMembership.expiry_date}
                            planName={activeMembership.plan_id?.name}
                        />
                        <div className="mt-8 p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-blue-500/5 max-w-2xl w-full">
                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Membership Privileges</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeMembership.plan_id?.discount_tiers?.map((tier, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                                        <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                                            <LucideCheck size={14} strokeWidth={4} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">
                                            {tier.discount || tier.discount_percentage}% discount {tier.min_amount && `on ₹${tier.min_amount}+`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full max-w-2xl mt-12 flex items-center gap-4">
                            <div className="h-px bg-gray-200 flex-grow"></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Want to Upgrade?</span>
                            <div className="h-px bg-gray-200 flex-grow"></div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                    {plans.map((plan) => {
                        const nameLower = plan.name.toLowerCase();
                        const isGold = nameLower.includes('gold');
                        const isPlatinum = nameLower.includes('platinum');
                        
                        return (
                            <div 
                                key={plan._id}
                                className={`relative bg-white rounded-3xl p-8 shadow-xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col ${
                                    isGold ? 'border-amber-200 shadow-amber-100/50' : 
                                    isPlatinum ? 'border-indigo-200 shadow-indigo-100/50' : 
                                    'border-gray-100'
                                }`}
                            >
                                {isGold && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                                        Best Seller
                                    </div>
                                )}
                                {isPlatinum && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                                        Premium Choice
                                    </div>
                                )}

                                <div className="mb-6 flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900">{plan.name}</h3>
                                        <p className="text-sm font-bold text-blue-600 mt-1 uppercase tracking-tighter">
                                            {plan.duration_months} Months Plan
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-2xl ${
                                        isGold ? 'bg-amber-100' : 
                                        isPlatinum ? 'bg-indigo-100' : 
                                        'bg-blue-50'
                                    }`}>
                                        {isGold ? (
                                            <LucideCrown className="text-amber-600" size={24} />
                                        ) : isPlatinum ? (
                                            <LucideZap className="text-indigo-600" size={24} />
                                        ) : (
                                            <LucideShieldCheck className="text-blue-600" size={24} />
                                        )}
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <div className="flex flex-col gap-2">
                                        {plan.actual_price && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-400 decoration-red-400 decoration-2">
                                                    <del>₹{plan.actual_price}</del>
                                                </span>
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Regular Price</span>
                                            </div>
                                        )}
                                        <div className="flex items-baseline gap-2">
                                            <div className="flex flex-col items-start pr-2 border-r-2 border-emerald-100">
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Offer Price</span>
                                            </div>
                                            <span className="text-5xl font-black text-gray-900 tracking-tighter">₹{plan.price}</span>
                                            <span className="text-gray-500 font-bold ml-1">/ total</span>
                                        </div>
                                        <div className="mt-3 inline-flex items-center gap-1.5 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 text-red-600 px-3 py-1.5 rounded-lg w-max shadow-sm transform transition hover:scale-105">
                                            <LucideZap size={14} className="fill-red-500 text-red-500 animate-pulse" />
                                            <span className="text-[11px] font-black tracking-wider uppercase">Offer valid for first 100 customers only!</span>
                                        </div>
                                    </div>
                                    {renderDescription(plan.description)}
                                </div>

                                <div className="space-y-4 mb-10 flex-grow">
                                    {plan.discount_tiers?.map((tier, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <LucideCheck className="text-green-600" size={12} strokeWidth={3} />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">
                                                {tier.discount || tier.discount_percentage}% discount
                                                {tier.min_amount && ` on orders above ₹${tier.min_amount}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => handleBuy(plan._id)}
                                    disabled={buyingId === plan._id}
                                    className={`w-full py-4 rounded-2xl text-base font-black transition-all shadow-lg flex items-center justify-center gap-2 ${
                                        isGold ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white hover:shadow-amber-500/30' : 
                                        isPlatinum ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-600/30' :
                                        'bg-gray-900 text-white hover:bg-black hover:shadow-gray-900/30'
                                    } ${buyingId === plan._id ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {buyingId === plan._id ? (
                                        <>
                                            <LucideLoader2 size={20} className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        `Get ${plan.name} Now`
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-20 bg-blue-600 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-4">Have questions about our plans?</h2>
                        <p className="text-blue-100 font-medium mb-8 max-w-xl mx-auto">
                            Our team is here to help you choose the best plan for your home maintenance needs.
                        </p>
                        <button className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-black hover:scale-105 transition-transform shadow-xl">
                            Contact Support
                        </button>
                    </div>
                    {/* Decorative Blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full -ml-20 -mb-20 blur-3xl"></div>
                </div>
            </div>
        </div>
    );
}
