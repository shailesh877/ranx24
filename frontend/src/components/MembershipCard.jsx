import React from 'react';
import { FaCrown, FaShieldAlt } from 'react-icons/fa';
import { LucideShieldCheck } from 'lucide-react';

const MembershipCard = ({ userName, cardNumber, expiryDate, planName }) => {
    const isGold = planName?.toLowerCase().includes('gold');
    const isSilver = planName?.toLowerCase().includes('silver');

    return (
        <div className={`relative w-full max-w-md aspect-[1.6/1] rounded-3xl p-6 shadow-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] ${
            isGold 
                ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600' 
                : isSilver
                ? 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-600'
                : 'bg-gradient-to-br from-blue-500 to-indigo-700'
        }`}>
            {/* Glossy Overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-30 pointer-events-none" 
                 style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%)' }} />
            
            {/* Decorative Shine Line */}
            <div className="absolute top-[-100%] left-[-100%] w-[300%] h-[300%] bg-white/20 rotate-[35deg] animate-[shine_8s_infinite] pointer-events-none" />

            <div className="relative z-10 h-full flex flex-col justify-between text-white">
                {/* Card Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest opacity-80 mb-1">RanX24 Membership</h3>
                        <p className="text-2xl font-black italic tracking-tighter drop-shadow-sm">
                            {isGold ? 'GOLD CLASS' : isSilver ? 'SILVER CLASS' : planName?.toUpperCase()}
                        </p>
                    </div>
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                        {isGold ? (
                            <FaCrown className="text-amber-100 drop-shadow-md" size={28} />
                        ) : (
                            <LucideShieldCheck className="text-white opacity-90" size={28} strokeWidth={2.5} />
                        )}
                    </div>
                </div>

                {/* Card Number */}
                <div className="mt-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-1">Membership Number</p>
                    <div className="flex gap-4">
                        <span className="text-2xl font-mono font-bold tracking-[0.2em] drop-shadow-lg">
                            {cardNumber?.replace(/(\d{4})(\d{4})(\d{3})/, '$1 $2 $3') || '0000 0000 000'}
                        </span>
                    </div>
                </div>

                {/* Card Footer */}
                <div className="flex justify-between items-end mt-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">Card Holder</p>
                        <p className="text-lg font-black tracking-tight">{userName?.toUpperCase() || 'VALUED CUSTOMER'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">Valid Thru</p>
                        <p className="text-sm font-black">{expiryDate || 'MM/YYYY'}</p>
                    </div>
                </div>
            </div>

            {/* Background Pattern */}
            <div className="absolute bottom-[-10%] right-[-10%] opacity-10 pointer-events-none">
                {isGold ? <FaCrown size={180} /> : <FaShieldAlt size={180} />}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes shine {
                    0% { transform: rotate(35deg) translateY(-100%) translateX(-100%); }
                    20% { transform: rotate(35deg) translateY(100%) translateX(100%); }
                    100% { transform: rotate(35deg) translateY(100%) translateX(100%); }
                }
            `}} />
        </div>
    );
};

export default MembershipCard;
