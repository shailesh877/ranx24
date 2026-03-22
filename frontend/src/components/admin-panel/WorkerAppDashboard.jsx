import React, { useState } from 'react';
import WorkerManagement from './WorkerManagement';

const WorkerAppDashboard = () => {
    const [activeTab, setActiveTab] = useState('workers');

    const tabs = [
        { id: 'workers', label: 'All Professionals', icon: 'fa-users-gear' },
        // Future: Add Verification, Worker Banners, etc.
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
                {activeTab === 'workers' && <WorkerManagement />}
            </div>
        </div>
    );
};

export default WorkerAppDashboard;
