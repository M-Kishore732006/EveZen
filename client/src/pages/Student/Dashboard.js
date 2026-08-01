import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Ticket, Calendar, CheckCircle, Bell, ArrowRight, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

// FullCalendar Imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const calendarRef = useRef(null);
    const [currentDateTitle, setCurrentDateTitle] = useState('');
    const [currentView, setCurrentView] = useState('dayGridMonth');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ registered: 0, upcoming: 0, completed: 0, pendingForums: 0 });
    const [events, setEvents] = useState([]);
    
    // We fetch real events but for 'registered' stats we would ideally have a backend endpoint. 
    // For demo purposes, we treat all available events as actionable by the student.
    const fetchRecentEvents = async () => {
        try {
            const res = await axios.get('/api/events', { headers: { Authorization: `Bearer ${user.token}` } });
            const allEvents = res.data;
            setEvents(allEvents);

            // Calculate dynamic stats!
            const now = new Date();
            const upcoming = allEvents.filter(ev => new Date(ev.date) >= now).length;
            const completed = allEvents.filter(ev => new Date(ev.date) < now).length;
            
            // "registered" would ideally check attendees list; defaulting to upcoming for student
            setStats({
                registered: upcoming > 0 ? upcoming - 1 : 0, 
                upcoming: upcoming,
                completed: completed,
                pendingForums: 0
            });

        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        if (user?.token) fetchRecentEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

    const calendarEvents = events.map(ev => {
        const startDateTime = new Date(`${ev.date.split('T')[0]}T${ev.startTime}`);
        const endDateTime = new Date(`${ev.date.split('T')[0]}T${ev.endTime}`);
        return { id: ev._id, title: ev.title, start: startDateTime, end: endDateTime, extendedProps: ev };
    });

    const filteredEvents = calendarEvents.filter(ev => ev.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const handlePrev = () => { const api = calendarRef.current.getApi(); api.prev(); setCurrentDateTitle(api.view.title); };
    const handleNext = () => { const api = calendarRef.current.getApi(); api.next(); setCurrentDateTitle(api.view.title); };
    const handleToday = () => { const api = calendarRef.current.getApi(); api.today(); setCurrentDateTitle(api.view.title); };
    const handleViewChange = (viewName) => { const api = calendarRef.current.getApi(); api.changeView(viewName); setCurrentView(viewName); setCurrentDateTitle(api.view.title); };
    const handleDatesSet = (dateInfo) => { setCurrentDateTitle(dateInfo.view.title); };

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

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="h-100">
            <motion.div variants={itemVariants} className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--primary-color)' }}>Welcome back, {user?.name.split(' ')[0]} 👋</h3>
                    <p className="text-muted mb-0">Explore and participate in upcoming campus events and hackathons.</p>
                </div>
                <Button variant="primary" className="d-flex align-items-center gap-2" onClick={() => navigate('/student/browse')}>
                    Browse Events <ArrowRight size={18} />
                </Button>
            </motion.div>

            <Row className="mb-4">
                {[
                    { label: 'Registered Events', value: stats.registered, icon: Ticket, color: 'glass-icon-primary' },
                    { label: 'Upcoming Events', value: stats.upcoming, icon: Calendar, color: 'glass-icon-warning' },
                    { label: 'Completed Events', value: stats.completed, icon: CheckCircle, color: 'glass-icon-success' },
                    { label: 'Forum Updates', value: stats.pendingForums, icon: Bell, color: 'glass-icon-danger' }
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
                <Col lg={12} className="mb-4">
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
                            <div className="p-4" style={{ height: '600px', backgroundColor: 'var(--card-bg)' }}>
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    events={filteredEvents}
                                    eventClick={(info) => navigate(`/student/events/${info.event.id}`)}
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
            </Row>

        </motion.div>
    );
};

export default Dashboard;
