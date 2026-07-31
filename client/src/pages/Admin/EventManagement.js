import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { Edit, Trash, Plus } from 'lucide-react';

const EventManagement = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [venues, setVenues] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [staffList, setStaffList] = useState([]);
    
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id: null, title: '', description: '', participationType: 'Individual', teamSize: 1,
        date: '', startTime: '', endTime: '', venue: '', assignedFaculty: [], assignedStaff: []
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.token) {
            fetchEvents();
            fetchLookups();
        }
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
        if (window.confirm('Delete this event?')) {
            try {
                await axios.delete(`http://localhost:5000/api/events/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
                fetchEvents();
            } catch (err) { alert('Error deleting event'); }
        }
    };

    const openCreate = () => {
        setFormData({
            id: null, title: '', description: '', participationType: 'Individual', teamSize: 1,
            date: '', startTime: '', endTime: '', venue: '', assignedFaculty: [], assignedStaff: []
        });
        setShowModal(true);
    };

    const handleEdit = (ev) => {
        setFormData({
            id: ev._id, title: ev.title, description: ev.description, participationType: ev.participationType, teamSize: ev.teamSize,
            date: ev.date.split('T')[0], startTime: ev.startTime, endTime: ev.endTime, venue: ev.venue?._id || '',
            assignedFaculty: ev.assignedFaculty.map(f => f._id), assignedStaff: ev.assignedStaff.map(s => s._id)
        });
        setShowModal(true);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 style={{ fontWeight: 600 }}>Event Management</h4>
                <Button variant="primary" onClick={openCreate} className="d-flex align-items-center gap-2">
                    <Plus size={18} /> Schedule Event
                </Button>
            </div>
            
            <Card className="p-0 shadow-sm border-0">
                <Table responsive hover className="mb-0">
                    <thead style={{ backgroundColor: 'var(--bg-color)' }}>
                        <tr>
                            <th className="px-4 py-3">Event Name</th>
                            <th>Type</th>
                            <th>Date & Time</th>
                            <th>Venue</th>
                            <th className="text-end px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(ev => (
                            <tr key={ev._id}>
                                <td className="px-4 py-3 fw-medium">{ev.title}</td>
                                <td>{ev.participationType} {ev.participationType === 'Team' && <Badge bg="secondary">Sz: {ev.teamSize}</Badge>}</td>
                                <td className="text-muted">{new Date(ev.date).toLocaleDateString()} <br/><small>{ev.startTime} - {ev.endTime}</small></td>
                                <td className="text-muted">{ev.venue?.name || 'TBA'}</td>
                                <td className="text-end px-4 pt-3">
                                    <Button variant="light" size="sm" className="me-2" onClick={() => handleEdit(ev)}><Edit size={16} color="var(--secondary-color)" /></Button>
                                    <Button variant="light" size="sm" onClick={() => handleDelete(ev._id)}><Trash size={16} color="#e3342f" /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title>{formData.id ? 'Edit Event' : 'Schedule Event'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-3">
                    {error && <Alert variant="danger" className="mb-3 p-2">{error}</Alert>}
                    <Form onSubmit={handleSave}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Form.Label>Event Title</Form.Label>
                                <Form.Control required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label>Venue</Form.Label>
                                <Form.Select required value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})}>
                                    <option value="">Select Venue</option>
                                    {venues.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                                </Form.Select>
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Label>Date</Form.Label>
                                <Form.Control required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Label>Start Time</Form.Label>
                                <Form.Control required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Label>End Time</Form.Label>
                                <Form.Control required type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label>Participation Type</Form.Label>
                                <Form.Select value={formData.participationType} onChange={e => setFormData({...formData, participationType: e.target.value})}>
                                    <option value="Individual">Individual</option>
                                    <option value="Team">Team</option>
                                </Form.Select>
                            </div>
                            {formData.participationType === 'Team' && (
                                <div className="col-md-6 mb-3">
                                    <Form.Label>Team Size</Form.Label>
                                    <Form.Control type="number" min="2" value={formData.teamSize} onChange={e => setFormData({...formData, teamSize: e.target.value})} />
                                </div>
                            )}
                            <div className="col-md-12 mb-3">
                                <Form.Label>Description (Optional)</Form.Label>
                                <Form.Control as="textarea" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-4">
                                <Form.Label>Assign Faculty Members (Hold Ctrl to select multiple)</Form.Label>
                                <Form.Select multiple value={formData.assignedFaculty} onChange={e => setFormData({...formData, assignedFaculty: Array.from(e.target.selectedOptions, option => option.value)})}>
                                    {facultyList.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                                </Form.Select>
                            </div>
                            <div className="col-md-6 mb-4">
                                <Form.Label>Assign Supporting Staff (Hold Ctrl to select multiple)</Form.Label>
                                <Form.Select multiple value={formData.assignedStaff} onChange={e => setFormData({...formData, assignedStaff: Array.from(e.target.selectedOptions, option => option.value)})}>
                                    {staffList.map(s => <option key={s._id} value={s._id}>{s.name} ({s.workType})</option>)}
                                </Form.Select>
                            </div>
                        </div>
                        <Button variant="primary" type="submit" className="w-100">Save Event</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default EventManagement;
