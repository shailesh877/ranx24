import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance, { getRazorpayConfig } from '../utils/axiosConfig';
import { LucideCheck, LucideShieldCheck, LucideZap, LucideLoader2, LucidePlus, LucideMinus, LucidePackage, LucideInfo } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';

export default function AMCPlanPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [plans, setPlans] = useState([]);
    const [selectedPlans, setSelectedPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [isEmiSelected, setIsEmiSelected] = useState(false);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const { data } = await axiosInstance.get(`/amc-plans`);
                setPlans(data);
            } catch (error) {
                console.error('Error fetching AMC plans:', error);
                toast.error('Failed to load AMC plans');
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const togglePlan = (planId) => {
        setSelectedPlans(prev => 
            prev.includes(planId) 
                ? prev.filter(id => id !== planId)
                : [...prev, planId]
        );
    };

    const selectedPlansData = selectedPlans.map(id => plans.find(p => p._id === id)).filter(Boolean);
    const canUseEmi = selectedPlansData.length > 0 && selectedPlansData.every(p => p.is_emi_available);

    // Calculate Totals
    const totalPrice = selectedPlansData.reduce((sum, p) => sum + parseFloat(p.total_price), 0);
    const totalInterest = selectedPlansData.reduce((sum, p) => sum + parseFloat(p.emi_interest_amount || 0), 0);
    const totalWithInterest = totalPrice + totalInterest;

    // Use EMI config of first plan
    const numInstallments = selectedPlansData[0]?.emi_installments || 1;
    const emiType = selectedPlansData[0]?.available_emi_frequencies?.[0] || 'Monthly';
    const amountPerInstallment = numInstallments > 0 ? (totalWithInterest / numInstallments) : totalWithInterest;

    const finalAmountToChargeToday = isEmiSelected && canUseEmi ? amountPerInstallment : totalPrice;

    const handlePurchase = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to purchase an AMC package');
            navigate('/login');
            return;
        }

        if (selectedPlans.length === 0) {
            toast.error('Please select at least one plan to create a package');
            return;
        }

        try {
            setPurchasing(true);
            const razorpayKey = await getRazorpayConfig();

            // 1. Create Order
            const { data: orderData } = await axiosInstance.post(
                `/payment/order`,
                { amount: Math.round(finalAmountToChargeToday) }
            );

            // 2. Open Razorpay
            const options = {
                key: razorpayKey,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "RanX24",
                description: `AMC Package Purchase (${selectedPlans.length} plans)`,
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
                                isAMCPurchase: true,
                                planIds: selectedPlans,
                                paymentMode: (isEmiSelected && canUseEmi) ? 'EMI' : 'Full'
                            }
                        );

                        if (verifyRes.data.success) {
                            toast.success('AMC Package activated successfully!');
                            setTimeout(() => navigate('/profile'), 2000);
                        } else {
                            toast.error('Payment verification failed');
                        }
                    } catch (err) {
                        console.error('Verification error:', err);
                        toast.error('Payment verification failed');
                    } finally {
                        setPurchasing(false);
                    }
                },
                theme: { color: "#4F46E5" },
                modal: {
                    ondismiss: function() {
                        setPurchasing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Purchase error:', error);
            const message = error.response?.data?.message || 'Failed to initiate purchase';
            toast.error(message);
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="pt-32 pb-20 flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 bg-gray-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        Create Your <span className="text-indigo-600">AMC Package</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
                        Select multiple maintenance plans to create a custom annual contract tailored for your home.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Plans List */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-8">
                            <LucidePlus className="text-indigo-600" size={28} />
                            Available AMC Plans
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {plans.map((plan) => {
                                const isSelected = selectedPlans.includes(plan._id);
                                return (
                                    <div 
                                        key={plan._id}
                                        onClick={() => togglePlan(plan._id)}
                                        className={`cursor-pointer group relative bg-white rounded-3xl p-6 border-2 transition-all duration-300 ${
                                            isSelected ? 'border-indigo-600 shadow-xl shadow-indigo-100' : 'border-gray-100 hover:border-indigo-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-2xl transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                                                <LucideZap size={24} />
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                                            }`}>
                                                {isSelected && <LucideCheck size={14} className="text-white" strokeWidth={4} />}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black text-gray-900 mb-2">{plan.name}</h3>
                                        
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                {plan.service_category}
                                            </span>
                                            <span className="px-3 py-1 bg-blue-50 rounded-full text-xs font-bold text-blue-600 uppercase tracking-wider">
                                                {plan.duration_months} Months
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                                <LucideCheck size={16} className="text-green-500" />
                                                <span>{plan.number_of_visits} Service Visits</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                                <LucideCheck size={16} className="text-green-500" />
                                                <span>Priority Support</span>
                                            </div>
                                        </div>

                                        <div className="flex items-baseline gap-1 pt-4 border-t border-gray-100">
                                            <span className="text-2xl font-black text-gray-900 text-indigo-600">₹{plan.total_price}</span>
                                            <span className="text-gray-400 font-bold text-sm">/ year</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100">
                            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                <LucidePackage className="text-indigo-600" size={28} />
                                Your Package
                            </h2>

                            <div className="space-y-4 mb-8 min-h-[100px]">
                                {selectedPlans.length === 0 ? (
                                    <div className="text-center py-8">
                                        <LucideInfo className="mx-auto text-gray-300 mb-3" size={40} />
                                        <p className="text-gray-400 font-bold">Select plans on the left to build your package</p>
                                    </div>
                                ) : (
                                    selectedPlans.map(id => {
                                        const plan = plans.find(p => p._id === id);
                                        return (
                                            <div key={id} className="flex justify-between items-center group">
                                                <div>
                                                    <p className="font-bold text-gray-900">{plan?.name}</p>
                                                    <p className="text-xs font-bold text-gray-400 uppercase">{plan?.service_category}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-black text-indigo-600">₹{plan?.total_price}</span>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); togglePlan(id); }}
                                                        className="p-1 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors text-gray-300"
                                                    >
                                                        <LucideMinus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="pt-6 border-t border-gray-100 mb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-500 font-bold">Total Plans</span>
                                    <span className="font-black text-gray-900">{selectedPlans.length}</span>
                                </div>
                                
                                {canUseEmi && (
                                    <div className="mt-4 mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl cursor-pointer transition-all hover:bg-indigo-100" onClick={() => setIsEmiSelected(!isEmiSelected)}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isEmiSelected}
                                                    onChange={() => {}} // dummy onChange to prevent warning, actual trigger is on parent div
                                                    className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="font-black text-indigo-900">Pay via EMI</span>
                                            </div>
                                            <span className="text-xs font-bold bg-white text-indigo-600 px-2 py-1 rounded-md shadow-sm">
                                                {numInstallments} {emiType} Installments
                                            </span>
                                        </div>
                                        <p className="text-xs text-indigo-700 leading-relaxed font-medium pl-7">
                                            Total combined price is ₹{totalPrice}. <br/>
                                            Total Interest applied is ₹{totalInterest.toFixed(0)}. <br/>
                                            You will pay <strong className="text-indigo-900">₹{amountPerInstallment.toFixed(0)}</strong> today and the remaining in future cycles.
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-xl font-black text-gray-900">
                                        {(isEmiSelected && canUseEmi) ? 'Pay Today' : 'Total Price'}
                                    </span>
                                    <span className="text-3xl font-black text-indigo-600 tracking-tight">₹{Math.round(finalAmountToChargeToday)}</span>
                                </div>
                            </div>

                            <button 
                                onClick={handlePurchase}
                                disabled={purchasing || selectedPlans.length === 0}
                                className={`w-full py-5 rounded-2xl text-lg font-black transition-all shadow-xl flex items-center justify-center gap-3 ${
                                    selectedPlans.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-600/30'
                                }`}
                            >
                                {purchasing ? (
                                    <>
                                        <LucideLoader2 size={24} className="animate-spin" />
                                        Creating Package...
                                    </>
                                ) : (
                                    'Create & Purchase Package'
                                )}
                            </button>
                            
                            <p className="text-center mt-6 text-xs text-gray-400 font-bold leading-relaxed px-4">
                                *By purchasing, you agree to our 24/7 priority support and service availability terms.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg group hover:border-indigo-200 transition-colors">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <LucideShieldCheck size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-3">Professional Maintenance</h3>
                        <p className="text-gray-500 font-medium text-sm leading-relaxed">Certified technicians ensuring your home electronics work at peak efficiency.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg group hover:border-indigo-200 transition-colors">
                        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-600 group-hover:text-white transition-all">
                            <LucideZap size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-3">Priority Response</h3>
                        <p className="text-gray-500 font-medium text-sm leading-relaxed">AMC holders get priority scheduling with a guaranteed 24-hour response time.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg group hover:border-indigo-200 transition-colors">
                        <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
                            <LucidePackage size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-3">Custom Bundles</h3>
                        <p className="text-gray-500 font-medium text-sm leading-relaxed">Choose exactly what you need. Combine AC, RO, and Electrical plans into one.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
