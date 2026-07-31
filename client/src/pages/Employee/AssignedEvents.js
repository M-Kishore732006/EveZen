import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { Calendar, MapPin, Users, Clock, Search, ExternalLink, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AssignedEvents = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const isStaff = user?.role === 'Supporting Staff';
    const basePath = isStaff ? '/staff' : '/faculty';

    useEffect(() => {
        if (user?.token) fetchAssignedEvents();
    }, [user]);

    const fetchAssignedEvents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/events', { headers: { Authorization: `Bearer ${user.token}` } });
            const filtered = res.data.filter(ev => {
                if (isStaff) return ev.assignedStaff?.some(s => s._id === user._id);
                return ev.assignedFaculty?.some(f => f._id === user._id);
            });
            setEvents(filtered);
        } catch (error) { console.error(error); }
    };

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

    const filteredEvents = events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--primary-color)' }}>My Assignments</h3>
                    <p className="text-muted mb-0">Events currently assigned to your operational scope.</p>
                </div>
                <div className="position-relative" style={{ width: '300px' }}>
                    <Search size={18} className="position-absolute text-muted" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        className="form-control bg-white shadow-sm border-0" 
                        placeholder="Search assignments..." 
                        style={{ paddingLeft: '44px', borderRadius: '12px', height: '48px' }} 
                    />
                </div>
            </div>

            <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
                <motion.div variants={containerVariants} initial="hidden" animate="show">
                    <Row className="gy-4">
                        {filteredEvents.map(ev => (
                            <Col lg={4} md={6} key={ev._id}>
                                <motion.div variants={itemVariants} className="h-100">
                                    <Card className="border-0 shadow-sm h-100 overflow-hidden d-flex flex-column">
                                        <div style={{ height: '140px', background: 'linear-gradient(45deg, rgba(50, 30, 72, 0.9), rgba(108, 99, 255, 0.9))' }} className="d-flex flex-column justify-content-center p-4">
                                            <Badge bg="white" text="primary" className="w-fit-content mb-2">{ev.participationType} Format</Badge>
                                            <h5 className="fw-bold text-white mb-0 text-truncate">{ev.title}</h5>
                                        </div>
                                        <div className="p-4 d-flex flex-column flex-grow-1 bg-white">
                                            <div className="d-flex align-items-center justify-content-between mb-4">
                                                <Badge bg="success" className="bg-opacity-10 text-success border border-success fw-bold px-3 py-2 rounded-pill">Active Assignment</Badge>
                                                {!isStaff && <div className="text-muted small fw-medium d-flex align-items-center gap-1"><Users size={14}/> 4 Teams Registered</div>}
                                            </div>
                                            
                                            <div className="d-flex align-items-center gap-3 text-dark mb-3"><Calendar size={18} className="text-muted"/> <span className="fw-medium">{new Date(ev.date).toLocaleDateString()}</span></div>
                                            <div className="d-flex align-items-center gap-3 text-dark mb-3"><Clock size={18} className="text-muted"/> <span className="fw-medium">{ev.startTime} - {ev.endTime}</span></div>
                                            <div className="d-flex align-items-center gap-3 text-dark mb-4"><MapPin size={18} className="text-muted"/> <span className="fw-medium text-truncate">{ev.venue?.name || 'TBA'}</span></div>
                                            
                                            <div className="mt-auto d-flex gap-2 flex-wrap">
                                                {!isStaff && (
                                                    <Button variant="outline-primary" className="flex-grow-1 rounded-pill d-flex align-items-center justify-content-center fw-medium" onClick={() => alert('Attendance Module opens here')}>
                                                        <Activity size={16} className="me-2"/> Attendance
                                                    </Button>
                                                )}
                                                {isStaff && (
                                                    <Button variant="outline-primary" className="flex-grow-1 rounded-pill d-flex align-items-center justify-content-center fw-medium" onClick={() => navigate('/staff/tasks')}>
                                                        <Activity size={16} className="me-2"/> View Tasks
                                                    </Button>
                                                )}
                                                <Button variant="primary" className="flex-grow-1 rounded-pill d-flex align-items-center justify-content-center fw-medium" onClick={() => navigate(`${basePath}/forums`)}>
                                                    <ExternalLink size={16} className="me-2"/> Event Forum
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                    {filteredEvents.length === 0 && (
                        <div className="text-center py-5">
                            <Calendar size={60} className="text-muted opacity-25 mb-4"/>
                            <h5 className="fw-bold">No Assignments Found</h5>
                            <p className="text-muted">You do not have any upcoming event assignments yet.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AssignedEvents;
