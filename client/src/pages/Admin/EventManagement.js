import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Card, Button, Modal, Form, Badge } from 'react-bootstrap';
import { Edit, Trash, Plus, Calendar, Clock, MapPin, Info, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Select from 'react-select';

const EventManagement = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [venues, setVenues] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [staffList, setStaffList] = useState([]);
    
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [selectedEventForParticipants, setSelectedEventForParticipants] = useState(null);
    
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id: null, title: '', description: '', participationType: 'Individual', teamSize: 1, capacity: 50,
        date: '', startTime: '', endTime: '', venue: '', assignedFaculty: [], assignedStaff: []
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.token) {
            fetchEvents();
            fetchLookups();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchEvents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/events', { headers: { Authorization: `Bearer ${user.token}` } });
            setEvents(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchLookups = async () => {
        try {
            const [vRes, fRes, sRes] = await Promise.all([
                axios.get('http://localhost:5000/api/venues', { headers: { Authorization: `Bearer ${user.token}` } }),
                axios.get('http://localhost:5000/api/users/faculty', { headers: { Authorization: `Bearer ${user.token}` } }),
                axios.get('http://localhost:5000/api/users/staff', { headers: { Authorization: `Bearer ${user.token}` } })
            ]);
            setVenues(vRes.data);
            setFacultyList(fRes.data);
            setStaffList(sRes.data);
        } catch (error) { console.error(error); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.venue) {
            const selectedVenue = venues.find(v => v._id === formData.venue);
            if (selectedVenue && Number(formData.capacity) > selectedVenue.capacity) {
                return setError(`Entered capacity exceeds the maximum capacity of the selected venue (${selectedVenue.capacity} attendees).`);
            }
        }

        try {
            const payload = { ...formData };
            if (payload.participationType === 'Individual') payload.teamSize = 1;

            if (formData.id) {
                await axios.put(`http://localhost:5000/api/events/${formData.id}`, payload, { headers: { Authorization: `Bearer ${user.token}` } });
            } else {
                await axios.post('http://localhost:5000/api/events', payload, { headers: { Authorization: `Bearer ${user.token}` } });
            }
            setShowModal(false);
            fetchEvents();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving event');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            try {
                await axios.delete(`http://localhost:5000/api/events/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
                fetchEvents();
            } catch (err) { alert('Error deleting event'); }
        }
    };

    const openCreate = () => {
        setFormData({
            id: null, title: '', description: '', participationType: 'Individual', teamSize: 1, capacity: 50,
            date: '', startTime: '', endTime: '', venue: '', assignedFaculty: [], assignedStaff: []
        });
        setShowModal(true);
    };

    const handleEdit = (ev) => {
        setFormData({
            id: ev._id, title: ev.title, description: ev.description, participationType: ev.participationType, teamSize: ev.teamSize, capacity: ev.capacity || 50,
            date: ev.date.split('T')[0], startTime: ev.startTime, endTime: ev.endTime, venue: ev.venue?._id || '',
            assignedFaculty: ev.assignedFaculty.map(f => f._id), assignedStaff: ev.assignedStaff.map(s => s._id)
        });
        setShowModal(true);
    };

    const handleViewParticipants = (ev) => {
        setSelectedEventForParticipants(ev);
        setShowParticipantsModal(true);
    };

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--primary-color)' }}>Event Board</h3>
                    <p className="text-muted mb-0">Manage and schedule new institutional events.</p>
                </div>
                <Button variant="primary" onClick={openCreate} className="d-flex align-items-center gap-2 px-4 shadow-sm">
                    <Plus size={18} /> Schedule Event
                </Button>
            </div>
            
            <Card className="flex-grow-1 p-0 shadow-sm border-0 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="bg-light px-4 py-3 d-grid align-items-center" style={{ gridTemplateColumns: '2fr 1fr 1.5fr 1fr 0.5fr', borderBottom: '1px solid rgba(0,0,0,0.05)', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <div>Event Details</div>
                    <div>Type</div>
                    <div>Schedule</div>
                    <div>Location</div>
                    <div className="text-end">Actions</div>
                </div>
                
                <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
                    {events.length === 0 ? (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted p-5">
                            <Calendar size={48} className="mb-3" style={{ opacity: 0.2 }} />
                            <h5>No events scheduled</h5>
                            <p>Click the schedule button to create your first event.</p>
                        </div>
                    ) : (
                        <motion.div variants={containerVariants} initial="hidden" animate="show">
                            {events.map(ev => (
                                <motion.div variants={itemVariants} key={ev._id} className="px-4 py-3 border-bottom d-grid align-items-center" style={{ gridTemplateColumns: '2fr 1fr 1.5fr 1fr 0.5fr', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <div>
                                        <div className="fw-semibold text-dark" style={{ fontSize: '0.95rem' }}>{ev.title}</div>
                                        {ev.description && <div className="text-muted text-truncate" style={{ fontSize: '0.8rem', maxWidth: '250px' }}>{ev.description}</div>}
                                    </div>
                                    <div>
                                        <Badge bg={ev.participationType === 'Team' ? 'info' : 'secondary'} className="px-2 py-1 fw-medium" style={{ borderRadius: '6px' }}>
                                            {ev.participationType} {ev.participationType === 'Team' && `(${ev.teamSize})`}
                                        </Badge>
                                    </div>
                                    <div>
                                        <div className="d-flex align-items-center gap-2 text-dark" style={{ fontSize: '0.9rem' }}>
                                            <Calendar size={14} className="text-muted" /> {new Date(ev.date).toLocaleDateString()}
                                        </div>
                                        <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                                            <Clock size={14} /> {ev.startTime} - {ev.endTime}
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-2 text-dark" style={{ fontSize: '0.9rem' }}>
                                        <MapPin size={16} className="text-muted" /> <span className="text-truncate">{ev.venue?.name || 'TBA'}</span>
                                    </div>
                                    <div className="text-end d-flex justify-content-end gap-2">
                                        <button className="btn btn-light btn-sm rounded-circle p-2 d-flex" title="View Participants" onClick={() => handleViewParticipants(ev)}><Users size={16} className="text-secondary" /></button>
                                        <button className="btn btn-light btn-sm rounded-circle p-2 d-flex" title="Edit Event" onClick={() => handleEdit(ev)}><Edit size={16} className="text-primary" /></button>
                                        <button className="btn btn-light btn-sm rounded-circle p-2 d-flex" title="Delete Event" onClick={() => handleDelete(ev._id)}><Trash size={16} className="text-danger" /></button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', padding: '1.5rem', backgroundColor: '#f8f9fb', borderRadius: '16px 16px 0 0' }}>
                    <Modal.Title style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{formData.id ? 'Edit Event Details' : 'Schedule New Event'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {error && <div className="p-3 mb-4 rounded d-flex align-items-center gap-3" style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' }}><Info size={20}/> <span className="fw-medium">{error}</span></div>}
                    <Form onSubmit={handleSave}>
                        <div className="row gy-3">
                            <div className="col-md-6 mb-2">
                                <Form.Label className="fw-medium text-muted small text-uppercase">Event Title</Form.Label>
                                <Form.Control required type="text" placeholder="e.g. Annual Tech Symposium" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-2">
                                <Form.Label className="fw-medium text-muted small text-uppercase">Venue</Form.Label>
                                <Form.Select required value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})}>
                                    <option value="">Select a location</option>
                                    {venues.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                                </Form.Select>
                            </div>
                            <div className="col-md-4 mb-2">
                                <Form.Label className="fw-medium text-muted small text-uppercase">Date</Form.Label>
                                <Form.Control required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                            </div>
                            <div className="col-md-4 mb-2">
                                <Form.Label className="fw-medium text-muted small text-uppercase">Start Time</Form.Label>
                                <Form.Control required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                            </div>
                            <div className="col-md-4 mb-2">
                                <Form.Label className="fw-medium text-muted small text-uppercase">End Time</Form.Label>
                                <Form.Control required type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                            </div>
                            {/* Same setup as before but with modern styles */}
                            <div className="col-md-6 mb-2">
                                <Form.Label className="fw-medium text-muted small text-uppercase">Participation Type</Form.Label>
                                <Form.Select value={formData.participationType} onChange={e => setFormData({...formData, participationType: e.target.value})}>
                                    <option value="Individual">Individual</option>
                                    <option value="Team">Team</option>
                                </Form.Select>
                            </div>
                            {formData.participationType === 'Team' && (
                                <div className="col-md-3 mb-2">
                                    <Form.Label className="fw-medium text-muted small text-uppercase">Team Size</Form.Label>
                                    <Form.Control type="number" min="2" value={formData.teamSize} onChange={e => setFormData({...formData, teamSize: e.target.value})} />
                                </div>
                            )}
                            <div className={formData.participationType === 'Team' ? "col-md-3 mb-2" : "col-md-6 mb-2"}>
                                <Form.Label className="fw-medium text-muted small text-uppercase">Total Capacity</Form.Label>
                                <Form.Control required type="number" min="1" placeholder="e.g. 50" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                            </div>
                            <div className="col-md-12 mb-3">
                                <Form.Label className="fw-medium text-muted small text-uppercase">Description (Optional)</Form.Label>
                                <Form.Control as="textarea" rows={2} placeholder="Provide a brief overview..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-2">
                                <Form.Label className="fw-medium text-muted small text-uppercase">Assign Faculty</Form.Label>
                                <Select 
                                    isMulti
                                    options={facultyList.map(f => ({ value: f._id, label: f.name }))}
                                    value={facultyList.filter(f => formData.assignedFaculty.includes(f._id)).map(f => ({ value: f._id, label: f.name }))}
                                    onChange={(selected) => setFormData({...formData, assignedFaculty: selected.map(s => s.value)})}
                                    placeholder="Search and select faculty..."
                                    styles={{ control: (base) => ({ ...base, borderRadius: '8px', minHeight: '44px' }) }}
                                />
                            </div>
                            <div className="col-md-6 mb-2">
                                <Form.Label className="fw-medium text-muted small text-uppercase">Assign Support Staff</Form.Label>
                                <Select 
                                    isMulti
                                    options={staffList.map(s => ({ value: s._id, label: `${s.name} (${s.workType})` }))}
                                    value={staffList.filter(s => formData.assignedStaff.includes(s._id)).map(s => ({ value: s._id, label: `${s.name} (${s.workType})` }))}
                                    onChange={(selected) => setFormData({...formData, assignedStaff: selected.map(s => s.value)})}
                                    placeholder="Search and select staff..."
                                    styles={{ control: (base) => ({ ...base, borderRadius: '8px', minHeight: '44px' }) }}
                                />
                            </div>
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: 'none', padding: '1.5rem', backgroundColor: '#f8f9fb', borderRadius: '0 0 16px 16px' }}>
                    <Button variant="light" onClick={() => setShowModal(false)} className="px-4">Cancel</Button>
                    <Button variant="primary" onClick={handleSave} className="px-4">Confirm & Save</Button>
                </Modal.Footer>
            </Modal>

            {/* Participants Viewing Modal */}
            <Modal show={showParticipantsModal} onHide={() => setShowParticipantsModal(false)} size="md" centered>
                <Modal.Header closeButton style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#f8f9fb' }}>
                    <Modal.Title style={{ fontWeight: 600, fontSize: '1.2rem' }}>
                        Registered Students <Badge bg="success" className="ms-2">{selectedEventForParticipants?.registeredStudents?.length || 0}</Badge>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {selectedEventForParticipants?.registeredStudents?.length === 0 ? (
                        <div className="text-center text-muted p-5">
                            <Users size={32} className="mb-2" style={{ opacity: 0.3 }} />
                            <p className="mb-0">No students are currently registered for this event.</p>
                        </div>
                    ) : (
                        <div className="list-group list-group-flush">
                            {selectedEventForParticipants?.registeredStudents?.map(student => (
                                <div key={student._id} className="list-group-item d-flex align-items-center gap-3 py-3 px-4">
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(108, 99, 255, 0.1)', color: 'var(--primary-color)' }} className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold">{student.name}</h6>
                                        <small className="text-muted">{student.email}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-light border-0">
                    <Button variant="secondary" onClick={() => setShowParticipantsModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </motion.div>
    );
};

export default EventManagement;
