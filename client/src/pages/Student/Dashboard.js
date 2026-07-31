import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Ticket, Calendar, CheckCircle, Bell, ArrowRight, QrCode, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({ registered: 3, upcoming: 1, completed: 5, pendingForums: 2 });
    
    // We fetch real events but for 'registered' stats we would ideally have a backend endpoint. 
    // We mock the count slightly based on what exists for visualization.
    const [recentEvents, setRecentEvents] = useState([]);

    useEffect(() => {
        if (user?.token) fetchRecentEvents();
    }, [user]);

    const fetchRecentEvents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/events', { headers: { Authorization: `Bearer ${user.token}` } });
            setRecentEvents(res.data.slice(0, 3)); // Mocking recent recommendations
        } catch (error) { console.error(error); }
    };

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="h-100">
            {/* Hero Section */}
            <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)', color: 'white' }}>
                    <div className="p-5 d-flex justify-content-between align-items-center flex-wrap gap-4">
                        <div>
                            <h2 className="fw-bold mb-2">Welcome back, {user?.name.split(' ')[0]} 👋</h2>
                            <p className="mb-0 text-white-50 fs-5">Explore and participate in upcoming campus events and hackathons.</p>
                        </div>
                        <Button variant="light" size="lg" className="px-4 shadow-sm" onClick={() => navigate('/student/browse')} style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                            Browse Events <ArrowRight size={20} className="ms-2"/>
                        </Button>
                    </div>
                </Card>
            </motion.div>

            <Row className="mb-4">
                {[
                    { label: 'Registered Events', value: stats.registered, icon: Ticket, color: 'text-primary', badge: 'bg-primary' },
                    { label: 'Upcoming Events', value: stats.upcoming, icon: Calendar, color: 'text-warning', badge: 'bg-warning' },
                    { label: 'Completed Events', value: stats.completed, icon: CheckCircle, color: 'text-success', badge: 'bg-success' },
                    { label: 'Forum Notifications', value: stats.pendingForums, icon: Bell, color: 'text-danger', badge: 'bg-danger' }
                ].map((stat, idx) => (
                    <Col lg={3} sm={6} key={idx} className="mb-3">
                        <motion.div variants={itemVariants}>
                            <Card className="p-4 border-0 shadow-sm h-100 position-relative overflow-hidden">
                                <div className={`position-absolute top-0 end-0 p-3 opacity-10 ${stat.color}`}>
                                    <stat.icon size={80} style={{ transform: 'translate(20%, -20%)' }} />
                                </div>
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className={`p-2 rounded ${stat.badge} bg-opacity-10 ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <span className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>{stat.label}</span>
                                </div>
                                <h2 className="fw-bold mb-0 text-dark" style={{ fontSize: '2.5rem' }}>{stat.value}</h2>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>

            <Row>
                <Col lg={8}>
                    <motion.div variants={itemVariants}>
                        <Card className="border-0 shadow-sm p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold mb-0">Recommended for You</h5>
                                <Button variant="link" className="text-decoration-none text-muted" onClick={() => navigate('/student/browse')}>View All</Button>
                            </div>
                            <div className="d-flex gap-3 overflow-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                                {recentEvents.map(ev => (
                                    <Card key={ev._id} className="border shadow-none" style={{ minWidth: '280px', borderRadius: '12px' }}>
                                        <div style={{ height: '120px', backgroundColor: 'rgba(108, 99, 255, 0.1)' }} className="d-flex align-items-center justify-content-center">
                                            <Calendar size={40} className="text-muted opacity-50" />
                                        </div>
                                        <div className="p-3">
                                            <h6 className="fw-bold mb-1 text-truncate">{ev.title}</h6>
                                            <p className="text-muted small mb-3">{new Date(ev.date).toLocaleDateString()}</p>
                                            <Button variant="outline-primary" size="sm" className="w-100" onClick={() => navigate(`/student/events/${ev._id}`)}>View Details</Button>
                                        </div>
                                    </Card>
                                ))}
                                {recentEvents.length === 0 && <p className="text-muted">No recommendations available.</p>}
                            </div>
                        </Card>
                    </motion.div>
                </Col>
                <Col lg={4}>
                    <motion.div variants={itemVariants}>
                        <Card className="border-0 shadow-sm p-4 h-100">
                            <h5 className="fw-bold mb-4">Quick Access</h5>
                            <div className="d-grid gap-3">
                                <Button variant="light" className="text-start p-3 d-flex align-items-center gap-3 border shadow-none" onClick={() => navigate('/student/qr')}>
                                    <div className="bg-primary bg-opacity-10 p-2 rounded text-primary"><QrCode size={20}/></div>
                                    <span className="fw-medium text-dark">Scan Event QR</span>
                                </Button>
                                <Button variant="light" className="text-start p-3 d-flex align-items-center gap-3 border shadow-none" onClick={() => navigate('/student/forums')}>
                                    <div className="bg-warning bg-opacity-10 p-2 rounded text-warning"><MessageSquare size={20}/></div>
                                    <span className="fw-medium text-dark">Join Discussions</span>
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </Col>
            </Row>

        </motion.div>
    );
};

export default Dashboard;
