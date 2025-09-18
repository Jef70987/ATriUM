/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useSlug } from '../Tenants/TenantOperator';
import './Staff.css';
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

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

    if (loading) return <div className="loading">Loading staff...</div>;

    return (
        <div className="staff-container">
            <div className="header">
                <h1>Staff Management</h1>
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                >
                    + Add Staff
                </button>
            </div>

            <div className="staff-grid">
                {staff.map((member) => (
                    <div key={member.id} className="staff-card">
                        <div className="staff-image">
                                <img src={`${member.profile_pic}`} />
                            </div>
                        <div className="card-header">
                            <h3>{member.name}</h3>
                            <span className={`status ${member.is_active ? 'active' : 'inactive'}`}>
                                {member.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        
                        <div className="card-body">
                            <p><strong>ID:</strong> {member.staff_id}</p>
                            <p><strong>Specialization:</strong> {member.specialization || 'None'}</p>
                        </div>

                        <div className="card-actions">
                            <button 
                                className="btn btn-sm btn-secondary"
                                onClick={() => openEditModal(member)}
                            >
                                Edit
                            </button>
                            <button 
                                className="btn btn-sm btn-warning"
                                onClick={() => toggleActive(member)}
                            >
                                {member.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(member.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {staff.length === 0 && !loading && (
                <div className="empty-state">
                    <p>No staff members found.</p>
                </div>
            )}

            {showModal && (
                <div className="Staffmodal-overlay">
                    <div className="Staffmodal">
                        <div className="Staffmodal-header">
                            <h2>{editingStaff ? 'Edit Staff' : 'Add Staff'}</h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({...form, name: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Specialization</label>
                                <input
                                    type="text"
                                    value={form.specialization}
                                    onChange={(e) => setForm({...form, specialization: e.target.value})}
                                />
                            </div>

                            {editingStaff && (
                                <div className="form-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={form.is_active}
                                            onChange={(e) => setForm({...form, is_active: e.target.checked})}
                                        />
                                        Active
                                    </label>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" onClick={closeModal}>Cancel</button>
                                <button type="submit">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;