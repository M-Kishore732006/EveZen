import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Card, Button, Badge, Row, Col, Form, ProgressBar, Alert } from 'react-bootstrap';
import { Calendar, MapPin, Clock, Users, ArrowLeft, CheckCircle, Navigation, Info, MessageSquare, User, Trash, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const EventDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'overview';
    
    const [event, setEvent] = useState(null);
    const [activeTab, setActiveTab] = useState(initialTab === 'register' ? 'register' : 'overview');

    // Registration Wizard State
    const [regStep, setRegStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    useEffect(() => {
        if (event?.registeredStudents?.some(s => s._id === user._id)) {
            setIsSuccess(true);
            setRegStep(4);
        }
    }, [event, user._id]);
    const [teamName, setTeamName] = useState('');
    const [members, setMembers] = useState([{ name: '', email: '' }]);

    useEffect(() => {
        if (user?.token) fetchEvent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, id]);

    const fetchEvent = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/events`, { headers: { Authorization: `Bearer ${user.token}` } });
            const ev = res.data.find(e => e._id === id);
            setEvent(ev);
        } catch (error) { console.error(error); }
    };

    const generateCertificate = (studentName, eventTitle, eventDate) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 700;
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Border
        ctx.strokeStyle = '#6C63FF';
        ctx.lineWidth = 16;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
        
        // Content
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 54px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CERTIFICATE OF PARTICIPATION', canvas.width / 2, 160);
        
        ctx.fillStyle = '#94A3B8';
        ctx.font = 'italic 28px Arial';
        ctx.fillText('This proudly certifies that', canvas.width / 2, 260);
        
        ctx.fillStyle = '#6C63FF';
        ctx.font = 'bold 64px Arial';
        ctx.fillText(studentName.toUpperCase(), canvas.width / 2, 360);
        
        ctx.fillStyle = '#94A3B8';
        ctx.font = '24px Arial';
        ctx.fillText('has excellently attended and completed the event', canvas.width / 2, 450);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 42px Arial';
        ctx.fillText(eventTitle, canvas.width / 2, 530);
        
        ctx.fillStyle = '#6C63FF';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`Issued: ${new Date(eventDate).toLocaleDateString()}`, canvas.width / 2, 620);
        
        const link = document.createElement('a');
        link.download = `Certificate_${studentName.replace(/ /g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const handleAddMember = () => {
        if (members.length < (event?.teamSize || 2)) setMembers([...members, { name: '', email: '' }]);
    };

    const handleRemoveMember = (idx) => {
        const nm = [...members];
        nm.splice(idx, 1);
        setMembers(nm);
    };

    const submitRegistration = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = event.participationType === 'Team' ? {
                teamName: teamName || `${user.name}'s Team`,
                members: members
            } : {};
            await axios.post(`http://localhost:5000/api/events/${id}/register`, payload, { headers: { Authorization: `Bearer ${user.token}` } });
            setIsSubmitting(false);
            setIsSuccess(true);
            setRegStep(4);
            fetchEvent(); // Refresh to capture new status
        } catch (error) {
            setIsSubmitting(false);
            alert(error.response?.data?.message || 'Failed to register');
        }
    };

    if (!event) return <div className="p-5 text-center text-muted">Loading event details...</div>;

    const renderRegistrationWizard = () => {
        if (event.participationType === 'Individual') {
            return (
                <Card className="border-0 shadow-sm p-5 text-center">
                    {!isSuccess ? (
                        <>
                            <div className="mb-4 d-flex justify-content-center"><div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary"><User size={40}/></div></div>
                            <h4 className="fw-bold mb-3">Individual Registration</h4>
                            <p className="text-muted mb-4">You will be registering as {user.name} ({user.email}).</p>
                            <Button variant="primary" size="lg" onClick={submitRegistration} disabled={isSubmitting}>
                                {isSubmitting ? 'Processing...' : 'Confirm Registration'}
                            </Button>
                        </>
                    ) : (
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <CheckCircle size={60} className="text-success mb-3 mx-auto" />
                            <h4 className="fw-bold text-success mb-2">Registration Successful!</h4>
                            <p className="text-muted mb-4">You have successfully secured your ticket.</p>
                            <Button variant="outline-primary" onClick={() => navigate('/student/registrations')}>View My Registrations</Button>
                        </motion.div>
                    )}
                </Card>
            );
        }

        // Multistep Team Registration
        return (
            <Card className="border-0 shadow-sm p-4">
                <div className="mb-4">
                    <div className="d-flex justify-content-between text-muted small fw-bold text-uppercase mb-2">
                        <span>Step {Math.min(regStep, 3)} of 3</span>
                        <span>{regStep === 1 ? 'Team Info' : regStep === 2 ? 'Leader Info' : regStep === 3 ? 'Members' : 'Complete'}</span>
                    </div>
                    <ProgressBar variant="primary" now={(regStep / 3) * 100} style={{ height: '6px' }} />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={regStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        {regStep === 1 && (
                            <Form onSubmit={(e) => { e.preventDefault(); setRegStep(2); }}>
                                <h5 className="fw-bold mb-4">1. Team Details</h5>
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-muted small fw-bold text-uppercase">Team Name</Form.Label>
                                    <Form.Control required type="text" placeholder="e.g. Cyber Ninjas" value={teamName} onChange={e => setTeamName(e.target.value)} size="lg" />
                                </Form.Group>
                                <Button type="submit" variant="primary" className="w-100 py-2">Continue to Next Step</Button>
                            </Form>
                        )}
                        {regStep === 2 && (
                            <Form onSubmit={(e) => { e.preventDefault(); setRegStep(3); }}>
                                <h5 className="fw-bold mb-4">2. Leader Information</h5>
                                <Alert variant="info" className="d-flex align-items-center gap-2 border-0 bg-opacity-10 bg-primary text-primary"><Info size={16}/> You are automatically assigned as the Team Leader.</Alert>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-muted small fw-bold text-uppercase">Leader Name</Form.Label>
                                    <Form.Control type="text" value={user.name} readOnly className="bg-light" />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-muted small fw-bold text-uppercase">Leader Email</Form.Label>
                                    <Form.Control type="email" value={user.email} readOnly className="bg-light" />
                                </Form.Group>
                                <div className="d-flex gap-2">
                                    <Button variant="light" className="w-50" onClick={() => setRegStep(1)}>Back</Button>
                                    <Button type="submit" variant="primary" className="w-50">Continue</Button>
                                </div>
                            </Form>
                        )}
                        {regStep === 3 && (
                            <Form onSubmit={submitRegistration}>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold mb-0">3. Team Members</h5>
                                    <Badge bg="secondary">Max Size: {event.teamSize}</Badge>
                                </div>
                                {members.map((m, idx) => (
                                    <div key={idx} className="p-3 border rounded mb-3 bg-light bg-opacity-50">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="fw-bold mb-0" style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}>Member {idx + 1}</h6>
                                            <Button variant="link" className="text-danger p-0 border-0" onClick={() => handleRemoveMember(idx)}><Trash size={16}/></Button>
                                        </div>
                                        <Row className="gy-3">
                                            <Col md={6}><Form.Control required placeholder="Full Name" value={m.name} onChange={e => { const nm = [...members]; nm[idx].name = e.target.value; setMembers(nm); }} /></Col>
                                            <Col md={6}><Form.Control required type="email" placeholder="Email Address" value={m.email} onChange={e => { const nm = [...members]; nm[idx].email = e.target.value; setMembers(nm); }} /></Col>
                                        </Row>
                                    </div>
                                ))}
                                {members.length < (event.teamSize - 1) && ( // -1 because leader is 1
                                    <Button variant="outline-primary" type="button" size="sm" className="mb-4 w-100 border-dashed" onClick={handleAddMember}>+ Add Another Member</Button>
                                )}
                                <div className="d-flex gap-2">
                                    <Button variant="light" className="w-50" onClick={() => setRegStep(2)} disabled={isSubmitting}>Back</Button>
                                    <Button type="submit" variant="primary" className="w-50" disabled={isSubmitting}>{isSubmitting ? 'Processing...' : 'Complete Registration'}</Button>
                                </div>
                            </Form>
                        )}
                        {regStep === 4 && (
                            <div className="text-center py-4">
                                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                    <CheckCircle size={60} className="text-success mb-3 mx-auto" />
                                    <h4 className="fw-bold text-success mb-2">Team Registered!</h4>
                                    <p className="text-muted mb-4">Team <strong>{teamName}</strong> has secured a spot for {event.title}.</p>
                                    <Button variant="outline-primary" onClick={() => navigate('/student/registrations')}>View My Registrations</Button>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </Card>
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-100 d-flex flex-column">
            <Button variant="link" className="text-decoration-none text-muted d-flex align-items-center mb-4 p-0 w-fit-content" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} className="me-2"/> Back to Events
            </Button>
            
            <div className="mb-4">
                <div className="d-flex align-items-center gap-3 mb-2">
                    <h2 className="fw-bold text-dark mb-0">{event.title}</h2>
                    <Badge bg={event.participationType === 'Team' ? 'info' : 'secondary'} className="px-3 py-2">{event.participationType} Event</Badge>
                </div>
                <div className="d-flex gap-4 text-muted">
                    <span className="d-flex align-items-center gap-1"><Calendar size={16}/> {new Date(event.date).toLocaleDateString()}</span>
                    <span className="d-flex align-items-center gap-1"><MapPin size={16}/> {event.venue?.name || 'TBA'}</span>
                </div>
            </div>

            <div className="d-flex p-1 mb-4" style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '12px', width: 'fit-content' }}>
                {['overview', 'register', 'forum'].map(tab => (
                    <button 
                        key={tab}
                        className="border-0 px-4 py-2" 
                        style={{ borderRadius: '8px', backgroundColor: activeTab === tab ? '#fff' : 'transparent', color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: activeTab === tab ? 600 : 500, boxShadow: activeTab === tab ? '0 2px 10px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s', textTransform: 'capitalize' }}
                        onClick={() => setActiveTab(tab)}
                    >{tab === 'forum' ? 'Discussion Forum' : tab}</button>
                ))}
            </div>

            <Row className="flex-grow-1">
                <Col lg={12} className="mb-4">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            {activeTab === 'overview' && (
                                <Card className="border-0 shadow-sm p-4 h-100">
                                    <h5 className="fw-bold mb-4">Event Description</h5>
                                    <p className="text-muted mb-4" style={{ lineHeight: '1.7' }}>{event.description || 'Join us for this exciting university event. Full details and schedule will be announced shortly.'}</p>
                                    
                                    <h5 className="fw-bold mb-3 mt-4">Key Information</h5>
                                    <Row className="gy-4 mb-4">
                                        <Col md={6} className="d-flex gap-3">
                                            <div className="bg-light p-3 rounded text-primary"><Clock size={24}/></div>
                                            <div><p className="text-muted small fw-bold text-uppercase mb-0">Timing</p><p className="fw-medium mb-0">{event.startTime} - {event.endTime}</p></div>
                                        </Col>
                                        <Col md={6} className="d-flex gap-3">
                                            <div className="bg-light p-3 rounded text-primary"><Navigation size={24}/></div>
                                            <div><p className="text-muted small fw-bold text-uppercase mb-0">Location</p><p className="fw-medium mb-0">{event.venue?.location || 'General Campus'}</p></div>
                                        </Col>
                                        <Col md={6} className="d-flex gap-3">
                                            <div className="bg-light p-3 rounded text-primary"><Users size={24}/></div>
                                            <div><p className="text-muted small fw-bold text-uppercase mb-0">Max Capacity</p><p className="fw-medium mb-0">{event.capacity || 'Unlimited'} Attendees</p></div>
                                        </Col>
                                    </Row>
                                    <hr className="my-4 opacity-10"/>
                                    <div className="text-muted small fw-bold text-uppercase mb-2">Faculty Coordinators</div>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {event.assignedFaculty?.length > 0 ? event.assignedFaculty.map(f => (
                                            <Badge key={f._id} bg="light" text="dark" className="border px-3 py-2 fw-medium">{f.name}</Badge>
                                        )) : <span className="text-muted">None Assigned</span>}
                                    </div>
                                    
                                    {event.participationType === 'Team' && event.teamRegistrations?.some(t => String(t.leader?._id || t.leader) === String(user._id)) && (
                                        <>
                                            <hr className="my-5 opacity-10"/>
                                            <div className="text-muted small fw-bold text-uppercase mb-3">Your Team Details</div>
                                            {(() => {
                                                const myTeam = event.teamRegistrations.find(t => String(t.leader?._id || t.leader) === String(user._id));
                                                const hasAttended = event.attendedStudents?.some(s => String(s._id || s) === String(user._id));
                                                return (
                                                    <div className="bg-light bg-opacity-50 p-4 rounded-4 border">
                                                        <h5 className="fw-bold text-primary mb-3 text-uppercase d-flex align-items-center gap-2"><Users size={20}/> {myTeam.teamName}</h5>
                                                        <Row className="gy-3">
                                                            <Col lg={12}>
                                                                <div className="p-3 bg-white border rounded shadow-sm d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                                    <div>
                                                                        <div className="fw-bold text-dark">{user.name} <Badge bg="primary" className="ms-2">Leader</Badge></div>
                                                                        <div className="text-muted small">{user.email}</div>
                                                                    </div>
                                                                    {hasAttended && (
                                                                        <Button variant="success" size="sm" className="d-flex align-items-center gap-2" onClick={() => generateCertificate(user.name, event.title, event.date)}>
                                                                            <Award size={16}/> Certificate
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </Col>
                                                            {myTeam.members?.map((m, idx) => (
                                                                <Col lg={12} key={idx}>
                                                                    <div className="p-3 bg-white border rounded shadow-sm d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                                        <div>
                                                                            <div className="fw-bold text-dark">{m.name}</div>
                                                                            <div className="text-muted small">{m.email}</div>
                                                                        </div>
                                                                        {hasAttended && (
                                                                            <Button variant="success" size="sm" className="d-flex align-items-center gap-2" onClick={() => generateCertificate(m.name, event.title, event.date)}>
                                                                                <Award size={16}/> Certificate
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </Col>
                                                            ))}
                                                        </Row>
                                                    </div>
                                                );
                                            })()}
                                        </>
                                    )}

                                    {event.participationType === 'Individual' && event.attendedStudents?.some(s => s._id === user._id || s === user._id) && (
                                        <>
                                            <hr className="my-5 opacity-10"/>
                                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 bg-light bg-opacity-50 p-4 rounded-4 border">
                                                <div>
                                                    <h6 className="fw-bold text-dark mb-1">Your Certificate</h6>
                                                    <p className="text-muted small mb-0">You have successfully attended {event.title}.</p>
                                                </div>
                                                <Button variant="success" className="d-flex align-items-center gap-2" onClick={() => generateCertificate(user.name, event.title, event.date)}>
                                                    <Award size={18}/> Download Certificate
                                                </Button>
                                            </div>
                                        </>
                                    )}

                                </Card>
                            )}

                            {activeTab === 'register' && renderRegistrationWizard()}

                            {activeTab === 'forum' && (
                                <Card className="border-0 shadow-sm p-5 text-center">
                                    {event.registeredStudents?.some(s => s._id === user._id) ? (
                                        <>
                                            <MessageSquare size={48} className="text-primary mb-3 mx-auto" />
                                            <h5 className="fw-bold mb-2">Forum Unlocked</h5>
                                            <p className="text-muted mb-4">You have access to this event's dedicated discussion forum.</p>
                                            <Button variant="primary" onClick={() => navigate('/student/forums')}>Go to Forums</Button>
                                        </>
                                    ) : (
                                        <>
                                            <MessageSquare size={48} className="text-muted mb-3 mx-auto opacity-50" />
                                            <h5 className="fw-bold mb-2">Forum Locked</h5>
                                            <p className="text-muted mb-4">You must securely register for this event to unlock access to the dedicated discussion forum and resources.</p>
                                            <Button variant="outline-primary" onClick={() => setActiveTab('register')}>Register Now</Button>
                                        </>
                                    )}
                                </Card>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </Col>


            </Row>

        </motion.div>
    );
};
export default EventDetails;
