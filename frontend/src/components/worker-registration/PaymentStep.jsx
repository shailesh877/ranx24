import React from 'react';

export default function PaymentStep({ 
  formData, 
  updateFormData, 
  handlePrev, 
  registrationFee, 
  acceptedTerms, 
  setAcceptedTerms,
  isSubmitting
}) {
  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <i className="fa-solid fa-shield-check text-blue-600"></i>
        Step 5: Review & Registration Fee
      </h3>

      <div className="space-y-6">
        {/* Terms & Conditions */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <label className="flex items-start gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
            />
            <div className="flex-1">
              <span className="text-sm text-gray-700 leading-relaxed font-medium">
                I accept the <a href="/terms" target="_blank" className="text-blue-700 font-bold hover:underline">Terms & Conditions</a>, Disclaimer, and Service Policies of RanX24.
              </span>
              <p className="text-xs text-gray-400 mt-1 italic">Please read carefully before proceeding.</p>
            </div>
          </label>
        </div>

        {/* Payment Summary */}
        {registrationFee > 0 ? (
          <div className="p-6 bg-blue-50 border-2 border-blue-100 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-blue-200">
              <span className="text-gray-600 font-medium">Registration Fee</span>
              <span className="text-2xl font-black text-blue-700 tracking-tight">₹{registrationFee}</span>
            </div>
            
            <div className="flex items-start gap-3 mt-4">
              <div className="bg-blue-200 p-1.5 rounded-full mt-0.5">
                <i className="fa-solid fa-sparkles text-blue-700 text-xs"></i>
              </div>
              <p className="text-sm text-blue-900 leading-tight">
                This is a <span className="font-bold">one-time mandatory</span> verification fee. Pay via Razorpay to complete your registration.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-green-50 border border-green-100 rounded-xl flex items-center gap-4">
             <div className="bg-green-100 p-3 rounded-full text-green-600">
               <i className="fa-solid fa-gift text-lg"></i>
             </div>
             <div>
               <h4 className="font-bold text-green-800">Registration is Free!</h4>
               <p className="text-sm text-green-700">Currently, there is no registration fee for new workers. Happy onboarding!</p>
             </div>
          </div>
        )}

        {/* Buttons */}
        <div className="pt-4 flex flex-col gap-3">
          <button
            type="submit"
            disabled={!acceptedTerms || isSubmitting}
            className={`w-full py-4 text-white text-lg rounded-xl font-bold shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 ${
              acceptedTerms && !isSubmitting 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-400 cursor-not-allowed opacity-70'
            }`}
          >
            {isSubmitting ? (
              <><i className="fa-solid fa-spinner-third fa-spin"></i> Processing...</>
            ) : registrationFee > 0 ? (
              <><i className="fa-solid fa-credit-card"></i> Pay ₹{registrationFee} & Register</>
            ) : (
              <><i className="fa-solid fa-check-to-slot"></i> Complete Registration</>
            )}
          </button>

          <button 
            type="button" 
            onClick={handlePrev}
            disabled={isSubmitting}
            className="w-full py-2.5 text-gray-500 font-semibold hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
          >
            Back to Services
          </button>
        </div>
      </div>
    </div>
  );
}
