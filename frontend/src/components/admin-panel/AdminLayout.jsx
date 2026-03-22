import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { AdminProvider } from '../../context/AdminContext';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const admin = { name: "Admin", email: "admin@example.com" };

    return (
        <AdminProvider>
            <div className="min-h-screen flex bg-slate-50">
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                <main className="flex-1 lg:ml-72 transition-all duration-300">
                    <Topbar onToggle={() => setSidebarOpen(s => !s)} admin={admin} />
                    <div className="p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </AdminProvider>
    );
};

export default AdminLayout;
