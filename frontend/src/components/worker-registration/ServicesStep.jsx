import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';

export default function ServicesStep({ formData, updateFormData, handlePrev }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [categoryPricing, setCategoryPricing] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_URL}/categories`);
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to fetch categories.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Initialize category pricing from existing data
  useEffect(() => {
    if (formData.servicePricing && formData.servicePricing.length > 0) {
      const pricing = {};
      formData.servicePricing.forEach(sp => {
        if (!pricing[sp.categoryName]) {
          pricing[sp.categoryName] = sp.price;
        }
      });
      setCategoryPricing(pricing);
    }
  }, []);

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    const newCategories = checked
      ? [...formData.categories, value]
      : formData.categories.filter((c) => c !== value);

    // If unchecking, remove the price for this category
    if (!checked) {
      const newPricing = { ...categoryPricing };
      delete newPricing[value];
      setCategoryPricing(newPricing);
    }

    updateFormData({ categories: newCategories, services: [] }); // Reset services when categories change
    setValidationError('');
  };

  const handleCategoryPriceChange = (categoryName, price) => {
    const newPricing = { ...categoryPricing, [categoryName]: price };
    setCategoryPricing(newPricing);
  };

  const handleServiceChange = (e, categoryName, subCategoryId) => {
    const { value, checked } = e.target;

    // Update services array (list of names)
    const newServices = checked
      ? [...formData.services, value]
      : formData.services.filter((s) => s !== value);

    updateFormData({ services: newServices });
  };

  const handleSubmit = (e) => {
    // Validate that all selected categories have prices
    const missingPrices = formData.categories.filter(cat => !categoryPricing[cat] || categoryPricing[cat] === '');

    if (formData.categories.length === 0) {
      setValidationError('Please select at least one category.');
      e.preventDefault();
      return;
    }

    if (missingPrices.length > 0) {
      setValidationError(`Please set prices for: ${missingPrices.join(', ')}`);
      e.preventDefault();
      return;
    }

    // Build servicePricing array with category-level pricing applied to all selected services
    const servicePricing = [];
    formData.services.forEach(serviceName => {
      // Find which category this service belongs to
      const category = categories.find(cat =>
        cat.subCategories.some(sub => sub.name === serviceName)
      );

      if (category && categoryPricing[category.name]) {
        const subCategory = category.subCategories.find(sub => sub.name === serviceName);
        servicePricing.push({
          serviceName: serviceName,
          categoryName: category.name,
          subCategoryId: subCategory._id,
          price: categoryPricing[category.name]
        });
      }
    });

    updateFormData({ servicePricing });
    setValidationError('');
  };

  if (loading) {
    return <div className="p-4 border rounded-lg text-center">Loading services...</div>;
  }

  if (error) {
    return <div className="p-4 border rounded-lg text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Step 4: Your Services</h3>

      <div className="mt-4">
        <label className="block text-base font-medium text-gray-900">Categories & Pricing</label>
        <p className="mt-1 text-sm text-gray-600">Select categories and set your price per day for each.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {categories.map((category) => {
            const isSelected = formData.categories.includes(category.name);
            return (
              <div key={category._id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-3">
                  <input
                    id={category._id}
                    type="checkbox"
                    value={category.name}
                    checked={isSelected}
                    onChange={handleCategoryChange}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={category._id} className="ml-2 block text-base font-semibold text-gray-900">
                    {category.name}
                  </label>
                </div>

                {isSelected && (
                  <div className="ml-7">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Price per Day (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={categoryPricing[category.name] || ''}
                      onChange={(e) => handleCategoryPriceChange(category.name, e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      required
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {validationError && <p className="text-red-500 text-sm italic mt-2">{validationError}</p>}
      </div>

      {formData.categories.length > 0 && (
        <div className="mt-6">
          <label className="block text-base font-medium text-gray-900">Specific Services You Offer</label>
          <p className="mt-1 text-sm text-gray-600">Select the specific services you are skilled in.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {formData.categories.map((selectedCategoryName) => {
              const selectedCategory = categories.find(cat => cat.name === selectedCategoryName);
              if (!selectedCategory || selectedCategory.subCategories.length === 0) return null;

              return (
                <div key={selectedCategory._id} className="border p-4 rounded-lg bg-white shadow-sm">
                  <h4 className="font-semibold text-blue-800 capitalize mb-3 border-b pb-2 flex items-center justify-between">
                    <span>{selectedCategory.name}</span>
                    <span className="text-sm text-green-600 font-bold">₹{categoryPricing[selectedCategory.name] || 0}/day</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedCategory.subCategories.map((service) => {
                      const isSelected = formData.services.includes(service.name);

                      return (
                        <div key={service._id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                          <input
                            id={service._id}
                            type="checkbox"
                            value={service.name}
                            checked={isSelected}
                            onChange={(e) => handleServiceChange(e, selectedCategory.name, service._id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={service._id} className="ml-2 block text-sm text-gray-900">
                            {service.name}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button type="button" onClick={handlePrev} className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">
          Previous
        </button>
        <button type="submit" onClick={handleSubmit} className="group relative flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          Submit for Verification
        </button>
      </div>
    </div>
  );
}
