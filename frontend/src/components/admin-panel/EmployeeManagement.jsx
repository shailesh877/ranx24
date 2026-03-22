import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash, UserPlus, Phone, Shield } from 'lucide-react';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // New Employee Form
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        mobileNumber: '',
        password: ''
    });

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/employees');
            setEmployees(data);
        } catch (error) {
            console.error("Error fetching employees:", error);
            // toast.error("Failed to load employees");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/employees', newEmployee);
            toast.success("Employee created successfully");
            setShowAddModal(false);
            setNewEmployee({ name: '', mobileNumber: '', password: '' });
            fetchEmployees();
        } catch (error) {
            console.error("Error creating employee:", error);
            toast.error(error.response?.data?.message || "Failed to create employee");
        }
    };

    const handleDeleteEmployee = async (id) => {
        if (!window.confirm("Are you sure you want to delete this employee?")) return;
        try {
            await api.delete(`/admin/employees/${id}`);
            toast.success("Employee deleted successfully");
            fetchEmployees();
        } catch (error) {
            console.error("Error deleting employee:", error);
            toast.error(error.response?.data?.message || "Failed to delete employee");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading employees...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="text-blue-600" /> Employee Management
                    </h1>
                    <p className="text-slate-500 mt-1">Manage staff access and roles</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                >
                    <Plus size={20} /> Add Employee
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map(employee => (
                    <div key={employee._id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 p-4">
                            <button
                                onClick={() => handleDeleteEmployee(employee._id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                            >
                                <Trash size={18} />
                            </button>
                        </div>

                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4 text-xl font-bold">
                            {employee.name ? employee.name.charAt(0).toUpperCase() : 'E'}
                        </div>

                        <h3 className="font-bold text-lg text-slate-800">{employee.name || 'Unnamed Staff'}</h3>
                        <p className="text-slate-500 text-sm mb-4 flex items-center gap-1">
                            <Phone size={12} /> {employee.mobileNumber}
                        </p>

                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                            Employee
                        </span>
                    </div>
                ))}

                {employees.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <UserPlus className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">No employees yet</h3>
                        <p className="text-slate-500">Get started by adding a new employee.</p>
                    </div>
                )}
            </div>

            {/* Add Employee Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">Add New Employee</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateEmployee} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newEmployee.name}
                                    onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newEmployee.mobileNumber}
                                    onChange={e => setNewEmployee({ ...newEmployee, mobileNumber: e.target.value })}
                                    placeholder="e.g. 9876543210"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newEmployee.password}
                                    onChange={e => setNewEmployee({ ...newEmployee, password: e.target.value })}
                                    placeholder="Secret password"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                                >
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManagement;
