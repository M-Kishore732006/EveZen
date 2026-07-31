import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { Edit, Trash, Plus } from 'lucide-react';

const VenueManagement = () => {
    const { user } = useContext(AuthContext);
    const [venues, setVenues] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', location: '', capacity: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.token) fetchVenues();
    }, [user]);

    const fetchVenues = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/venues', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setVenues(res.data);
        } catch (error) {
            console.error('Error fetching venues:', error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (formData.id) {
                await axios.put(`http://localhost:5000/api/venues/${formData.id}`, formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
            } else {
                await axios.post('http://localhost:5000/api/venues', formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
            }
            setShowModal(false);
            fetchVenues();
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this venue?')) {
            try {
                await axios.delete(`http://localhost:5000/api/venues/${id}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                fetchVenues();
            } catch (err) {
                alert('Error deleting venue');
            }
        }
    };

    const handleEdit = (v) => {
        setFormData({ id: v._id, name: v.name, location: v.location, capacity: v.capacity });
        setShowModal(true);
    };

    const openCreate = () => {
        setFormData({ id: null, name: '', location: '', capacity: '' });
        setShowModal(true);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 style={{ fontWeight: 600 }}>Venue Management</h4>
                <Button variant="primary" onClick={openCreate} className="d-flex align-items-center gap-2">
                    <Plus size={18} /> Add Venue
                </Button>
            </div>
            
            <Card className="p-0 shadow-sm border-0">
                <Table responsive hover className="mb-0">
                    <thead style={{ backgroundColor: 'var(--bg-color)' }}>
                        <tr>
                            <th className="px-4 py-3">Venue Name</th>
                            <th className="py-3">Location</th>
                            <th className="py-3">Capacity</th>
                            <th className="px-4 py-3 text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {venues.map(v => (
                            <tr key={v._id}>
                                <td className="px-4 py-3 fw-medium">{v.name}</td>
                                <td className="py-3 text-muted">{v.location}</td>
                                <td className="py-3 text-muted">{v.capacity}</td>
                                <td className="px-4 py-3 text-end">
                                    <Button variant="light" size="sm" className="me-2" onClick={() => handleEdit(v)}>
                                        <Edit size={16} color="var(--secondary-color)" />
                                    </Button>
                                    <Button variant="light" size="sm" onClick={() => handleDelete(v._id)}>
                                        <Trash size={16} color="#e3342f" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {venues.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-4 text-muted">No venues found.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title>{formData.id ? 'Edit Venue' : 'Create Venue'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-3">
                    {error && <Alert variant="danger" className="mb-3 p-2">{error}</Alert>}
                    <Form onSubmit={handleSave}>
                        <Form.Group className="mb-3">
                            <Form.Label>Venue Name</Form.Label>
                            <Form.Control required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Location / Building</Form.Label>
                            <Form.Control required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label>Seating Capacity</Form.Label>
                            <Form.Control required type="number" min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">Save Venue</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default VenueManagement;
