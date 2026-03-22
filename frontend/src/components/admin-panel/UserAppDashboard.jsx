import React, { useState } from 'react';
import BannerManagement from './BannerManagement';
import CategoryManagement from './CategoryManagement';
import CouponManagement from './CouponManagement';
import CoinsManagement from './CoinsManagement';
import FeeManagement from './FeeManagement';

const UserAppDashboard = () => {
    const [activeTab, setActiveTab] = useState('banners');

    const tabs = [
        { id: 'banners', label: 'Banners', icon: 'fa-images' },
        { id: 'categories', label: 'Categories', icon: 'fa-layer-group' },
        { id: 'coupons', label: 'Coupons', icon: 'fa-ticket' },
        { id: 'coins', label: 'YC Coins', icon: 'fa-coins' },
        { id: 'fees', label: 'Fees & Charges', icon: 'fa-receipt' },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <i className={`fa-solid ${tab.icon}`}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="min-h-[500px]">
                {activeTab === 'banners' && <BannerManagement />}
                {activeTab === 'categories' && <CategoryManagement />}
                {activeTab === 'coupons' && <CouponManagement />}
                {activeTab === 'coins' && <CoinsManagement />}
                {activeTab === 'fees' && <FeeManagement />}
            </div>
        </div>
    );
};

export default UserAppDashboard;
