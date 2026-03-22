import React, { useState, useEffect } from 'react';
import axiosInstance, { getRazorpayConfig } from '../utils/axiosConfig';
import { toast } from 'react-hot-toast';
import { FaWallet, FaCoins, FaHistory, FaArrowUp, FaArrowDown, FaExclamationCircle, FaPlus, FaTimes } from 'react-icons/fa';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

const UserWalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Money State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const { data } = await axiosInstance.get('/wallet');
      setWallet(data);
    } catch (err) {
      setError('Failed to fetch wallet information.');
      toast.error('Failed to fetch wallet information.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    const amount = parseFloat(amountToAdd);
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    try {
      // 1. Fetch Razorpay Key from backend
      const razorpayKey = await getRazorpayConfig();

      // 2. Create Order
      const { data: orderData } = await axiosInstance.post('/payment/order', { amount });

      const options = {
        key: razorpayKey, // Dynamically fetched from backend
        amount: orderData.amount,
        currency: orderData.currency,
        name: "RanX24",
        description: "Wallet Top-up",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyRes = await axiosInstance.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              isWalletTopUp: true,
              amount: amount
            });

            if (verifyRes.data.success) {
              toast.success('Money added to wallet successfully');
              setIsModalOpen(false);
              setAmountToAdd('');
              fetchWallet(); // Refresh balance
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            console.error('Verify error:', err);
            toast.error('Payment verification failed');
          }
        },
        theme: { color: "#2563EB" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment init error:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="font-[Poppins] bg-gray-50 min-h-screen">
        <div className="w-full max-w-4xl mx-auto py-8 px-3 md:px-8 mt-16 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton height="150px" />
            <Skeleton height="150px" />
          </div>
          <Skeleton height="300px" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-[Poppins] bg-gray-50 min-h-screen">
        <div className="w-full max-w-4xl mx-auto py-8 px-3 md:px-8 mt-16">
          <EmptyState
            title="Error Loading Wallet"
            description={error}
            icon={<FaExclamationCircle size={48} className="text-red-400" />}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="font-[Poppins] bg-gray-50 min-h-screen">
      <div className="w-full max-w-4xl mx-auto py-8 px-3 md:px-8 mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">My Wallet</h1>
          <p className="text-gray-600">Manage your balance and transactions</p>
        </div>

        {wallet ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Balance Card */}
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <FaWallet className="text-2xl" />
                </div>
                <h2 className="text-xl font-bold opacity-90">Total Balance</h2>
              </div>
              <p className="text-4xl font-black mb-4">₹{wallet.balance.toFixed(2)}</p>
              <div className="flex justify-between items-center">
                <p className="text-sm opacity-75">Available for bookings</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-sm"
                >
                  <FaPlus size={12} /> Add Money
                </button>
              </div>
            </Card>

            {/* YC Coins Card */}
            <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-none">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <FaCoins className="text-2xl" />
                </div>
                <h2 className="text-xl font-bold opacity-90">YC Coins</h2>
              </div>
              <p className="text-4xl font-black mb-2">{wallet.ycCoins}</p>
              <p className="text-sm opacity-75">Redeem for discounts</p>
            </Card>

            {/* Transactions Section */}
            <div className="md:col-span-2">
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                    <FaHistory />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                </div>

                <div className="space-y-4">
                  {wallet.transactions && wallet.transactions.length > 0 ? (
                    wallet.transactions.slice().reverse().map((tx) => (
                      <div key={tx._id} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type.includes('credit') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                            {tx.type.includes('credit') ? <FaArrowUp /> : <FaArrowDown />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 capitalize">{tx.note || tx.type.replace('_', ' ')}</p>
                            <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${tx.type.includes('credit') ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type.includes('credit') ? '+' : '-'} ₹{tx.amount.toFixed(2)}
                          </p>
                          <Badge variant={tx.status === 'failed' ? 'danger' : 'success'} size="sm">
                            {tx.status || 'Success'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      icon={<FaHistory size={48} className="text-gray-300" />}
                      title="No Transactions"
                      description="Your transaction history will appear here."
                    />
                  )}
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <EmptyState
            title="Wallet Not Found"
            description="We couldn't load your wallet details."
          />
        )}
      </div>

      {/* Add Money Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Money to Wallet</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={processing}
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={amountToAdd}
                    onChange={(e) => setAmountToAdd(e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-4 text-3xl font-bold text-gray-900 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-all placeholder:text-gray-200"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3">
                {[100, 200, 500, 1000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setAmountToAdd(amount.toString())}
                    className="flex-1 py-2 px-3 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    +₹{amount}
                  </button>
                ))}
              </div>

              <button
                onClick={handleAddMoney}
                disabled={processing || !amountToAdd}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>Processing...</>
                ) : (
                  <>Proceed to Pay</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserWalletPage;