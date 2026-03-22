import React, { useState } from 'react';

export default function VerificationStep({ formData, updateFormData, handleNext, handlePrev }) {
  const [livePhotoFile, setLivePhotoFile] = useState(formData.livePhoto);
  const [aadhaarNumber, setAadhaarNumber] = useState(formData.aadhaarNumber || '');
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState(formData.aadhaarFront);
  const [aadhaarBackFile, setAadhaarBackFile] = useState(formData.aadhaarBack);
  const [panNumber, setPanNumber] = useState(formData.panNumber || '');
  const [panCardFile, setPanCardFile] = useState(formData.panCard);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!livePhotoFile) {
      newErrors.livePhoto = 'Live photo is required.';
    }
    if (!aadhaarNumber) {
      newErrors.aadhaarNumber = 'Aadhaar number is required.';
    }
    if (!aadhaarFrontFile) {
      newErrors.aadhaarFront = 'Aadhaar front photo is required.';
    }
    if (!aadhaarBackFile) {
      newErrors.aadhaarBack = 'Aadhaar back photo is required.';
    }
    // PAN card and number are optional, so no validation here
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextClick = () => {
    if (validate()) {
      updateFormData({
        aadhaarNumber,
        aadhaarFront: aadhaarFrontFile,
        aadhaarBack: aadhaarBackFile,
        panNumber,
        panCard: panCardFile,
      });
      handleNext();
    }
  };

  const handleLivePhotoChange = (e) => {
    const file = e.target.files[0];
    setLivePhotoFile(file);
    updateFormData({ livePhoto: file });
    setErrors(prev => ({ ...prev, livePhoto: '' }));
  };

  const handleAadhaarNumberChange = (e) => {
    setAadhaarNumber(e.target.value);
    updateFormData({ aadhaarNumber: e.target.value });
    setErrors(prev => ({ ...prev, aadhaarNumber: '' }));
  };

  const handleAadhaarFrontChange = (e) => {
    const file = e.target.files[0];
    setAadhaarFrontFile(file);
    updateFormData({ aadhaarFront: file });
    setErrors(prev => ({ ...prev, aadhaarFront: '' }));
  };

  const handleAadhaarBackChange = (e) => {
    const file = e.target.files[0];
    setAadhaarBackFile(file);
    updateFormData({ aadhaarBack: file });
    setErrors(prev => ({ ...prev, aadhaarBack: '' }));
  };

  const handlePanNumberChange = (e) => {
    setPanNumber(e.target.value);
    updateFormData({ panNumber: e.target.value });
  };

  const handlePanCardChange = (e) => {
    const file = e.target.files[0];
    setPanCardFile(file);
    updateFormData({ panCard: file });
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Step 3: Verification</h3>


      <div className="mt-4">
        <label htmlFor="livePhoto" className="block text-sm font-medium text-gray-700">Upload Photo</label>
        <p className="mt-1 text-sm text-gray-600">Please upload a clear, recent photo of yourself.</p>
        <input
          type="file"
          id="livePhoto"
          onChange={handleLivePhotoChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          accept="image/*"
        />
        {livePhotoFile && <p className="mt-2 text-sm text-gray-500">Selected: {livePhotoFile.name}</p>}
        {errors.livePhoto && <p className="text-red-500 text-xs italic mt-1">{errors.livePhoto}</p>}
      </div>

      <div className="mt-6">
        <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
        <input
          type="text"
          id="aadhaarNumber"
          value={aadhaarNumber}
          onChange={handleAadhaarNumberChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Enter your 12-digit Aadhaar number"
        />
        {errors.aadhaarNumber && <p className="text-red-500 text-xs italic mt-1">{errors.aadhaarNumber}</p>}
      </div>

      <div className="mt-6">
        <label htmlFor="aadhaarFront" className="block text-sm font-medium text-gray-700">Upload Aadhaar Card Front</label>
        <input
          type="file"
          id="aadhaarFront"
          onChange={handleAadhaarFrontChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          accept="image/*,.pdf"
        />
        {aadhaarFrontFile && <p className="mt-2 text-sm text-gray-500">Selected: {aadhaarFrontFile.name}</p>}
        {errors.aadhaarFront && <p className="text-red-500 text-xs italic mt-1">{errors.aadhaarFront}</p>}
      </div>

      <div className="mt-6">
        <label htmlFor="aadhaarBack" className="block text-sm font-medium text-gray-700">Upload Aadhaar Card Back</label>
        <input
          type="file"
          id="aadhaarBack"
          onChange={handleAadhaarBackChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          accept="image/*,.pdf"
        />
        {aadhaarBackFile && <p className="mt-2 text-sm text-gray-500">Selected: {aadhaarBackFile.name}</p>}
        {errors.aadhaarBack && <p className="text-red-500 text-xs italic mt-1">{errors.aadhaarBack}</p>}
      </div>

      <div className="mt-6">
        <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700">PAN Number (Optional)</label>
        <input
          type="text"
          id="panNumber"
          value={panNumber}
          onChange={handlePanNumberChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Enter your PAN number"
        />
      </div>

      <div className="mt-6">
        <label htmlFor="panCard" className="block text-sm font-medium text-gray-700">Upload PAN Card (Optional)</label>
        <input
          type="file"
          id="panCard"
          onChange={handlePanCardChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          accept="image/*,.pdf"
        />
        {panCardFile && <p className="mt-2 text-sm text-gray-500">Selected: {panCardFile.name}</p>}
      </div>

      <div className="mt-6 flex justify-between">
        <button type="button" onClick={handlePrev} className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">
          Previous
        </button>
        <button type="button" onClick={handleNextClick} className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          Next
        </button>
      </div>
    </div>
  );
}
