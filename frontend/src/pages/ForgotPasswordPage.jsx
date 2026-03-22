import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://backend.ranx24.com/api";

export default function ForgotPasswordPage() {
    const [identifier, setIdentifier] = useState("");
    const [userType, setUserType] = useState("user");
    const [loading, setLoading] = useState(false);
    const [resetToken, setResetToken] = useState(null); // For dev/demo purposes

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/auth/forgotpassword`, {
                identifier,
                userType,
            });

            // Show backend response message
            if (data.success) {
                toast.success(data.message || "Password reset link has been sent to your email.");
            } else {
                toast.error(data.message || "Failed to send reset link");
            }

        } catch (error) {
            console.error("Error requesting password reset:", error);
            const errorMessage = error.response?.data?.message || "Failed to request password reset";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    Forgot Password?
                </h2>
                <p className="text-gray-600 mb-6 text-center">
                    Enter your email or phone number to reset your password.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email or Phone
                        </label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="Enter email or phone"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>

                    {resetToken && (
                        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded text-sm break-all">
                            <strong>Dev Token:</strong> {resetToken}
                            <br />
                            <Link to={`/reset-password/${resetToken}`} className="underline font-bold">Click here to reset</Link>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600">
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
