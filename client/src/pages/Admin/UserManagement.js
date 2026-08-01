import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Card, Button } from 'react-bootstrap';
import { Trash, Calendar as CalendarIcon, Briefcase, Mail, Phone, DownloadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

const UserManagement = () => {
    const { user } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (user?.token) {
            fetchUsers();
            fetchEvents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchUsers = async () => {
        try {
            const stuRes = await axios.get('/api/users/students', { headers: { Authorization: `Bearer ${user.token}` } });
            setStudents(stuRes.data);
        } catch (error) { console.error(error); }
    };

    const fetchEvents = async () => {
        try {
            const res = await axios.get('/api/events', { headers: { Authorization: `Bearer ${user.token}` } });
            setEvents(res.data);
        } catch (error) { console.error(error); }
    };

    const getAssignedCount = (userId) => {
        let count = 0;
        events.forEach(ev => {
            if (ev.registeredStudents?.some(s => s._id === userId || s === userId)) count++;
        });
        return count;
    };

    const handleDelete = async (id) => {
        if (window.confirm(`Delete this user permanently?`)) {
            try {
                await axios.delete(`/api/users/students/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
                fetchUsers();
            } catch (err) { alert('Error deleting user'); }
        }
    };

    const exportToExcel = () => {
        if (students.length === 0) return;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        // Header
        csvContent += "UserID,Name,Email,Phone,Registered Events Count\n";
        
        students.forEach(student => {
            const assignedCount = getAssignedCount(student._id);
            // Quote strings to avoid issues with commas
            const row = `"${student._id}","${student.name}","${student.email}","${student.phone || 'N/A'}","${assignedCount}"`;
            csvContent += row + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `registered_users_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        
        link.click();
        document.body.removeChild(link);
    };

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
    const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--primary-color)' }}>Registered Users</h3>
                    <p className="text-muted mb-0">View all registered student profiles and extract data.</p>
                </div>
                <Button variant="success" onClick={exportToExcel} className="d-flex align-items-center gap-2 shadow-sm">
                    <DownloadCloud size={18} /> Export as Excel (CSV)
                </Button>
            </div>

            <Card className="flex-grow-1 p-0 shadow-sm border-0 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <div className="event-card-bg px-4 py-3 d-none d-md-flex" style={{ borderBottom: '1px solid var(--border-color, rgba(0,0,0,0.05))', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <div style={{ flex: '2 1 0' }}>Profile</div>
                    <div style={{ flex: '1.5 1 0' }}>Contact</div>
                    <div style={{ flex: '1 1 0' }}>Event Participation</div>
                    <div style={{ flex: '0.5 1 0', textAlign: 'right' }}>Actions</div>
                </div>

                <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
                    {students.length === 0 ? (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted p-5">
                            <Briefcase size={48} className="mb-3" style={{ opacity: 0.2 }} />
                            <h5>No users found</h5>
                            <p>Once students sign up, they will appear here.</p>
                        </div>
                    ) : (
                        <motion.div variants={containerVariants} initial="hidden" animate="show">
                            {students.map(item => (
                                <motion.div variants={itemVariants} key={item._id} className="px-4 py-3 border-bottom d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3" style={{ transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(0,0,0,0.02))'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <div style={{ flex: '2 1 0', width: '100%' }} className="d-flex align-items-center gap-3">
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(108, 99, 255, 0.1)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {item.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="fw-semibold text-dark" style={{ fontSize: '0.95rem' }}>{item.name}</div>
                                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>ID: {item._id.substring(item._id.length - 6).toUpperCase()}</div>
                                        </div>
                                    </div>
                                    <div style={{ flex: '1.5 1 0', width: '100%' }}>
                                        <div className="d-flex align-items-center gap-2 text-dark" style={{ fontSize: '0.85rem' }}>
                                            <Mail size={14} className="text-muted" /> {item.email}
                                        </div>
                                        <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                                            <Phone size={14} /> {item.phone || 'Not Provided'}
                                        </div>
                                    </div>
                                    <div style={{ flex: '1 1 0', width: '100%' }}>
                                        <div className="d-flex align-items-center gap-2">
                                            <CalendarIcon size={14} className="text-muted" /> 
                                            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--primary-color)' }}>
                                                {getAssignedCount(item._id)} events signed up
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ flex: '0.5 1 0', width: '100%' }} className="d-flex justify-content-start justify-content-md-end gap-2 mt-2 mt-md-0">
                                        <button className="btn btn-light btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center" title="Delete User" onClick={() => handleDelete(item._id)}>
                                            <Trash size={16} className="text-danger" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
};

export default UserManagement;
