import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';
import { ClipboardCheck, CalendarCheck, Clock, Users, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const EmployeeDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({ assigned: 0, pendingTasks: 0, completedTasks: 0 });
    const [assignedEvents, setAssignedEvents] = useState([]);
    const isStaff = user?.role === 'Supporting Staff';
    const basePath = isStaff ? '/staff' : '/faculty';

    useEffect(() => {
        if (user?.token) fetchEvents();
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
            setStats({ assigned: filtered.length, pendingTasks: isStaff ? filtered.length * 2 : 0, completedTasks: 3 });
        } catch (error) { console.error(error); }
    };

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="h-100">
            <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-sm mb-4 bg-white overflow-hidden">
                    <div className="p-5 d-flex justify-content-between align-items-center flex-wrap gap-4 position-relative">
                        <div style={{ position: 'absolute', right: '0', top: '0', height: '100%', width: '400px', background: 'linear-gradient(270deg, rgba(108, 99, 255, 0.1) 0%, rgba(255,255,255,0) 100%)', zIndex: 0 }}></div>
                        <div style={{ zIndex: 1 }}>
                            <h2 className="fw-bold mb-2 text-dark">Welcome back, {user?.name.split(' ')[0]}</h2>
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
                                    <h2 className="fw-bold mb-1 text-dark" style={{ fontSize: '2.5rem' }}>{stat.value}</h2>
                                    <span className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>{stat.label}</span>
                                </div>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>

            <Row>
                <Col lg={12}>
                    <motion.div variants={itemVariants}>
                        <Card className="border-0 shadow-sm p-4 h-100">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold mb-0">Today's Schedule</h5>
                                {isStaff && <Badge bg="light" text="dark" className="border">Shift: Morning</Badge>}
                            </div>
                            
                            <div className="d-grid gap-3">
                                {assignedEvents.length === 0 ? (
                                    <div className="text-center py-5">
                                        <CalendarCheck size={48} className="text-muted opacity-25 mb-3"/>
                                        <p className="text-muted">You have no active assignments for today.</p>
                                    </div>
                                ) : (
                                    assignedEvents.map(ev => (
                                        <div key={ev._id} className="p-3 bg-light rounded d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ borderLeft: '4px solid var(--accent-color)' }}>
                                            <div>
                                                <h6 className="fw-bold mb-1 text-dark">{ev.title}</h6>
                                                <div className="text-muted small d-flex gap-3">
                                                    <span className="d-flex align-items-center gap-1"><Clock size={12}/> {ev.startTime} - {ev.endTime}</span>
                                                    <span className="d-flex align-items-center gap-1"><MapPin size={12}/> {ev.venue?.name || 'TBA'}</span>
                                                </div>
                                            </div>
                                            <Button variant="outline-primary" size="sm" className="rounded-pill px-4" onClick={() => navigate(`${basePath}/forums`)}>Open Forum</Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </Col>
            </Row>
        </motion.div>
    );
};

export default EmployeeDashboard;
