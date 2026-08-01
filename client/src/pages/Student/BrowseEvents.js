import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Card, Button, Row, Col, Badge } from 'react-bootstrap';
import { Calendar, MapPin, Clock, Search, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BrowseEvents = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (user?.token) fetchEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchEvents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/events', { headers: { Authorization: `Bearer ${user.token}` } });
            setEvents(res.data);
        } catch (error) { console.error(error); }
    };

    const handleRegister = async (eventId) => {
        try {
            await axios.post(`http://localhost:5000/api/events/${eventId}/register`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
            alert('Successfully registered!');
            fetchEvents(); // Refresh to get updated lists
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to register');
        }
    };

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

    const filteredEvents = events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--primary-color)' }}>Event Catalog</h3>
                    <p className="text-muted mb-0">Discover and register for upcoming university events.</p>
                </div>
                <div className="position-relative" style={{ width: '300px' }}>
                    <Search size={18} className="position-absolute text-muted" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" 
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="form-control bg-white shadow-sm border-0" 
                        placeholder="Search event titles..." 
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
                                        {/* Mock Event Banner */}
                                        <div style={{ height: '140px', background: 'linear-gradient(45deg, rgba(108, 99, 255, 0.1), rgba(50, 30, 72, 0.2))' }} className="d-flex align-items-center justify-content-center position-relative">
                                            <Calendar size={48} className="text-primary opacity-25" />
                                            <Badge bg={ev.participationType === 'Team' ? 'info' : 'secondary'} className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill border shadow-sm">
                                                {ev.participationType} {ev.participationType === 'Team' && `(${ev.teamSize})`}
                                            </Badge>
                                        </div>
                                        <div className="p-4 d-flex flex-column flex-grow-1">
                                            <h5 className="fw-bold mb-2 text-dark">{ev.title}</h5>
                                            <Badge bg="light" text="muted" className="mb-3 w-fit-content border">{ev.participationType === 'Team' ? 'Competition' : 'General Assembly'}</Badge>
                                            
                                            <div className="d-flex align-items-center gap-2 text-muted mb-2 small"><Calendar size={14}/> {new Date(ev.date).toLocaleDateString()}</div>
                                            <div className="d-flex align-items-center gap-2 text-muted mb-2 small"><Clock size={14}/> {ev.startTime} - {ev.endTime}</div>
                                            <div className="d-flex align-items-center gap-2 text-muted mb-3 small"><MapPin size={14}/> {ev.venue?.name || 'TBA'}</div>
                                            
                                            <div className="mt-auto d-flex gap-2">
                                                <Button variant="outline-primary" className="w-100 rounded-pill" onClick={() => navigate(`/student/events/${ev._id}`)}>
                                                    View Details
                                                </Button>
                                                {ev.registeredStudents?.some(s => s._id === user._id) ? (
                                                    <Button variant="success" className="w-100 rounded-pill d-flex align-items-center justify-content-center" disabled>
                                                        Registered <CheckCircle size={16} className="ms-1"/>
                                                    </Button>
                                                ) : (
                                                    <Button variant="primary" className="w-100 rounded-pill d-flex align-items-center justify-content-center" onClick={() => handleRegister(ev._id)}>
                                                        Register <ArrowRight size={16} className="ms-1"/>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                    {filteredEvents.length === 0 && <p className="text-muted text-center pt-5">No events match your search.</p>}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default BrowseEvents;
