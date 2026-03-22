import React from 'react';

const WalletManagement = ({ wallet, approvePayout }) => {
  return (
    <>
      <h2 className="text-2xl font-black text-blue-900 mb-4 flex items-center gap-2">
        <i className="fa-solid fa-wallet text-indigo-600"></i> Wallet & Payouts
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Total Earnings */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center">
          <h3 className="font-bold text-gray-500 text-lg">Total Platform Earnings</h3>
          <div className="text-5xl font-black mt-4 text-blue-900">
            ₹{wallet?.totalEarnings?.toLocaleString('en-IN') || 0}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Total earnings from all completed bookings
          </p>
        </div>

        {/* Payout Management */}
        <div className="lg:col-span-2">
          {/* Pending Payouts */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Pending Payout Requests</h3>
            <div className="space-y-3">
              {(wallet?.pendingPayouts || []).length > 0 ? (
                wallet.pendingPayouts.map((payout) => (
                  <div key={payout.id} className="flex justify-between items-center p-3 rounded-lg border hover:bg-gray-50">
                    <span className="font-semibold">{payout.worker}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg">₹{payout.amount.toLocaleString('en-IN')}</span>
                      <button 
                        onClick={() => approvePayout(payout.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 font-semibold text-sm transition"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No pending payout requests.</p>
              )}
            </div>
          </div>

          {/* Approved Payouts */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Recently Approved Payouts</h3>
            <div className="space-y-3">
              {(wallet?.approvedPayouts || []).length > 0 ? (
                wallet.approvedPayouts.map((payout) => (
                  <div key={payout.id} className="flex justify-between items-center p-3 rounded-lg border bg-green-50">
                    <span className="font-semibold text-green-800">{payout.worker}</span>
                    <span className="font-bold text-lg text-green-800">₹{payout.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No approved payouts found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WalletManagement;
