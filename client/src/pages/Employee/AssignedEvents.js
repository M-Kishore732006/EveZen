import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Card, Row, Col, Badge, Button, Modal, Form } from 'react-bootstrap';
import { Calendar, MapPin, Users, Clock, Search, ExternalLink, Activity, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

const AssignedEvents = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [scanningEventId, setScanningEventId] = useState(null);
    const [scanResult, setScanResult] = useState({ type: '', message: '' });
    const [otpInput, setOtpInput] = useState('');
    
    // Support Staff Role-Based Tasks
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedEventForTasks, setSelectedEventForTasks] = useState(null);
    const [completedTasks, setCompletedTasks] = useState(() => {
        try { return JSON.parse(localStorage.getItem('evezen_completed_tasks')) || {}; } catch { return {}; }
    });

    const isStaff = user?.role === 'Supporting Staff';
    const basePath = isStaff ? '/staff' : '/faculty';

    useEffect(() => {
        if (user?.token) fetchAssignedEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    useEffect(() => {
        let scanner;
        if (showScanner) {
            scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            scanner.render(async (decodedText) => {
                scanner.pause(true);
                try {
                    const res = await axios.post(`http://localhost:5000/api/events/${scanningEventId}/attendance`, 
                        { qrData: decodedText }, 
                        { headers: { Authorization: `Bearer ${user.token}` } }
                    );
                    setScanResult({ type: 'success', message: res.data.message });
                } catch (err) {
                    setScanResult({ type: 'danger', message: err.response?.data?.message || 'Verification failed.' });
                }
                setTimeout(() => {
                    setScanResult({ type: '', message: '' });
                    scanner.resume();
                }, 3000);
            }, undefined);
        }
        return () => {
            if (scanner) scanner.clear().catch(error => console.error('Failed to clear scanner', error));
        };
    }, [showScanner, scanningEventId, user]);

    const handleOpenScanner = (eventId) => {
        setScanningEventId(eventId);
        setScanResult({ type: '', message: '' });
        setOtpInput('');
        setShowScanner(true);
    };

    const handleOpenTasks = (ev) => {
        setSelectedEventForTasks(ev);
        setShowTaskModal(true);
    };

    const handleToggleTask = (eventId, idx) => {
        const updated = { ...completedTasks };
        if (!updated[eventId]) updated[eventId] = {};
        updated[eventId][idx] = !updated[eventId][idx];
        setCompletedTasks(updated);
        localStorage.setItem('evezen_completed_tasks', JSON.stringify(updated));
    };

    const getRoleBasedTasks = (workType) => {
        const type = workType?.toLowerCase() || '';
        if (type.includes('electrician') || type.includes('electrical') || type.includes('power')) {
            return ['Check appliance connectivity & safety wire routing', 'Ensure backup generators are strictly on standby', 'Inspect audio/visual power lines & extensions', 'Verify main stage sound system power constraints'];
        }
        if (type.includes('security') || type.includes('guard')) {
            return ['Monitor entry and exit points actively', 'Verify attendee credentials & VIP passes', 'Coordinate with local emergency services if needed', 'Patrol venue perimeter before event start'];
        }
        if (type.includes('janitor') || type.includes('cleaning') || type.includes('housekeeping')) {
            return ['Ensure restrooms are fully stocked & sanitized', 'Clear trash bins periodically before and after the event', 'Sweep and mop the main hall seating aisles', 'Sanitize high-touch surfaces & door handles'];
        }
        if (type.includes('cater') || type.includes('food') || type.includes('hospitality')) {
            return ['Set up refreshment stations & tables', 'Verify dietary requirement lists with caterers', 'Manage water provisions at the speaker podium', 'Clear trays and plates periodically from guest tables'];
        }
        if (type.includes('tech') || type.includes('it ') || type.includes('network')) {
            return ['Test projector and check all display cables', 'Verify Wi-Fi network stability & guest access points', 'Ensure wireless microphone batteries are fully charged', 'Assist external speakers with slide deck uploads'];
        }
        return ['Assist faculty coordinators with event logistics', 'Help guide attendees with seating placement', 'Manage basic event equipment setup & breakdown', 'Report any visible issues directly to the head coordinator'];
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`http://localhost:5000/api/events/${scanningEventId}/attendance-otp`, 
                { otp: otpInput }, 
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setScanResult({ type: 'success', message: res.data.message });
            setOtpInput('');
        } catch (err) {
            setScanResult({ type: 'danger', message: err.response?.data?.message || 'OTP Verification failed.' });
        }
        setTimeout(() => setScanResult({ type: '', message: '' }), 3000);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--primary-color)' }}>My Assignments</h3>
                    <p className="text-muted mb-0">Events currently assigned to your operational scope.</p>
                </div>
                <div className="position-relative w-100" style={{ maxWidth: '350px' }}>
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
                                                    <Button variant="outline-primary" className="flex-grow-1 rounded-pill d-flex align-items-center justify-content-center fw-medium" onClick={() => handleOpenScanner(ev._id)}>
                                                        <QrCode size={16} className="me-2"/> Attendance
                                                    </Button>
                                                )}
                                                {isStaff && (
                                                    <Button variant="outline-primary" className="flex-grow-1 rounded-pill d-flex align-items-center justify-content-center fw-medium" onClick={() => handleOpenTasks(ev)}>
                                                        <Activity size={16} className="me-2"/> View Role Tasks
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
            <Modal show={showScanner} onHide={() => { setShowScanner(false); setScanningEventId(null); }} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold text-primary">Scan QR Code</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center pb-4">
                    <p className="text-muted mb-3">Position the student's QR code within the frame.</p>
                    {scanResult.message && <div className={`alert alert-${scanResult.type} py-2 mb-3 fw-medium`}>{scanResult.message}</div>}
                    <div id="reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}></div>
                    
                    <div className="mt-4 pt-4 border-top">
                        <p className="text-muted mb-3 fw-medium">Or enter the 6-digit passcode manually:</p>
                        <form onSubmit={handleOtpSubmit} className="d-flex align-items-center gap-2 justify-content-center">
                            <input 
                                type="text"
                                className="form-control text-center custom-placeholder"
                                style={{ maxWidth: '200px', fontSize: '1.25rem', letterSpacing: otpInput ? '8px' : 'normal', fontWeight: otpInput ? '700' : '300', opacity: otpInput ? 1 : 0.6 }}
                                placeholder="Enter Passcode"
                                maxLength={6}
                                value={otpInput}
                                onChange={e => setOtpInput(e.target.value)}
                            />
                            <Button type="submit" variant="primary" disabled={otpInput.length !== 6}>Verify</Button>
                        </form>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Role-Based Tasks Modal */}
            <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)} size="md" centered>
                <Modal.Header closeButton style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#f8f9fb' }}>
                    <Modal.Title style={{ fontWeight: 600, fontSize: '1.2rem', color: 'var(--primary-color)' }}>
                        <Activity size={20} className="me-2 mb-1"/> Event Objectives
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <div className="mb-4 text-center">
                        <Badge bg="primary" className="px-3 py-2 fs-6 mb-2 rounded-pill shadow-sm">{user?.workType || 'General Assignment'}</Badge>
                        <h5 className="fw-bold mt-2 text-dark">{selectedEventForTasks?.title}</h5>
                        <p className="text-muted small">Complete the following recommended procedural tasks assigned automatically to your designated department.</p>
                    </div>
                    
                    <div className="d-flex flex-column gap-3">
                        {getRoleBasedTasks(user?.workType).map((task, idx) => {
                            const isCompleted = completedTasks[selectedEventForTasks?._id]?.[idx];
                            return (
                                <div key={idx} className="d-flex align-items-start gap-3 p-3 bg-light rounded-3 border" style={{ opacity: isCompleted ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                                    <Form.Check 
                                        type="checkbox" 
                                        id={`task-${idx}`} 
                                        className="mt-1" 
                                        style={{ transform: 'scale(1.2)' }} 
                                        checked={!!isCompleted}
                                        onChange={() => handleToggleTask(selectedEventForTasks?._id, idx)}
                                    />
                                    <div>
                                        <Form.Label htmlFor={`task-${idx}`} className={`mb-0 fw-medium ${isCompleted ? 'text-muted text-decoration-line-through' : 'text-dark'}`} style={{ transition: 'all 0.2s' }}>
                                            {task}
                                        </Form.Label>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Modal.Body>
                <Modal.Footer className="bg-light border-0">
                    <Button variant="secondary" onClick={() => setShowTaskModal(false)} className="rounded-pill px-4">Close</Button>
                </Modal.Footer>
            </Modal>
        </motion.div>
    );
};

export default AssignedEvents;
