import React from 'react';
import { Card, Button, Row, Col, Badge } from 'react-bootstrap';
import { QrCode, Calendar, MapPin, Eye, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MyRegistrations = () => {
    const navigate = useNavigate();
    
    // We mock registrations since there's no backend endpoint, as instructed.
    const registrations = [
        { id: '1', title: 'Annual Tech Symposium 2026', team: 'Cyber Ninjas', date: '2026-08-15', status: 'Confirmed', participation: 'Team' },
        { id: '2', title: 'AI & Data Science Workshop', team: 'Individual', date: '2026-09-02', status: 'Pending Approval', participation: 'Individual' },
    ];

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--primary-color)' }}>My Registrations</h3>
                    <p className="text-muted mb-0">Track and manage your upcoming event participations.</p>
                </div>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="show">
                <Row className="gy-4">
                    {registrations.map(reg => (
                        <Col md={12} key={reg.id}>
                            <motion.div variants={itemVariants}>
                                <Card className="border-0 shadow-sm overflow-hidden d-flex flex-row" style={{ minHeight: '140px', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div style={{ width: '120px', background: 'linear-gradient(45deg, rgba(50, 30, 72, 0.8), rgba(108, 99, 255, 0.8))' }} className="d-flex align-items-center justify-content-center flex-shrink-0 text-white">
                                        <Calendar size={40} className="opacity-50" />
                                    </div>
                                    <div className="p-4 d-flex flex-grow-1 align-items-center justify-content-between flex-wrap gap-3 bg-white">
                                        <div>
                                            <div className="d-flex align-items-center gap-3 mb-1">
                                                <h5 className="fw-bold mb-0 text-dark">{reg.title}</h5>
                                                <Badge bg={reg.status === 'Confirmed' ? 'success' : 'warning'} text={reg.status === 'Confirmed' ? 'white' : 'dark'} className="border bg-opacity-75">{reg.status}</Badge>
                                            </div>
                                            <p className="text-muted small fw-medium mb-2 opacity-75">Participation: {reg.participation} • Entity: {reg.team}</p>
                                            <div className="d-flex align-items-center gap-3 text-muted" style={{ fontSize: '0.85rem' }}>
                                                <span className="d-flex align-items-center gap-1"><Calendar size={14}/> {new Date(reg.date).toLocaleDateString()}</span>
                                                <span className="d-flex align-items-center gap-1"><MapPin size={14}/> Main Campus</span>
                                            </div>
                                        </div>
                                        
                                        <div className="d-flex gap-2">
                                            <Button variant="light" className="rounded-pill d-flex align-items-center px-4 border shadow-sm">
                                                <Eye size={16} className="me-2 text-muted"/> View Details
                                            </Button>
                                            <Button variant="primary" className="rounded-pill d-flex align-items-center px-4 shadow-sm" onClick={() => navigate('/student/qr')}>
                                                <QrCode size={16} className="me-2"/> Authentication QR
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        </Col>
                    ))}
                    {registrations.length === 0 && (
                        <div className="text-center py-5">
                            <Ticket size={48} className="text-muted opacity-25 mb-3"/>
                            <p className="text-muted">You have no active registrations.</p>
                            <Button variant="outline-primary" onClick={() => navigate('/student/browse')}>Browse Events</Button>
                        </div>
                    )}
                </Row>
            </motion.div>
        </motion.div>
    );
};

export default MyRegistrations;
