import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Card, Button, Form, Row, Col, Badge, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Briefcase, Lock } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
    const { user } = useContext(AuthContext);
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });
        if (!currentPassword || !newPassword) {
            return setMsg({ type: 'danger', text: 'Please fill in both fields.' });
        }
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/users/change-password', {
                currentPassword, newPassword
            }, { headers: { Authorization: `Bearer ${user.token}` } });
            
            setMsg({ type: 'success', text: 'Password successfully updated!' });
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            setMsg({ type: 'danger', text: error.response?.data?.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-100 d-flex flex-column">
            <div className="mb-4">
                <h3 style={{ fontWeight: 700, color: 'var(--primary-color)' }}>My Profile</h3>
                <p className="text-muted mb-0">Manage your personal information and account security.</p>
            </div>

            <Row>
                <Col md={4}>
                    <Card className="border-0 shadow-sm p-4 text-center mb-4">
                        <div 
                            className="mx-auto mb-3 d-flex align-items-center justify-content-center shadow-sm" 
                            style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <h4 className="fw-bold mb-1">{user?.name}</h4>
                        <Badge bg="light" text="dark" className="px-3 py-2 border mb-3">{user?.role}</Badge>
                        <hr className="my-2" />
                        <div className="d-flex align-items-center justify-content-center gap-2 text-muted small mt-3">
                            <Briefcase size={14} /> EveZen Integrated Profile
                        </div>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card className="border-0 shadow-sm p-4 mb-4">
                        <h5 className="fw-bold mb-4">Personal Information</h5>
                        <Form>
                            <Row className="gy-3">
                                <Col md={6}>
                                    <Form.Label className="text-muted small fw-bold text-uppercase">Full Name</Form.Label>
                                    <div className="position-relative">
                                        <User size={18} className="position-absolute text-muted" style={{ left: '12px', top: '12px' }}/>
                                        <Form.Control type="text" value={user?.name} readOnly style={{ paddingLeft: '40px' }} className="bg-light" />
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="text-muted small fw-bold text-uppercase">Email Address</Form.Label>
                                    <div className="position-relative">
                                        <Mail size={18} className="position-absolute text-muted" style={{ left: '12px', top: '12px' }}/>
                                        <Form.Control type="email" value={user?.email} readOnly style={{ paddingLeft: '40px' }} className="bg-light" />
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="text-muted small fw-bold text-uppercase">Phone Number</Form.Label>
                                    <div className="position-relative">
                                        <Phone size={18} className="position-absolute text-muted" style={{ left: '12px', top: '12px' }}/>
                                        <Form.Control type="text" value={user?.phone || 'Not Provided'} readOnly style={{ paddingLeft: '40px' }} className="bg-light" />
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="text-muted small fw-bold text-uppercase">Account Role</Form.Label>
                                    <Form.Control type="text" value={user?.role} readOnly className="bg-light" />
                                </Col>
                            </Row>
                        </Form>
                    </Card>

                    <Card className="border-0 shadow-sm p-4">
                        <h5 className="fw-bold mb-4">Security</h5>
                        {msg.text && <Alert variant={msg.type} className="small py-2">{msg.text}</Alert>}
                        <Form onSubmit={handlePasswordUpdate}>
                            <Row className="gy-3 align-items-end">
                                <Col md={4}>
                                    <Form.Label className="text-muted small fw-bold text-uppercase">Current Password</Form.Label>
                                    <div className="position-relative">
                                        <Lock size={18} className="position-absolute text-muted" style={{ left: '12px', top: '12px' }}/>
                                        <Form.Control type="password" placeholder="Enter current password" style={{ paddingLeft: '40px' }} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <Form.Label className="text-muted small fw-bold text-uppercase">New Password</Form.Label>
                                    <div className="position-relative">
                                        <Lock size={18} className="position-absolute text-muted" style={{ left: '12px', top: '12px' }}/>
                                        <Form.Control type="password" placeholder="Enter new password" style={{ paddingLeft: '40px' }} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <Button type="submit" variant="primary" className="w-100 fw-bold" disabled={loading}>
                                        {loading ? 'Updating...' : 'Update Security'}
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </motion.div>
    );
};
export default Profile;

