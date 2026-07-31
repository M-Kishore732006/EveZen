import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Row, Col, Card, Modal } from 'react-bootstrap';
import { Calendar as CalendarIcon, Clock, MapPin, Users, NotebookText } from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ eventsToday: 0, upcomingEvents: 0, totalFaculty: 0, totalStaff: 0 });
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        if (user?.token) {
            fetchStats();
            fetchEvents();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/events/stats', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/events', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setEvents(res.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    // A simple list view for events since standard React Calendar usually requires react-calendar lib
    // Following minimalistic SaaS guidelines, we will display an elegant interactive timeline/list
    return (
        <div>
            <h4 className="mb-4" style={{ fontWeight: 600 }}>Institutional Analytics</h4>
            <Row className="mb-5">
                <Col md={3}>
                    <Card className="p-4 border-0 shadow-sm text-center">
                        <h6 className="text-muted text-uppercase mb-2">Events Today</h6>
                        <h2 style={{ color: 'var(--primary-color)', fontWeight: 700 }}>{stats.eventsToday}</h2>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="p-4 border-0 shadow-sm text-center">
                        <h6 className="text-muted text-uppercase mb-2">Upcoming Events</h6>
                        <h2 style={{ color: 'var(--primary-color)', fontWeight: 700 }}>{stats.upcomingEvents}</h2>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="p-4 border-0 shadow-sm text-center">
                        <h6 className="text-muted text-uppercase mb-2">Total Faculty</h6>
                        <h2 style={{ color: 'var(--primary-color)', fontWeight: 700 }}>{stats.totalFaculty}</h2>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="p-4 border-0 shadow-sm text-center">
                        <h6 className="text-muted text-uppercase mb-2">Total Staff</h6>
                        <h2 style={{ color: 'var(--primary-color)', fontWeight: 700 }}>{stats.totalStaff}</h2>
                    </Card>
                </Col>
            </Row>

            <h4 className="mb-4" style={{ fontWeight: 600 }}>Event Calendar (Timeline)</h4>
            <Row>
                {events.length === 0 ? <p className="text-muted">No events scheduled.</p> : (
                    events.map(ev => {
                        const evtDate = new Date(ev.date).toLocaleDateString();
                        return (
                            <Col md={4} key={ev._id} className="mb-4">
                                <Card className="p-4 shadow-sm border-0 h-100" style={{ cursor: 'pointer' }} onClick={() => setSelectedEvent(ev)}>
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <CalendarIcon size={18} color="var(--primary-color)" />
                                        <span className="fw-semibold">{evtDate}</span>
                                    </div>
                                    <h5 className="mb-2">{ev.title}</h5>
                                    <div className="d-flex align-items-center gap-2 text-muted mb-1" style={{ fontSize: '14px' }}>
                                        <Clock size={16} /> {ev.startTime} - {ev.endTime}
                                    </div>
                                    <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '14px' }}>
                                        <MapPin size={16} /> {ev.venue?.name || 'TBA'}
                                    </div>
                                </Card>
                            </Col>
                        );
                    })
                )}
            </Row>

            {/* Event Modal */}
            <Modal show={!!selectedEvent} onHide={() => setSelectedEvent(null)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title style={{ fontWeight: 600 }}>{selectedEvent?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex align-items-center gap-2 mb-3 text-muted">
                        <NotebookText size={18}/> <span>{selectedEvent?.description}</span>
                    </div>
                    <Row className="mb-3">
                        <Col sm={6}>
                            <div className="mb-2"><CalendarIcon size={16}/> <strong>Date:</strong> {new Date(selectedEvent?.date).toLocaleDateString()}</div>
                            <div className="mb-2"><Clock size={16}/> <strong>Time:</strong> {selectedEvent?.startTime} - {selectedEvent?.endTime}</div>
                            <div className="mb-2"><MapPin size={16}/> <strong>Venue:</strong> {selectedEvent?.venue?.name}</div>
                        </Col>
                        <Col sm={6}>
                            <div className="mb-2"><strong>Type:</strong> {selectedEvent?.participationType}</div>
                            {selectedEvent?.participationType === 'Team' && <div className="mb-2"><strong>Team Size:</strong> {selectedEvent?.teamSize}</div>}
                        </Col>
                    </Row>
                    <hr />
                    <h6>Assigned Faculty</h6>
                    <ul className="mb-3 text-muted">
                        {selectedEvent?.assignedFaculty?.length > 0 ? selectedEvent.assignedFaculty.map(f => <li key={f._id}>{f.name}</li>) : <li>None</li>}
                    </ul>
                    <h6>Assigned Staff</h6>
                    <ul className="text-muted">
                        {selectedEvent?.assignedStaff?.length > 0 ? selectedEvent.assignedStaff.map(s => <li key={s._id}>{s.name} ({s.workType})</li>) : <li>None</li>}
                    </ul>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Dashboard;
