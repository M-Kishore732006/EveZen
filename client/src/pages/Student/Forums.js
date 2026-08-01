import React, { useState, useEffect, useContext } from 'react';
import { Card, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { FileText, Pin, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const StudentForums = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [activeEvent, setActiveEvent] = useState(null);
    const [activeTab, setActiveTab] = useState('Announcements');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (user?.token) fetchEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchEvents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/events', { headers: { Authorization: `Bearer ${user.token}` } });
            const filtered = res.data.filter(ev => ev.registeredStudents?.some(s => s._id === user._id));
            setEvents(filtered);
            if (filtered.length > 0) setActiveEvent(filtered[0]);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        if (activeEvent) fetchMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeEvent]);

    const fetchMessages = async () => {
        if (!activeEvent) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/forums/${activeEvent._id}/messages`, { headers: { Authorization: `Bearer ${user.token}` } });
            setMessages(res.data);
        } catch (error) { console.error(error); }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeEvent) return;
        try {
            await axios.post(`http://localhost:5000/api/forums/${activeEvent._id}/messages`, {
                content: newMessage, category: activeTab
            }, { headers: { Authorization: `Bearer ${user.token}` } });
            setNewMessage('');
            fetchMessages();
        } catch (error) { alert(error.response?.data?.message || 'Failed to send message'); }
    };

    const handleDeleteMessage = async (msgId) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/forums/${activeEvent._id}/messages/${msgId}`, { headers: { Authorization: `Bearer ${user.token}` } });
            fetchMessages();
        } catch (error) { alert(error.response?.data?.message || 'Failed to delete message'); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--primary-color)' }}>Discussion Forums</h3>
                    <p className="text-muted mb-0">Collaborate with your team, ask questions, and get official announcements.</p>
                </div>
            </div>

            <div className="d-flex h-100 gap-4" style={{ minHeight: '600px' }}>
                {/* Left Sidebar - Event Selection */}
                <div style={{ width: '280px' }} className="d-flex flex-column gap-3">
                    <h6 className="text-muted small fw-bold text-uppercase mb-1">Registered Events</h6>
                    {events.map((ev, idx) => (
                        <div 
                            key={ev._id} 
                            onClick={() => setActiveEvent(ev)}
                            className="p-3 rounded-4 shadow-sm fw-medium d-flex align-items-center gap-3" 
                            style={{ 
                                cursor: 'pointer', 
                                backgroundColor: activeEvent?._id === ev._id ? '#fff' : 'transparent',
                                border: activeEvent?._id === ev._id ? '1px solid rgba(108, 99, 255, 0.2)' : '1px solid transparent',
                                color: activeEvent?._id === ev._id ? 'var(--primary-color)' : 'var(--text-muted)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: activeEvent?._id === ev._id ? 'var(--accent-color)' : 'transparent' }}></div>
                            <span className="text-truncate">{ev.title}</span>
                        </div>
                    ))}
                </div>

                {/* Main Forum Area */}
                <Card className="flex-grow-1 border-0 shadow-sm d-flex flex-column overflow-hidden">
                    <div className="p-4 border-bottom bg-light bg-opacity-50">
                        <h5 className="fw-bold mb-3 text-dark">{activeEvent ? activeEvent.title : 'Select an Event'} Forum</h5>
                        <div className="d-flex p-1" style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '12px', width: 'fit-content' }}>
                            {['Announcements', 'Questions', 'Resources'].map(tab => (
                                <button 
                                    key={tab}
                                    className="border-0 px-4 py-2 small" 
                                    style={{ borderRadius: '8px', backgroundColor: activeTab === tab ? '#fff' : 'transparent', color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: activeTab === tab ? 600 : 500, boxShadow: activeTab === tab ? '0 2px 10px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                                    onClick={() => setActiveTab(tab)}
                                >{tab}</button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
                        {activeTab === 'Announcements' && (
                            <div className="d-flex flex-column gap-4">
                                {messages.filter(m => m.category === 'Announcements').length === 0 ? (
                                    <div className="text-center text-muted p-5">No announcements yet.</div>
                                ) : (
                                    messages.filter(m => m.category === 'Announcements').map(m => (
                                        <div key={m._id} className="p-4 rounded-4" style={{ backgroundColor: 'rgba(241, 196, 15, 0.05)', border: '1px solid rgba(241, 196, 15, 0.2)' }}>
                                            <div className="d-flex align-items-center gap-2 text-warning fw-bold small mb-3 text-uppercase"><Pin size={14}/> Official Announcement</div>
                                            <div className="d-flex gap-3">
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white' }} className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0">
                                                    {m.senderId?.name?.charAt(0) || 'A'}
                                                </div>
                                                <div>
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        <span className="fw-bold text-dark">{m.senderId?.name}</span> 
                                                        <Badge bg={m.senderId?.role === 'Admin' ? 'danger' : 'primary'}>{m.senderId?.role}</Badge> 
                                                        <span className="text-muted small">{new Date(m.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-muted mb-0">{m.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'Questions' && (
                            <div className="d-flex flex-column gap-4">
                                {messages.filter(m => m.category === 'Questions').length === 0 ? (
                                    <div className="text-center text-muted p-5">Be the first to ask a question!</div>
                                ) : (
                                    messages.filter(m => m.category === 'Questions').map(m => (
                                        <div key={m._id} className="d-flex gap-3">
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: m.senderId?._id === user._id ? 'var(--accent-color)' : 'rgba(108, 99, 255, 0.1)', color: m.senderId?._id === user._id ? 'white' : 'var(--primary-color)' }} className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0">
                                                {m.senderId?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span className="fw-bold text-dark">{m.senderId?.name}</span> 
                                                    <Badge bg="light" text="dark" className="border">{m.senderId?.role}</Badge> 
                                                    <span className="text-muted small">{new Date(m.createdAt).toLocaleString()}</span>
                                                </div>
                                                <p className="text-muted text-dark mb-0">{m.content}</p>
                                                {m.senderId?._id === user._id && (
                                                    <Button variant="link" size="sm" className="text-danger p-0 text-decoration-none small mt-1" style={{ fontSize: '0.75rem' }} onClick={() => handleDeleteMessage(m._id)}>Delete</Button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'Resources' && (
                            <div className="d-flex flex-column gap-3">
                                {[
                                    { name: 'Hackathon_Rulebook_V2.pdf', size: '2.4 MB', date: 'Yesterday' },
                                    { name: 'API_Documentation_Links.docx', size: '150 KB', date: '3 days ago' },
                                ].map((res, i) => (
                                    <div key={i} className="p-3 bg-light rounded d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="p-2 bg-white rounded shadow-sm text-primary"><FileText size={20}/></div>
                                            <div><h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.9rem' }}>{res.name}</h6><span className="text-muted small">{res.size} • Uploaded {res.date} by Faculty</span></div>
                                        </div>
                                        <Button variant="outline-primary" size="sm" className="rounded-pill px-3">Download</Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    {activeTab !== 'Resources' && activeTab !== 'Announcements' && (
                        <div className="p-4 bg-white border-top">
                            <Form onSubmit={handleSendMessage}>
                                <InputGroup>
                                    <Form.Control 
                                        placeholder={`Type a new ${activeTab === 'Announcements' ? 'announcement' : 'question'}...`} 
                                        className="bg-light border-0 shadow-none" 
                                        style={{ borderRadius: '24px 0 0 24px', paddingLeft: '20px', height: '48px' }}
                                        value={newMessage} onChange={e => setNewMessage(e.target.value)}
                                    />
                                    <Button type="submit" variant="primary" className="d-flex align-items-center px-4 shadow-sm" style={{ borderRadius: '0 24px 24px 0', height: '48px' }}>
                                        <Send size={18} className="ms-1"/>
                                    </Button>
                                </InputGroup>
                            </Form>
                        </div>
                    )}
                </Card>
            </div>
        </motion.div>
    );
};

export default StudentForums;
