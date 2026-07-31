import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Card, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { Edit, Trash, Plus, MapPin, Users, Hash, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const VenueManagement = () => {
    const { user } = useContext(AuthContext);
    const [venues, setVenues] = useState([]);
    
    // Derived from endpoint that returns available & booked venues
    const [detailedVenues, setDetailedVenues] = useState({ available: [], booked: [] });
    // Filter controls
    const [filterDate, setFilterDate] = useState('');
    const [filterStart, setFilterStart] = useState('');
    const [filterEnd, setFilterEnd] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', location: '', capacity: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.token) {
            fetchVenues();
        }
    }, [user]);

    const fetchVenues = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/venues', { headers: { Authorization: `Bearer ${user.token}` } });
            setVenues(res.data);
            setDetailedVenues({ available: res.data, booked: [] }); // default state before query
        } catch (error) { console.error(error); }
    };

    const checkAvailability = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.get(`http://localhost:5000/api/venues/status?date=${filterDate}&startTime=${filterStart}&endTime=${filterEnd}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setDetailedVenues({ available: res.data.availableVenues, booked: res.data.bookedDetails });
        } catch (error) { alert('Error checking availability'); }
    };

    const resetFilters = () => {
        setFilterDate(''); setFilterStart(''); setFilterEnd('');
        setDetailedVenues({ available: venues, booked: [] });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (formData.id) {
                await axios.put(`http://localhost:5000/api/venues/${formData.id}`, formData, { headers: { Authorization: `Bearer ${user.token}` } });
            } else {
                await axios.post('http://localhost:5000/api/venues', formData, { headers: { Authorization: `Bearer ${user.token}` } });
            }
            setShowModal(false);
            fetchVenues();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving venue');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this venue?')) {
            try {
                await axios.delete(`http://localhost:5000/api/venues/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
                fetchVenues();
            } catch (err) { alert('Error deleting venue'); }
        }
    };

    const openCreate = () => {
        setFormData({ id: null, name: '', location: '', capacity: '' });
        setShowModal(true);
    };

    const handleEdit = (v) => {
        setFormData({ id: v._id, name: v.name, location: v.location, capacity: v.capacity });
        setShowModal(true);
    };

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--primary-color)' }}>Venue Registry</h3>
                    <p className="text-muted mb-0">Manage university spaces and check real-time availability.</p>
                </div>
                <Button variant="primary" onClick={openCreate} className="d-flex align-items-center gap-2 shadow-sm">
                    <Plus size={18} /> Register Venue
                </Button>
            </div>

            {/* Filter Section */}
            <Card className="p-4 mb-4 shadow-sm border-0">
                <Form onSubmit={checkAvailability} className="d-flex align-items-end gap-3 flex-wrap">
                    <div>
                        <Form.Label className="text-muted small fw-bold text-uppercase mb-1">Check Date</Form.Label>
                        <Form.Control type="date" required value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                    </div>
                    <div>
                        <Form.Label className="text-muted small fw-bold text-uppercase mb-1">Start Time</Form.Label>
                        <Form.Control type="time" required value={filterStart} onChange={(e) => setFilterStart(e.target.value)} />
                    </div>
                    <div>
                        <Form.Label className="text-muted small fw-bold text-uppercase mb-1">End Time</Form.Label>
                        <Form.Control type="time" required value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} />
                    </div>
                    <div className="d-flex gap-2 ms-auto">
                        <Button variant="light" type="button" onClick={resetFilters}>Clear Filters</Button>
                        <Button variant="primary" type="submit">Verify Availability</Button>
                    </div>
                </Form>
            </Card>
            
            <Card className="flex-grow-1 p-0 shadow-sm border-0 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="flex-grow-1 p-4 event-card-bg" style={{ overflowY: 'auto' }}>
                    
                    {/* Render Booked Venues if query exists */}
                    {detailedVenues.booked.length > 0 && (
                        <div className="mb-5">
                            <h6 className="text-uppercase fw-bold text-danger mb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Unavailable / Booked Spaces ({detailedVenues.booked.length})</h6>
                            <motion.div variants={containerVariants} initial="hidden" animate="show" className="row gy-3">
                                {detailedVenues.booked.map((b) => (
                                    <div className="col-md-6 col-lg-4" key={b.venue._id}>
                                        <motion.div variants={itemVariants}>
                                            <Card className="border-0 shadow-sm overflow-hidden h-100" style={{ outline: '1px solid rgba(227, 52, 47, 0.2)' }}>
                                                <div className="p-3" style={{ borderLeft: '4px solid #e3342f' }}>
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <h6 className="fw-bold mb-0 text-dark">{b.venue.name}</h6>
                                                        <Badge bg="danger">Booked</Badge>
                                                    </div>
                                                    <div className="text-muted d-flex align-items-center gap-2 mb-2" style={{ fontSize: '0.85rem' }}>
                                                        <MapPin size={14}/> {b.venue.location}
                                                    </div>
                                                    <div className="p-2 rounded bg-light" style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>
                                                        <div className="fw-medium">Occupied by: {b.event.title}</div>
                                                        <div className="text-muted small">From {b.event.startTime} - {b.event.endTime}</div>
                                                    </div>
                                                    <div className="mt-3 d-flex gap-2">
                                                        <Button variant="light" size="sm" className="flex-grow-1 rounded-pill" onClick={() => handleEdit(b.venue)}><Edit size={14} className="me-1"/> Edit</Button>
                                                        <Button variant="outline-danger" size="sm" className="rounded-pill" onClick={() => handleDelete(b.venue._id)}><Trash size={14}/></Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    )}

                    {/* Render Available or All Venues */}
                    <div>
                        <h6 className="text-uppercase fw-bold mb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px', color: (filterDate) ? '#2ecc71' : 'var(--primary-color)' }}>
                            {filterDate ? `Available Spaces (${detailedVenues.available.length})` : `All Venues (${venues.length})`}
                        </h6>
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="row gy-3">
                            {detailedVenues.available.length === 0 ? <p className="text-muted">No available venues found for this filter.</p> : null}
                            {detailedVenues.available.map((v) => (
                                <div className="col-md-6 col-lg-4" key={v._id}>
                                    <motion.div variants={itemVariants} className="h-100">
                                        <Card className="border-0 shadow-sm h-100" style={{ outline: filterDate ? '1px solid rgba(46, 204, 113, 0.4)' : 'none' }}>
                                            <div className="p-3" style={{ borderLeft: filterDate ? '4px solid #2ecc71' : '4px solid var(--accent-color)' }}>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h6 className="fw-bold mb-0 text-dark">{v.name}</h6>
                                                    {filterDate && <Badge bg="success">Available</Badge>}
                                                </div>
                                                <div className="text-muted d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.85rem' }}>
                                                    <MapPin size={14}/> {v.location}
                                                </div>
                                                <div className="text-muted d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                                                    <Users size={14}/> Capacity: {v.capacity}
                                                </div>
                                                
                                                <div className="mt-3 d-flex gap-2">
                                                    <Button variant="light" size="sm" className="flex-grow-1 rounded-pill" onClick={() => handleEdit(v)}><Edit size={14} className="me-1"/> Edit Config</Button>
                                                    <Button variant="outline-danger" size="sm" className="rounded-pill border-0" onClick={() => handleDelete(v._id)}><Trash size={14}/></Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                </div>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border-color, rgba(0,0,0,0.05))', padding: '1.5rem', borderRadius: '16px 16px 0 0' }} className="event-card-bg">
                    <Modal.Title style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{formData.id ? 'Edit Space Entry' : 'Register New Space'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {error && <div className="p-3 mb-4 rounded d-flex align-items-center gap-3" style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' }}><Info size={20}/> <span className="fw-medium">{error}</span></div>}
                    <Form onSubmit={handleSave}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-medium text-muted small text-uppercase">Venue Name</Form.Label>
                            <Form.Control required type="text" placeholder="e.g. Main Auditorium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-medium text-muted small text-uppercase">Location Designation</Form.Label>
                            <Form.Control required type="text" placeholder="e.g. North Wing, 1st Floor" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-medium text-muted small text-uppercase">Max Capacity (Personnel)</Form.Label>
                            <Form.Control required type="number" min="1" placeholder="e.g. 500" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                        </Form.Group>
                        
                        <Button variant="primary" type="submit" className="w-100 mb-2 py-2">Confirm & Save Registry</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </motion.div>
    );
};

export default VenueManagement;
