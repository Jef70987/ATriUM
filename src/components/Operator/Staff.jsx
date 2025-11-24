/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useSlug } from '../Tenants/TenantOperator';
const API_URL = import.meta.env.VITE_API_URL;

const Staff = () => {
    const slug = useSlug();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [form, setForm] = useState({ 
        name: '', 
        specialization: '',
        is_active: true 
    });

    useEffect(() => {
        fetchStaff();
    }, [slug]);

    const fetchStaff = async () => {
        try {
            const response = await fetch(`${API_URL}/${slug}/staff/`);
            const data = await response.json();
            setStaff(data);
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const csrfToken = await getCsrfToken();
            const url = editingStaff 
                ? `${API_URL}/${slug}/get/staff/${editingStaff.id}/`
                : `${API_URL}/${slug}/add/staff/`;
            
            const method = editingStaff ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                setShowModal(false);
                setForm({ name: '', specialization: '', is_active: true });
                setEditingStaff(null);
                fetchStaff();
            }
        } catch (error) {
            console.error('Error saving staff:', error);
        }
    };

    const handleDelete = async (staffId) => {
        if (!window.confirm('Are you sure you want to delete this staff member?')) return;

        try {
            const csrfToken = await getCsrfToken();
            const response = await fetch(`${API_URL}/${slug}/staff/${staffId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrfToken,
                }
            });

            if (response.ok) {
                fetchStaff();
            }
        } catch (error) {
            console.error('Error deleting staff:', error);
        }
    };

    const toggleActive = async (staff) => {
        try {
            const csrfToken = await getCsrfToken();
            const response = await fetch(`${API_URL}/${slug}/staff/${staff.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({
                    ...staff,
                    is_active: !staff.is_active
                })
            });

            if (response.ok) {
                fetchStaff();
            }
        } catch (error) {
            console.error('Error updating staff:', error);
        }
    };

    const getCsrfToken = async () => {
        const response = await fetch(`${API_URL}/csrf-token/`);
        const data = await response.json();
        return data.csrfToken;
    };

    const openEditModal = (staff) => {
        setEditingStaff(staff);
        setForm({
            name: staff.name,
            specialization: staff.specialization,
            is_active: staff.is_active
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingStaff(null);
        setForm({ name: '', specialization: '', is_active: true });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-6 w-full">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8">
                <div className="mb-4 lg:mb-0">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Staff Management</h1>
                    <p className="text-gray-600 mt-1">Manage your beauty parlour staff members</p>
                </div>
                <button 
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 font-semibold flex items-center space-x-2 w-full lg:w-auto justify-center"
                    onClick={() => setShowModal(true)}
                >
                    <span>+</span>
                    <span>Add Staff</span>
                </button>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {staff.map((member) => (
                    <div key={member.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
                        {/* Staff Image */}
                        <div className="h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center overflow-hidden">
                            {member.profile_pic ? (
                                <img 
                                    src={member.profile_pic} 
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {member.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        
                        {/* Card Content */}
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">{member.name}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    member.is_active 
                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                        : 'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                    {member.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="font-medium w-20">ID:</span>
                                    <span className="text-gray-900">{member.staff_id}</span>
                                </div>
                                <div className="flex items-start text-sm text-gray-600">
                                    <span className="font-medium w-20">Specialty:</span>
                                    <span className="text-gray-900 flex-1">{member.specialization || 'Not specified'}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col space-y-2">
                                <button 
                                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-sm border border-blue-200"
                                    onClick={() => openEditModal(member)}
                                >
                                    Edit Profile
                                </button>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        className={`px-3 py-2 rounded-lg transition-colors duration-200 font-medium text-sm border ${
                                            member.is_active 
                                                ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200' 
                                                : 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200'
                                        }`}
                                        onClick={() => toggleActive(member)}
                                    >
                                        {member.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button 
                                        className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors duration-200 font-medium text-sm border border-red-200"
                                        onClick={() => handleDelete(member.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {staff.length === 0 && !loading && (
                <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">👥</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Staff Members</h3>
                    <p className="text-gray-600 mb-6">Get started by adding your first staff member</p>
                    <button 
                        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 font-semibold"
                        onClick={() => setShowModal(true)}
                    >
                        + Add First Staff
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-scale-in">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingStaff ? 'Edit Staff' : 'Add Staff'}
                            </h2>
                            <button 
                                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
                                onClick={closeModal}
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({...form, name: e.target.value})}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 outline-none"
                                    placeholder="Enter staff name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Specialization
                                </label>
                                <input
                                    type="text"
                                    value={form.specialization}
                                    onChange={(e) => setForm({...form, specialization: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 outline-none"
                                    placeholder="e.g., Hair Stylist, Makeup Artist"
                                />
                            </div>

                            {editingStaff && (
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={form.is_active}
                                        onChange={(e) => setForm({...form, is_active: e.target.checked})}
                                        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                                    />
                                    <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                                        Active Staff Member
                                    </label>
                                </div>
                            )}

                            {/* Modal Actions */}
                            <div className="flex space-x-3 pt-4">
                                <button 
                                    type="button" 
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 font-semibold"
                                >
                                    {editingStaff ? 'Update' : 'Add'} Staff
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;