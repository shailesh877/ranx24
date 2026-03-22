import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import toast from 'react-hot-toast';

import LocationStep from "./LocationStep";
import PersonalDetailsStep from "./PersonalDetailsStep";
import VerificationStep from "./VerificationStep";
import ServicesStep from "./ServicesStep";

const API_URL = import.meta.env.VITE_API_URL || "https://backend.ranx24.com/api";

const STEPS = {
  1: LocationStep,
  2: PersonalDetailsStep,
  3: VerificationStep,
  4: ServicesStep,
};

export default function WorkerRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate(); // Initialize useNavigate

  const [formData, setFormData] = useState({
    state: "",
    district: "",
    city: "",
    latitude: "",
    longitude: "",
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "", // Added email
    password: "", // Added
    confirmPassword: "", // Added
    livePhoto: null,
    aadhaarNumber: "", // New
    aadhaarFront: null, // New
    aadhaarBack: null, // New
    panNumber: "", // New
    panCard: null, // New
    categories: [],
    services: [],
    servicePricing: [], // Initialize servicePricing
  });

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const updateFormData = (data) => {
    setFormData({ ...formData, ...data });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    // manual fields
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("mobileNumber", formData.mobileNumber);
    data.append("email", formData.email); // Added email
    data.append("state", formData.state);
    data.append("district", formData.district);
    data.append("city", formData.city);
    data.append("latitude", formData.latitude);
    data.append("longitude", formData.longitude);
    data.append("aadhaarNumber", formData.aadhaarNumber);
    data.append("panNumber", formData.panNumber);
    data.append("password", formData.password); // Added password

    // live photo (File object directly)
    if (formData.livePhoto) {
      data.append("livePhoto", formData.livePhoto);
    }

    // aadhaar card (File object directly) - Front & Back
    if (formData.aadhaarFront) {
      data.append("aadhaarFront", formData.aadhaarFront);
    }
    if (formData.aadhaarBack) {
      data.append("aadhaarBack", formData.aadhaarBack);
    }

    // pan card (File object directly)
    if (formData.panCard) {
      data.append("panCard", formData.panCard);
    }

    // arrays
    formData.categories.forEach((c) => data.append("categories[]", c));
    formData.services.forEach((s) => data.append("services[]", s));

    // servicePricing (send as JSON string)
    if (formData.servicePricing && formData.servicePricing.length > 0) {
      data.append("servicePricing", JSON.stringify(formData.servicePricing));
    }

    try {
      const res = await axios.post(
        `${API_URL}/workers/register`,
        data
      );

      // Store token and user data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userType', 'worker');
      localStorage.setItem('user', JSON.stringify(res.data.worker));

      toast.success("Registration submitted! Welcome.");
      navigate('/worker-dashboard'); // Redirect to worker dashboard
    } catch (err) {
      console.log("Error:", err);
      toast.error(err.response?.data?.message || "Registration failed.");
    }
  };

  const CurrentStep = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-xl p-8 max-w-4xl w-full"
      >
        <CurrentStep
          formData={formData}
          updateFormData={updateFormData}
          handleNext={handleNext}
          handlePrev={handlePrev}
        />

        {currentStep === 4 && (
          <button
            type="submit"
            className="mt-6 w-full py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
          >
            Submit For Verification
          </button>
        )}
      </form>
    </div>
  );
}
