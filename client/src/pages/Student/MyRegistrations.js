import React, { useState, useEffect, useContext } from 'react';
import { Card, Button, Row, Col, Badge, Modal } from 'react-bootstrap';
import { QrCode, Calendar, MapPin, Eye, Ticket, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

const MyRegistrations = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [registrations, setRegistrations] = useState([]);
    const [showQR, setShowQR] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [qrCodeData, setQrCodeData] = useState('');
    const [otpData, setOtpData] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        if (user?.token) fetchRegistrations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchRegistrations = async () => {
        try {
            const res = await axios.get('/api/events', { headers: { Authorization: `Bearer ${user.token}` } });
            const filtered = res.data.filter(ev => ev.registeredStudents?.some(s => s._id === user._id));
            setRegistrations(filtered);
        } catch (error) { console.error(error); }
    };

    // Dynamic QR generation
    useEffect(() => {
        let timer;
        let qrInterval;
        if (showQR && selectedEventId) {
            const generateQRAndOTP = async () => {
                const timestamp = new Date().getTime();
                setQrCodeData(`EVENT:${selectedEventId}|USER:${user._id}|TS:${timestamp}`);
                setTimeLeft(60);
                
                try {
                    const res = await axios.post(`/api/events/${selectedEventId}/generate-pass`, {}, {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    setOtpData(res.data.otp);
                } catch (error) { console.error('Failed to generate OTP', error); }
            };
            
            generateQRAndOTP(); // Initial gen
            
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) return 60;
                    return prev - 1;
                });
            }, 1000);

            qrInterval = setInterval(generateQRAndOTP, 60000);
        }
        return () => { clearInterval(timer); clearInterval(qrInterval); };
    }, [showQR, selectedEventId, user]);

    const openQR = (eventId) => {
        setSelectedEventId(eventId);
        setShowQR(true);
    };

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
                        <Col md={12} key={reg._id}>
                            <motion.div variants={itemVariants}>
                                <Card className="border-0 shadow-sm overflow-hidden d-flex flex-column flex-md-row" style={{ minHeight: '140px', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div style={{ minWidth: '120px', background: 'linear-gradient(45deg, rgba(50, 30, 72, 0.8), rgba(108, 99, 255, 0.8))' }} className="d-none d-md-flex align-items-center justify-content-center flex-shrink-0 text-white">
                                        <Calendar size={40} className="opacity-50" />
                                    </div>
                                    <div className="p-4 d-flex flex-grow-1 align-items-center justify-content-between flex-wrap gap-3 bg-white">
                                        <div>
                                            <div className="d-flex align-items-center gap-3 mb-1">
                                                <h5 className="fw-bold mb-0 text-dark">{reg.title}</h5>
                                                {reg.attendedStudents?.some(s => s._id === user._id) ? (
                                                    <Badge bg="primary" text="white" className="border bg-opacity-75">Attended</Badge>
                                                ) : (
                                                    <Badge bg="success" text="white" className="border bg-opacity-75">Confirmed</Badge>
                                                )}
                                            </div>
                                            <p className="text-muted small fw-medium mb-2 opacity-75">Participation: {reg.participationType}</p>
                                            <div className="d-flex align-items-center gap-3 text-muted" style={{ fontSize: '0.85rem' }}>
                                                <span className="d-flex align-items-center gap-1"><Calendar size={14}/> {new Date(reg.date).toLocaleDateString()}</span>
                                                <span className="d-flex align-items-center gap-1"><MapPin size={14}/> {reg.venue?.name || 'TBA'}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="d-flex gap-2">
                                            <Button variant="light" className="rounded-pill d-flex align-items-center px-4 border shadow-sm" onClick={() => navigate(`/student/events/${reg._id}`)}>
                                                <Eye size={16} className="me-2 text-muted"/> View Details
                                            </Button>
                                            {!reg.attendedStudents?.some(s => s._id === user._id) && (
                                                <Button variant="primary" className="rounded-pill d-flex align-items-center px-4 shadow-sm" onClick={() => openQR(reg._id)}>
                                                    <QrCode size={16} className="me-2"/> Authentication QR
                                                </Button>
                                            )}
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

            {/* Dynamic QR Modal */}
            <Modal show={showQR} onHide={() => setShowQR(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold text-center w-100" style={{ color: 'var(--primary-color)' }}>Event Access Pass</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex flex-column align-items-center pb-5 pt-3">
                    <p className="text-muted text-center mb-4">Present this secure QR code at the registration desk. It refreshes automatically.</p>
                    
                    <div className="p-3 bg-white rounded-4 shadow-sm border mb-4 text-center" style={{ display: 'inline-block' }}>
                        {qrCodeData && <QRCodeSVG value={qrCodeData} size={220} level="H" fgColor="var(--primary-color)" />}
                        {otpData && (
                            <div className="mt-3 pt-3 border-top">
                                <div className="text-muted small fw-bold text-uppercase mb-1">Or use Passcode</div>
                                <div style={{ fontSize: '2rem', letterSpacing: '8px', color: 'var(--accent-color)' }} className="fw-bold">{otpData}</div>
                            </div>
                        )}
                    </div>

                    <div className="d-flex align-items-center gap-2 text-primary fw-medium px-4 py-2 rounded-pill" style={{ backgroundColor: 'rgba(108, 99, 255, 0.1)' }}>
                        <Clock size={16} /> Auto-refreshing in: <strong style={{ width: '24px', textAlign: 'center' }}>{timeLeft}s</strong>
                    </div>
                </Modal.Body>
            </Modal>
        </motion.div>
    );
};

export default MyRegistrations;
