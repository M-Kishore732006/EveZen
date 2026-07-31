import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Card, Table, Button, Modal, Form, Alert, Badge, Tabs, Tab } from 'react-bootstrap';
import { Edit, Trash, Plus } from 'lucide-react';

const StaffManagement = () => {
    const { user } = useContext(AuthContext);
    const [faculty, setFaculty] = useState([]);
    const [staff, setStaff] = useState([]);
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
    }, [user]);

    const fetchUsers = async () => {
        try {
            const [fRes, sRes] = await Promise.all([
                axios.get('http://localhost:5000/api/users/faculty', { headers: { Authorization: `Bearer ${user.token}` } }),
                axios.get('http://localhost:5000/api/users/staff', { headers: { Authorization: `Bearer ${user.token}` } })
            ]);
            setFaculty(fRes.data);
            setStaff(sRes.data);
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
        });
        return count;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const endpoint = activeTab === 'faculty' ? 'faculty' : 'staff';
            if (formData.id) {
                await axios.put(`http://localhost:5000/api/users/${endpoint}/${formData.id}`, formData, { headers: { Authorization: `Bearer ${user.token}` } });
            } else {
                await axios.post(`http://localhost:5000/api/users/${endpoint}`, formData, { headers: { Authorization: `Bearer ${user.token}` } });
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving user');
        }
    };

    const handleDelete = async (id, isFaculty) => {
        if (window.confirm(`Delete this ${isFaculty ? 'Faculty' : 'Staff'} member?`)) {
            try {
                const endpoint = isFaculty ? 'faculty' : 'staff';
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

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 style={{ fontWeight: 600 }}>Staff Management</h4>
                <Button variant="primary" onClick={openCreate} className="d-flex align-items-center gap-2">
                    <Plus size={18} /> Add {activeTab === 'faculty' ? 'Faculty' : 'Staff'}
                </Button>
            </div>
            
            <Card className="p-0 shadow-sm border-0">
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="border-bottom-0">
                    <Tab eventKey="faculty" title="Faculty Members" className="p-0">
                        <Table responsive hover className="mb-0 border-top">
                            <thead style={{ backgroundColor: 'var(--bg-color)' }}>
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Assigned Events</th>
                                    <th className="text-end px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {faculty.map(f => (
                                    <tr key={f._id}>
                                        <td className="px-4 py-3 fw-medium">{f.name}</td>
                                        <td className="text-muted">{f.email}</td>
                                        <td className="text-muted">{f.phone}</td>
                                        <td className="text-muted">{getAssignedCount(f._id, 'faculty')} events</td>
                                        <td className="text-end px-4 pt-3">
                                            <Button variant="light" size="sm" className="me-2" onClick={() => handleEdit(f)}><Edit size={16} color="var(--secondary-color)" /></Button>
                                            <Button variant="light" size="sm" onClick={() => handleDelete(f._id, true)}><Trash size={16} color="#e3342f" /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Tab>
                    <Tab eventKey="staff" title="Supporting Staff" className="p-0">
                        <Table responsive hover className="mb-0 border-top">
                            <thead style={{ backgroundColor: 'var(--bg-color)' }}>
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Work Type</th>
                                    <th>Assigned Events</th>
                                    <th className="text-end px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map(s => (
                                    <tr key={s._id}>
                                        <td className="px-4 py-3 fw-medium">{s.name}</td>
                                        <td className="text-muted">{s.email}</td>
                                        <td className="text-muted">{s.phone}</td>
                                        <td><Badge bg="info">{s.workType}</Badge></td>
                                        <td className="text-muted">{getAssignedCount(s._id, 'staff')} events</td>
                                        <td className="text-end px-4 pt-3">
                                            <Button variant="light" size="sm" className="me-2" onClick={() => handleEdit(s)}><Edit size={16} color="var(--secondary-color)" /></Button>
                                            <Button variant="light" size="sm" onClick={() => handleDelete(s._id, false)}><Trash size={16} color="#e3342f" /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Tab>
                </Tabs>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title>{formData.id ? 'Edit' : 'Add'} {activeTab === 'faculty' ? 'Faculty' : 'Supporting Staff'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-3">
                    {error && <Alert variant="danger" className="mb-3 p-2">{error}</Alert>}
                    <Form onSubmit={handleSave}>
                        <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password {formData.id && '(Leave blank to keep unchanged)'}</Form.Label>
                            <Form.Control type="password" required={!formData.id} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </Form.Group>
                        {activeTab === 'staff' && (
                            <Form.Group className="mb-4">
                                <Form.Label>Work Type</Form.Label>
                                <Form.Select required value={formData.workType} onChange={e => setFormData({...formData, workType: e.target.value})}>
                                    <option value="">Select Work Type</option>
                                    <option value="Cleaner">Cleaner</option>
                                    <option value="Electrician">Electrician</option>
                                    <option value="Technician">Technician</option>
                                    <option value="Security">Security</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Form.Group>
                        )}
                        <Button variant="primary" type="submit" className="w-100 mb-2">Save User</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default StaffManagement;
