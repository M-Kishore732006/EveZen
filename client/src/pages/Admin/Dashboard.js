import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Row, Col, Card, Modal, Button } from 'react-bootstrap';
import { Calendar as CalendarIcon, Clock, MapPin, Users, NotebookText, Plus, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';

// FullCalendar Imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const Dashboard = () => {
    const calendarRef = useRef(null);
    const [currentDateTitle, setCurrentDateTitle] = useState('');
    const [currentView, setCurrentView] = useState('dayGridMonth');
    const [searchQuery, setSearchQuery] = useState('');

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/events/stats', { headers: { Authorization: `Bearer ${user.token}` } });
            setStats(res.data);
        } catch (error) { console.error('Error fetching stats:', error); }
    };

    const fetchEvents = async () => {
        try {
            const res = await axios.get('/api/events', { headers: { Authorization: `Bearer ${user.token}` } });
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

    const filteredEvents = calendarEvents.filter(ev => ev.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleEventClick = (info) => {
        setSelectedEvent(info.event.extendedProps);
    };

    const handlePrev = () => {
        const api = calendarRef.current.getApi();
        api.prev();
        setCurrentDateTitle(api.view.title);
    };

    const handleNext = () => {
        const api = calendarRef.current.getApi();
        api.next();
        setCurrentDateTitle(api.view.title);
    };

    const handleToday = () => {
        const api = calendarRef.current.getApi();
        api.today();
        setCurrentDateTitle(api.view.title);
    };

    const handleViewChange = (viewName) => {
        const api = calendarRef.current.getApi();
        api.changeView(viewName);
        setCurrentView(viewName);
        setCurrentDateTitle(api.view.title);
    };

    const handleDatesSet = (dateInfo) => {
        setCurrentDateTitle(dateInfo.view.title);
    };

    const renderEventContent = (eventInfo) => {
        const isPast = eventInfo.event.start < new Date();
        const statusColor = isPast ? '#94A3B8' : (eventInfo.event.start <= new Date() && eventInfo.event.end >= new Date() ? 'var(--success-color, #10B981)' : 'var(--accent-color, #6C63FF)');
        
        return (
            <div className="custom-event-card" style={{ borderLeftColor: statusColor }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <div className="custom-event-title">{eventInfo.event.title}</div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor }}></div>
                </div>
                <div className="custom-event-time">{eventInfo.timeText}</div>
            </div>
        );
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
                    { label: 'Events Today', value: stats.eventsToday, icon: CalendarIcon, color: 'glass-icon-primary' },
                    { label: 'Upcoming Events', value: stats.upcomingEvents, icon: Clock, color: 'glass-icon-warning' },
                    { label: 'Active Faculty', value: stats.totalFaculty, icon: Users, color: 'glass-icon-success' },
                    { label: 'Support Staff', value: stats.totalStaff, icon: NotebookText, color: 'glass-icon-primary' }
                ].map((stat, idx) => (
                    <Col xs={12} md={6} lg={3} key={idx} className="mb-3">
                        <motion.div variants={itemVariants}>
                            <Card className="p-4 h-100 border-0 shadow-sm">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className={`glass-icon ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
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
                        <Card className="p-0 border-0 shadow-sm h-100" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                            <div className="p-4 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 bg-white" style={{ backgroundColor: 'var(--card-bg)' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="d-flex bg-light rounded-pill p-1">
                                        <button className="btn btn-sm border-0 rounded-circle d-flex align-items-center justify-content-center p-2 calendar-nav-btn" onClick={handlePrev}><ChevronLeft size={18} /></button>
                                        <button className="btn btn-sm border-0 rounded-circle d-flex align-items-center justify-content-center p-2 calendar-nav-btn" onClick={handleNext}><ChevronRight size={18} /></button>
                                    </div>
                                    <h4 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--primary-color)' }}>
                                        📅 {currentDateTitle || 'Calendar'}
                                    </h4>
                                </div>
                                <div className="d-flex align-items-center gap-3 flex-wrap">
                                    <div className="position-relative">
                                        <Search size={16} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input 
                                            type="text" 
                                            className="form-control form-control-sm rounded-pill" 
                                            placeholder="Search events..." 
                                            style={{ paddingLeft: '36px', width: '200px', backgroundColor: 'var(--bg-color)', border: 'none' }}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <button className="btn btn-sm btn-light rounded-pill px-3 fw-medium" onClick={handleToday}>Today</button>
                                    <div className="d-flex bg-light rounded-pill p-1">
                                        <button className={`btn btn-sm border-0 rounded-pill px-3 py-1 fw-medium ${currentView === 'dayGridMonth' ? 'btn-white shadow-sm text-primary' : 'text-muted'}`} onClick={() => handleViewChange('dayGridMonth')}>Month</button>
                                        <button className={`btn btn-sm border-0 rounded-pill px-3 py-1 fw-medium ${currentView === 'dayGridWeek' ? 'btn-white shadow-sm text-primary' : 'text-muted'}`} onClick={() => handleViewChange('dayGridWeek')}>Week</button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-grow-1 p-4" style={{ minHeight: '600px', backgroundColor: 'var(--card-bg)' }}>
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    events={filteredEvents}
                                    eventClick={handleEventClick}
                                    datesSet={handleDatesSet}
                                    headerToolbar={false}
                                    height="100%"
                                    eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
                                    eventContent={renderEventContent}
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
                                            <p className="mb-1 fw-semibold" style={{ fontSize: '0.95rem' }}>{ev.title}</p>
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
            <Modal show={!!selectedEvent} onHide={() => setSelectedEvent(null)} centered size="md" className="premium-modal">
                <div style={{ height: '80px', backgroundColor: 'var(--accent-color)', borderRadius: '16px 16px 0 0', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '150%', height: '200%', background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)' , backgroundSize: '20px 20px', opacity: 0.3 }}></div>
                </div>
                <Modal.Header closeButton style={{ borderBottom: 'none', padding: '1rem', marginTop: '-40px', position: 'relative', zIndex: 1, backgroundColor: 'transparent' }} className="border-0 pb-0">
                    <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center p-3 mb-2" style={{ width: '60px', height: '60px', border: '4px solid var(--card-bg)' }}>
                        <CalendarIcon size={24} color="var(--accent-color)" />
                    </div>
                </Modal.Header>
                <Modal.Body className="px-4 pb-4 pt-2">
                    <h4 style={{ fontWeight: 700, color: 'var(--primary-color)' }} className="mb-3">{selectedEvent?.title}</h4>
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
                <Modal.Footer style={{ borderTop: 'none', padding: '1.5rem', borderRadius: '0 0 16px 16px' }}>
                    <Button variant="light" onClick={() => setSelectedEvent(null)} className="w-100">Close</Button>
                </Modal.Footer>
            </Modal>
        </motion.div>
    );
};

export default Dashboard;
