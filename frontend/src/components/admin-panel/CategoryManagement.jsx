import React, { useState } from "react";
import { useAdmin } from "../../context/AdminContext";

const CategoryManagement = () => {
  const {
    categories,
    subCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory
  } = useAdmin();

  // Category State
  const [catForm, setCatForm] = useState("");
  const [editingCat, setEditingCat] = useState(null);
  const [categoryImage, setCategoryImage] = useState(null);

  // SubCategory State
  const [subForm, setSubForm] = useState({ name: "", parentId: "" });
  const [editingSub, setEditingSub] = useState(null);
  const [subCategoryImage, setSubCategoryImage] = useState(null);

  // Category Handlers
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!catForm.trim()) return alert("Category name cannot be empty.");

    const formData = new FormData();
    formData.append('name', catForm);
    if (categoryImage) formData.append('image', categoryImage);

    let success;
    if (editingCat) {
      success = await updateCategory(editingCat._id, formData);
    } else {
      success = await addCategory(formData);
    }

    if (success) {
      setCatForm("");
      setEditingCat(null);
      setCategoryImage(null);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCat(category);
    setCatForm(category.name);
    setCategoryImage(null);
  };

  // SubCategory Handlers
  const handleSubCategorySubmit = async (e) => {
    e.preventDefault();
    if (!subForm.name.trim() || (!subForm.parentId && !editingSub)) return alert("All fields required.");

    const formData = new FormData();
    formData.append('name', subForm.name);
    if (subCategoryImage) formData.append('image', subCategoryImage);

    let success;
    if (editingSub) {
      success = await updateSubCategory(editingSub.parentId, editingSub._id, formData);
    } else {
      success = await addSubCategory(subForm.parentId, formData);
    }

    if (success) {
      setSubForm({ name: "", parentId: "" });
      setEditingSub(null);
      setSubCategoryImage(null);
    }
  };

  const handleEditSub = (sub) => {
    setEditingSub(sub);
    setSubForm({ name: sub.name, parentId: sub.parentId });
    setSubCategoryImage(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      {/* Category Management */}
      <div>
        <h2 className="text-2xl font-black text-blue-900 mb-4 flex items-center gap-2"><i className="fa-solid fa-tag text-purple-600"></i> Manage Categories</h2>
        <form onSubmit={handleCategorySubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{editingCat ? 'Edit Category' : 'Add New Category'}</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input type="text" value={catForm} onChange={(e) => setCatForm(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
            <input type="file" onChange={(e) => setCategoryImage(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition">{editingCat ? 'Update' : 'Add'}</button>
            {editingCat && <button type="button" onClick={() => { setEditingCat(null); setCatForm(""); setCategoryImage(null); }} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>}
          </div>
        </form>
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Existing Categories</h3>
          <ul className="space-y-2">
            {categories.map(cat => (
              <li key={cat._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-sky-50 transition-colors">
                <span className="font-semibold text-gray-700">{cat.name}</span>
                <div className="flex gap-3">
                  <button onClick={() => handleEditCategory(cat)} className="text-blue-500 hover:text-blue-700 cursor-pointer"><i className="fa-solid fa-pen-to-square"></i></button>
                  <button onClick={() => deleteCategory(cat._id)} className="text-red-500 hover:text-red-700 cursor-pointer"><i className="fa-solid fa-trash"></i></button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sub-Category Management */}
      <div>
        <h2 className="text-2xl font-black text-blue-900 mb-4 flex items-center gap-2"><i className="fa-solid fa-tags text-orange-600"></i> Manage Sub-Categories</h2>
        <form onSubmit={handleSubCategorySubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{editingSub ? 'Edit Sub-Category' : 'Add New Sub-Category'}</h3>
          {!editingSub && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
              <select value={subForm.parentId} onChange={(e) => setSubForm({ ...subForm, parentId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200" required={!editingSub}>
                <option value="">Select Parent</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category Name</label>
            <input type="text" value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category Image</label>
            <input type="file" onChange={(e) => setSubCategoryImage(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition">{editingSub ? 'Update' : 'Add'}</button>
            {editingSub && <button type="button" onClick={() => { setEditingSub(null); setSubForm({ name: '', parentId: '' }); setSubCategoryImage(null); }} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>}
          </div>
        </form>
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Existing Sub-Categories</h3>
          <ul className="space-y-2">
            {subCategories.map(sub => (
              <li key={sub._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-sky-50 transition-colors">
                <div>
                  <span className="font-semibold text-gray-700">{sub.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({sub.parentName})</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEditSub(sub)} className="text-blue-500 hover:text-blue-700 cursor-pointer"><i className="fa-solid fa-pen-to-square"></i></button>
                  <button onClick={() => deleteSubCategory(sub.parentId, sub._id)} className="text-red-500 hover:text-red-700 cursor-pointer"><i className="fa-solid fa-trash"></i></button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
