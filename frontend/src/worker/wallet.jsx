import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaWallet, FaArrowDown, FaArrowUp, FaRupeeSign } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://backend.ranx24.com/api";

export default function WorkerWallet() {
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [wallet, setWallet] = useState({
    totalEarnings: 0,
    withdrawable: 0,
    history: [],
  });

  const [loading, setLoading] = useState(true);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const mobile = user?.mobileNumber;

    if (!mobile) return navigate("/worker-login");

    const loadData = async () => {
      try {
        // Worker
        const { data: workerData } = await axios.get(
          `${API_URL}/workers/mobile/${mobile}`
        );
        setWorker(workerData);

        // Wallet
        const { data: walletData } = await axios.get(
          `${API_URL}/wallet/${workerData._id}`
        );
        setWallet(walletData);
      } catch (err) {
        console.error("Wallet Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Withdraw Request
  const handleWithdraw = async () => {
    if (wallet.withdrawable < 100) {
      alert("Minimum ₹100 required to withdraw.");
      return;
    }

    setWithdrawLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/wallet/withdraw`, {
        workerId: worker._id,
      });

      alert("Withdraw request submitted successfully!");

      // Update after request
      setWallet(data.wallet);
    } catch (err) {
      console.error("Withdraw Error:", err);
      alert("Failed to request withdrawal.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-blue-700 font-bold text-xl">
        Loading wallet...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-[Poppins] px-6 py-10">
      <h1 className="text-3xl font-extrabold text-green-700 mb-10 border-b-4 border-green-400 inline-block pb-2">
        Wallet & Earnings
      </h1>

      {/* Main Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        {/* Total Earnings */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <FaWallet className="text-blue-600 text-3xl" />
            <h2 className="text-xl font-bold text-blue-900">Total Earnings</h2>
          </div>
          <p className="text-4xl font-black text-blue-700 mt-4 flex items-center">
            <FaRupeeSign /> {wallet.totalEarnings}
          </p>
        </div>

        {/* Withdrawable */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <FaArrowDown className="text-green-600 text-3xl" />
            <h2 className="text-xl font-bold text-green-700">Available for Withdrawal</h2>
          </div>
          <p className="text-4xl font-black text-green-600 mt-4 flex items-center">
            <FaRupeeSign /> {wallet.withdrawable}
          </p>

          <button
            disabled={withdrawLoading}
            onClick={handleWithdraw}
            className={`mt-5 w-full py-2 text-white font-semibold rounded-xl ${withdrawLoading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              } transition`}
          >
            {withdrawLoading ? "Processing..." : "Request Withdrawal"}
          </button>
        </div>

        {/* Pending Payouts */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <FaArrowUp className="text-yellow-500 text-3xl" />
            <h2 className="text-xl font-bold text-yellow-700">Pending Payout</h2>
          </div>
          <p className="text-4xl font-black text-yellow-600 mt-4 flex items-center">
            <FaRupeeSign /> {wallet.pendingPayout || 0}
          </p>
        </div>

      </div>

      {/* Transaction & Wallet History */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">Transaction History</h2>

        {wallet.history.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No transactions yet.</p>
        ) : (
          <div className="space-y-4">
            {wallet.history.map((t) => (
              <div
                key={t._id}
                className="p-4 rounded-xl border flex justify-between items-center hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">{t.type.toUpperCase()}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(t.date).toLocaleString()}
                  </p>
                </div>

                <p
                  className={`font-bold text-lg flex items-center ${t.type === "credit" ? "text-green-600" : "text-red-600"
                    }`}
                >
                  <FaRupeeSign /> {t.amount}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
