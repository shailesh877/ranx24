import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function FeeManagement() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [config, setConfig] = useState({
        platformFee: 0,
        percentageCharge: 0,
        isActive: true
    });

    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/fees');
            setConfig(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching fees:', err);
            setError('Failed to load fee settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccess(null);
        setError(null);
        try {
            const { data } = await api.put('/admin/fees', config);
            setConfig(data);
            setSuccess('Fee settings updated successfully');
        } catch (err) {
            console.error('Error updating fees:', err);
            setError('Failed to update fee settings');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : Number(value)
        }));
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-2xl mx-auto mt-8">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800">Fee Configuration</h2>
                <p className="text-slate-500 text-sm mt-1">Manage platform fees and travel charges</p>
            </div>

            <div className="p-6 space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-4 bg-green-50 text-green-600 rounded-lg flex items-center gap-2">
                        <CheckCircle size={20} />
                        {success}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                            <label className="font-semibold text-slate-700 block">Enable Fees</label>
                            <p className="text-sm text-slate-500">Toggle all additional fees on/off</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={config.isActive}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Platform Fee (Fixed)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                <input
                                    type="number"
                                    name="platformFee"
                                    value={config.platformFee}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="0"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Fixed fee added to every order</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Percentage Charge (%)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                                <input
                                    type="number"
                                    name="percentageCharge"
                                    value={config.percentageCharge}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="0"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Percentage markup on service price</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Worker Registration Fee (Fixed)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                            <input
                                type="number"
                                name="workerRegistrationFee"
                                value={config.workerRegistrationFee || 0}
                                onChange={handleChange}
                                min="0"
                                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="0"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">One-time fee charged to workers during registration. Set to 0 to disable.</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
