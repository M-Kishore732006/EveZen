import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Card, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { Edit, Trash, Plus, Mail, Phone, Calendar as CalendarIcon, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const StaffManagement = () => {
    const { user } = useContext(AuthContext);
    const [faculty, setFaculty] = useState([]);
    const [staff, setStaff] = useState([]);
    const [students, setStudents] = useState([]);
    const [events, setEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('faculty');

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', email: '', phone: '', password: '', workType: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.token) {
            fetchUsers();
            fetchEvents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchUsers = async () => {
        try {
            const [fRes, sRes, stuRes] = await Promise.all([
                axios.get('http://localhost:5000/api/users/faculty', { headers: { Authorization: `Bearer ${user.token}` } }),
                axios.get('http://localhost:5000/api/users/staff', { headers: { Authorization: `Bearer ${user.token}` } }),
                axios.get('http://localhost:5000/api/users/students', { headers: { Authorization: `Bearer ${user.token}` } })
            ]);
            setFaculty(fRes.data);
            setStaff(sRes.data);
            setStudents(stuRes.data);
        } catch (error) { console.error(error); }
    };

    const fetchEvents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/events', { headers: { Authorization: `Bearer ${user.token}` } });
            setEvents(res.data);
        } catch (error) { console.error(error); }
    };

    const getAssignedCount = (userId, type) => {
        let count = 0;
        events.forEach(ev => {
            if (type === 'faculty' && ev.assignedFaculty?.some(f => f._id === userId)) count++;
            if (type === 'staff' && ev.assignedStaff?.some(s => s._id === userId)) count++;
            if (type === 'students' && ev.registeredStudents?.some(s => s._id === userId || s === userId)) count++;
        });
        return count;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const endpoint = activeTab === 'faculty' ? 'faculty' : 'staff';
            const payload = { ...formData };
            if (!payload.workType) delete payload.workType;

            if (formData.id) {
                await axios.put(`http://localhost:5000/api/users/${endpoint}/${formData.id}`, payload, { headers: { Authorization: `Bearer ${user.token}` } });
            } else {
                await axios.post(`http://localhost:5000/api/users/${endpoint}`, payload, { headers: { Authorization: `Bearer ${user.token}` } });
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving user');
        }
    };

    const handleDelete = async (id, isFaculty) => {
        if (window.confirm(`Delete this user?`)) {
            try {
                const endpoint = activeTab === 'faculty' ? 'faculty' : activeTab === 'staff' ? 'staff' : 'students';
                await axios.delete(`http://localhost:5000/api/users/${endpoint}/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
                fetchUsers();
            } catch (err) { alert('Error deleting user'); }
        }
    };

    const openCreate = () => {
        setFormData({ id: null, name: '', email: '', phone: '', password: '', workType: '' });
        setShowModal(true);
    };

    const handleEdit = (u) => {
        setFormData({ id: u._id, name: u.name, email: u.email, phone: u.phone, password: '', workType: u.workType || '' });
        setShowModal(true);
    };

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
    const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

    const activeList = activeTab === 'faculty' ? faculty : activeTab === 'staff' ? staff : students;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--primary-color)' }}>Staff Roll</h3>
                    <p className="text-muted mb-0">Manage personnel assignments and directory accounts.</p>
                </div>
                <Button variant="primary" onClick={openCreate} className="d-flex align-items-center gap-2 shadow-sm" style={{ visibility: activeTab === 'students' ? 'hidden' : 'visible' }}>
                    <Plus size={18} /> Register {activeTab === 'faculty' ? 'Faculty' : 'Staff'}
                </Button>
            </div>

            {/* Custom Pill Tabs */}
            <div className="d-flex p-1 mb-4" style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '12px', width: 'fit-content' }}>
                <button 
                    className="border-0 px-4 py-2" 
                    style={{ 
                        borderRadius: '8px', 
                        backgroundColor: activeTab === 'faculty' ? 'var(--card-bg)' : 'transparent', 
                        color: activeTab === 'faculty' ? 'var(--primary-color)' : 'var(--text-muted)',
                        fontWeight: activeTab === 'faculty' ? 600 : 500,
                        boxShadow: activeTab === 'faculty' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => setActiveTab('faculty')}
                >
                    Faculty Members
                </button>
                <button 
                    className="border-0 px-4 py-2" 
                    style={{ 
                        borderRadius: '8px', 
                        backgroundColor: activeTab === 'staff' ? 'var(--card-bg)' : 'transparent', 
                        color: activeTab === 'staff' ? 'var(--primary-color)' : 'var(--text-muted)',
                        fontWeight: activeTab === 'staff' ? 600 : 500,
                        boxShadow: activeTab === 'staff' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => setActiveTab('staff')}
                >
                    Supporting Staff
                </button>
            </div>

            <Card className="flex-grow-1 p-0 shadow-sm border-0 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="event-card-bg px-4 py-3 d-flex" style={{ borderBottom: '1px solid var(--border-color, rgba(0,0,0,0.05))', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <div style={{ flex: '2 1 0' }}>Profile</div>
                    <div style={{ flex: '1.5 1 0' }}>Contact</div>
                    {activeTab === 'staff' && <div style={{ flex: '1 1 0' }}>Work Type</div>}
                    <div style={{ flex: '1 1 0' }}>Assignments</div>
                    <div style={{ flex: '0.5 1 0', textAlign: 'right' }}>Actions</div>
                </div>

                <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
                    {activeList.length === 0 ? (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted p-5">
                            <Briefcase size={48} className="mb-3" style={{ opacity: 0.2 }} />
                            <h5>No personnel found</h5>
                            <p>Register new members to populate this directory.</p>
                        </div>
                    ) : (
                        <motion.div key={activeTab} variants={containerVariants} initial="hidden" animate="show">
                            {activeList.map(item => (
                                <motion.div variants={itemVariants} key={item._id} className="px-4 py-3 border-bottom d-flex align-items-center" style={{ transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(0,0,0,0.02))'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <div style={{ flex: '2 1 0' }} className="d-flex align-items-center gap-3">
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(108, 99, 255, 0.1)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {item.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="fw-semibold text-dark" style={{ fontSize: '0.95rem' }}>{item.name}</div>
                                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>ID: {item._id.substring(item._id.length - 6).toUpperCase()}</div>
                                        </div>
                                    </div>
                                    <div style={{ flex: '1.5 1 0' }}>
                                        <div className="d-flex align-items-center gap-2 text-dark" style={{ fontSize: '0.85rem' }}>
                                            <Mail size={14} className="text-muted" /> {item.email}
                                        </div>
                                        <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                                            <Phone size={14} /> {item.phone}
                                        </div>
                                    </div>
                                    {activeTab === 'staff' && (
                                        <div style={{ flex: '1 1 0' }}>
                                            <Badge bg="light" text="dark" style={{ border: '1px solid rgba(0,0,0,0.1)' }}>{item.workType}</Badge>
                                        </div>
                                    )}
                                    <div style={{ flex: '1 1 0' }}>
                                        <div className="d-flex align-items-center gap-2">
                                            <CalendarIcon size={14} className="text-muted" /> 
                                            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--primary-color)' }}>
                                                {getAssignedCount(item._id, activeTab)} events
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ flex: '0.5 1 0', textAlign: 'right' }} className="d-flex justify-content-end gap-2">
                                        <button className="btn btn-light btn-sm rounded-circle p-2 d-flex" onClick={() => handleEdit(item)}><Edit size={16} className="text-primary" /></button>
                                        <button className="btn btn-light btn-sm rounded-circle p-2 d-flex" onClick={() => handleDelete(item._id, activeTab === 'faculty')}><Trash size={16} className="text-danger" /></button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border-color, rgba(0,0,0,0.05))', padding: '1.5rem', borderRadius: '16px 16px 0 0' }} className="event-card-bg">
                    <Modal.Title style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{formData.id ? 'Edit Profile' : 'Register Member'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {error && <Alert variant="danger" className="mb-3 p-2 border-0" style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' }}>{error}</Alert>}
                    <Form onSubmit={handleSave}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-medium text-muted small text-uppercase">Full Name</Form.Label>
                            <Form.Control required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-medium text-muted small text-uppercase">Email Address</Form.Label>
                            <Form.Control required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-medium text-muted small text-uppercase">Phone Number</Form.Label>
                            <Form.Control required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-medium text-muted small text-uppercase">Password {formData.id && <span className="text-lowercase fw-normal">(Leave blank to keep unchanged)</span>}</Form.Label>
                            <Form.Control type="password" required={!formData.id} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </Form.Group>
                        {activeTab === 'staff' && (
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-medium text-muted small text-uppercase">Work Type (Role)</Form.Label>
                                <Form.Select required value={formData.workType} onChange={e => setFormData({...formData, workType: e.target.value})}>
                                    <option value="">Select Specialization</option>
                                    <option value="Cleaner">Cleaner</option>
                                    <option value="Electrician">Electrician</option>
                                    <option value="Technician">Technician</option>
                                    <option value="Security">Security</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Form.Group>
                        )}
                        <Button variant="primary" type="submit" className="w-100 mb-2 py-2 mt-2">Save Profile Details</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </motion.div>
    );
};

export default StaffManagement;
