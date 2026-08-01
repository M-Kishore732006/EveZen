import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { ClipboardCheck, CalendarCheck, Clock, Users, ArrowRight, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

// FullCalendar Imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const EmployeeDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const calendarRef = useRef(null);
    const [currentDateTitle, setCurrentDateTitle] = useState('');
    const [currentView, setCurrentView] = useState('dayGridMonth');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ assigned: 0, pendingTasks: 0, completedTasks: 0 });
    const [assignedEvents, setAssignedEvents] = useState([]);
    const isStaff = user?.role === 'Supporting Staff';
    const basePath = isStaff ? '/staff' : '/faculty';

    useEffect(() => {
        if (user?.token) fetchEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchEvents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/events', { headers: { Authorization: `Bearer ${user.token}` } });
            
            // Filter events assigned to THIS user
            const filtered = res.data.filter(ev => {
                if (isStaff) return ev.assignedStaff?.some(s => s._id === user._id);
                return ev.assignedFaculty?.some(f => f._id === user._id);
            });
            
            setAssignedEvents(filtered);
            setStats({ assigned: filtered.length, pendingTasks: isStaff ? filtered.length * 2 : 0, completedTasks: 0 });
        } catch (error) { console.error(error); }
    };

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

    const calendarEvents = assignedEvents.map(ev => {
        const startDateTime = new Date(`${ev.date.split('T')[0]}T${ev.startTime}`);
        const endDateTime = new Date(`${ev.date.split('T')[0]}T${ev.endTime}`);
        return { id: ev._id, title: ev.title, start: startDateTime, end: endDateTime, extendedProps: ev };
    });

    const filteredCalendarEvents = calendarEvents.filter(ev => ev.title.toLowerCase().includes(searchQuery.toLowerCase()));

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
            <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-sm mb-4 overflow-hidden">
                    <div className="p-5 d-flex justify-content-between align-items-center flex-wrap gap-4 position-relative">
                        <div style={{ position: 'absolute', right: '0', top: '0', height: '100%', width: '400px', background: 'linear-gradient(270deg, rgba(108, 99, 255, 0.1) 0%, rgba(255,255,255,0) 100%)', zIndex: 0 }}></div>
                        <div style={{ zIndex: 1 }}>
                            <h2 className="fw-bold mb-2">Welcome back, {user?.name.split(' ')[0]}</h2>
                            <p className="mb-0 text-muted fs-5">You have {stats.assigned} active assignments requiring your coordination today.</p>
                        </div>
                        <Button variant="primary" size="lg" className="px-4 shadow-sm z-1" onClick={() => navigate(`${basePath}/assigned`)}>
                            View Assignments <ArrowRight size={20} className="ms-2"/>
                        </Button>
                    </div>
                </Card>
            </motion.div>

            <Row className="mb-4">
                {[
                    { label: 'Assigned Events', value: stats.assigned, icon: CalendarCheck, color: 'text-primary', badge: 'bg-primary' },
                    ...(isStaff ? [
                        { label: 'Pending Tasks', value: stats.pendingTasks, icon: ClipboardCheck, color: 'text-warning', badge: 'bg-warning' },
                        { label: 'Completed Tasks', value: stats.completedTasks, icon: Clock, color: 'text-success', badge: 'bg-success' }
                    ] : [
                        { label: 'Total Managed Teams', value: stats.assigned * 4, icon: Users, color: 'text-warning', badge: 'bg-warning' }
                    ])
                ].map((stat, idx) => (
                    <Col lg={4} sm={6} key={idx} className="mb-3">
                        <motion.div variants={itemVariants} className="h-100">
                            <Card className="p-4 border-0 shadow-sm h-100 d-flex flex-row align-items-center gap-4">
                                <div className={`p-4 rounded-circle ${stat.badge} bg-opacity-10 ${stat.color} flex-shrink-0 d-flex align-items-center justify-content-center`} style={{ width: '80px', height: '80px' }}>
                                    <stat.icon size={36} />
                                </div>
                                <div>
                                    <h2 className="fw-bold mb-1" style={{ fontSize: '2.5rem' }}>{stat.value}</h2>
                                    <span className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>{stat.label}</span>
                                </div>
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
                                            placeholder="Search schedule..." 
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
                                    events={filteredCalendarEvents}
                                    eventClick={(info) => navigate(`${basePath}/assigned`)}
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

export default EmployeeDashboard;
