import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Row, Col, Card, Modal, Button } from 'react-bootstrap';
import { Calendar as CalendarIcon, Clock, MapPin, Users, NotebookText, TrendingUp, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

// FullCalendar Imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
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
            const res = await axios.get('http://localhost:5000/api/events/stats', { headers: { Authorization: `Bearer ${user.token}` } });
            setStats(res.data);
        } catch (error) { console.error('Error fetching stats:', error); }
    };

    const fetchEvents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/events', { headers: { Authorization: `Bearer ${user.token}` } });
            setEvents(res.data);
        } catch (error) { console.error('Error fetching events:', error); }
    };

    const calendarEvents = events.map(ev => {
        const startDateTime = new Date(`${ev.date.split('T')[0]}T${ev.startTime}`);
        const endDateTime = new Date(`${ev.date.split('T')[0]}T${ev.endTime}`);
        return {
            id: ev._id,
            title: ev.title,
            start: startDateTime,
            end: endDateTime,
            extendedProps: ev
        };
    });

    const handleEventClick = (info) => {
        setSelectedEvent(info.event.extendedProps);
    };

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--primary-color)' }}>Overview</h3>
                    <p className="text-muted mb-0">Here's what's happening at your institution today.</p>
                </div>
                <div className="d-flex gap-3">
                    <Button variant="light" className="d-flex align-items-center gap-2" onClick={() => navigate('/admin/venues')}>
                        <MapPin size={18} /> Manage Venues
                    </Button>
                    <Button variant="primary" className="d-flex align-items-center gap-2" onClick={() => navigate('/admin/events')}>
                        <Plus size={18} /> Schedule Event
                    </Button>
                </div>
            </div>

            <Row className="mb-4">
                {[
                    { label: 'Events Today', value: stats.eventsToday, trend: '+2 than yesterday', icon: CalendarIcon, color: 'glass-icon-primary' },
                    { label: 'Upcoming Events', value: stats.upcomingEvents, trend: 'Next 7 days', icon: Clock, color: 'glass-icon-warning' },
                    { label: 'Active Faculty', value: stats.totalFaculty, trend: '+5% this month', icon: Users, color: 'glass-icon-success' },
                    { label: 'Support Staff', value: stats.totalStaff, trend: 'Stable workforce', icon: NotebookText, color: 'glass-icon-primary' }
                ].map((stat, idx) => (
                    <Col lg={3} sm={6} key={idx} className="mb-3">
                        <motion.div variants={itemVariants}>
                            <Card className="p-4 h-100 border-0 shadow-sm" style={{ backgroundColor: '#fff' }}>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className={`glass-icon ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <span style={{ fontSize: '0.85rem' }} className={stat.trend.includes('+') ? 'text-trend-up' : 'text-muted'}>
                                        {stat.trend.includes('+') && <TrendingUp size={14} className="me-1" />}
                                        {stat.trend}
                                    </span>
                                </div>
                                <h3 style={{ fontWeight: 700, color: 'var(--primary-color)' }} className="mb-1">{stat.value}</h3>
                                <p className="text-muted mb-0 fw-medium" style={{ fontSize: '0.9rem' }}>{stat.label}</p>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>

            <Row>
                <Col lg={8} className="mb-4">
                    <motion.div variants={itemVariants} className="h-100">
                        <Card className="p-4 border-0 shadow-sm h-100">
                            <h5 className="mb-4 fw-bold">Event Calendar</h5>
                            <div className="flex-grow-1" style={{ minHeight: '500px' }}>
                                <FullCalendar
                                    plugins={[dayGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    events={calendarEvents}
                                    eventClick={handleEventClick}
                                    headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }}
                                    height="100%"
                                    eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
                                    eventDisplay="block"
                                    eventBackgroundColor="var(--accent-color)"
                                    eventBorderColor="var(--accent-color)"
                                />
                            </div>
                        </Card>
                    </motion.div>
                </Col>
                <Col lg={4} className="mb-4">
                    <motion.div variants={itemVariants} className="h-100">
                        <Card className="p-4 border-0 shadow-sm h-100">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold mb-0">Recent Activity</h5>
                                <span className="badge bg-light text-dark">Latest</span>
                            </div>
                            <div className="activity-timeline">
                                {events.slice(0, 5).map((ev, idx) => (
                                    <div key={ev._id} className="d-flex mb-4 position-relative">
                                        <div className="d-flex flex-column align-items-center me-3">
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', zIndex: 2 }}></div>
                                            {idx !== 4 && <div style={{ width: '2px', height: '100%', backgroundColor: 'rgba(0,0,0,0.05)', position: 'absolute', top: '12px', left: '5px' }}></div>}
                                        </div>
                                        <div>
                                            <p className="mb-1 fw-semibold text-dark" style={{ fontSize: '0.95rem' }}>{ev.title}</p>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Scheduled for {new Date(ev.date).toLocaleDateString()} at {ev.startTime}</p>
                                        </div>
                                    </div>
                                ))}
                                {events.length === 0 && <p className="text-muted text-center py-4">No recent activity found.</p>}
                            </div>
                        </Card>
                    </motion.div>
                </Col>
            </Row>

            {/* Premium Event Details Modal */}
            <Modal show={!!selectedEvent} onHide={() => setSelectedEvent(null)} centered size="md">
                <Modal.Header closeButton style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', padding: '1.5rem', backgroundColor: '#f8f9fb', borderRadius: '16px 16px 0 0' }}>
                    <Modal.Title style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{selectedEvent?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedEvent?.description && (
                        <div className="p-3 mb-4 rounded" style={{ backgroundColor: 'rgba(108, 99, 255, 0.05)', color: 'var(--accent-color)' }}>
                            <NotebookText size={18} className="me-2"/> <span style={{ fontSize: '0.95rem' }}>{selectedEvent.description}</span>
                        </div>
                    )}
                    
                    <Row className="gy-4 mb-4">
                        <Col sm={6}>
                            <div className="text-muted mb-1" style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Schedule</div>
                            <div className="d-flex align-items-center gap-2 fw-medium text-dark">
                                <CalendarIcon size={16} className="text-muted" /> {new Date(selectedEvent?.date).toLocaleDateString()}
                            </div>
                            <div className="d-flex align-items-center gap-2 mt-1 text-muted" style={{ fontSize: '0.9rem' }}>
                                <Clock size={16} /> {selectedEvent?.startTime} - {selectedEvent?.endTime}
                            </div>
                        </Col>
                        <Col sm={6}>
                            <div className="text-muted mb-1" style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Location & Type</div>
                            <div className="d-flex align-items-center gap-2 fw-medium text-dark">
                                <MapPin size={16} className="text-muted" /> {selectedEvent?.venue?.name || 'TBA'}
                            </div>
                            <div className="d-flex align-items-center gap-2 mt-1 text-muted" style={{ fontSize: '0.9rem' }}>
                                <Users size={16} /> {selectedEvent?.participationType} {selectedEvent?.participationType === 'Team' && `(Size: ${selectedEvent?.teamSize})`}
                            </div>
                        </Col>
                    </Row>

                    <div className="border-top pt-4">
                        <div className="text-muted mb-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Resources</div>
                        <Row>
                            <Col sm={6}>
                                <div className="fw-medium text-dark mb-1" style={{ fontSize: '0.9rem' }}>Faculty</div>
                                <ul className="text-muted list-unstyled" style={{ fontSize: '0.9rem' }}>
                                    {selectedEvent?.assignedFaculty?.length > 0 ? selectedEvent.assignedFaculty.map(f => <li key={f._id} className="mb-1">• {f.name}</li>) : <li>None</li>}
                                </ul>
                            </Col>
                            <Col sm={6}>
                                <div className="fw-medium text-dark mb-1" style={{ fontSize: '0.9rem' }}>Support Staff</div>
                                <ul className="text-muted list-unstyled" style={{ fontSize: '0.9rem' }}>
                                    {selectedEvent?.assignedStaff?.length > 0 ? selectedEvent.assignedStaff.map(s => <li key={s._id} className="mb-1">• {s.name} <span style={{ opacity: 0.7 }}>({s.workType})</span></li>) : <li>None</li>}
                                </ul>
                            </Col>
                        </Row>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: 'none', padding: '1.5rem', backgroundColor: '#f8f9fb', borderRadius: '0 0 16px 16px' }}>
                    <Button variant="light" onClick={() => setSelectedEvent(null)} className="w-100">Close</Button>
                </Modal.Footer>
            </Modal>
        </motion.div>
    );
};

export default Dashboard;
