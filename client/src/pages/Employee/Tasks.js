import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Card, Button, ProgressBar } from 'react-bootstrap';
import { ClipboardCheck, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const EmployeeTasks = () => {
    const { user } = useContext(AuthContext);

    // Mock initial tasks based on the prompt's examples since there is no backend for tasks.
    const initialTasks = user?.workType === 'Cleaner' ? [
        { id: 1, text: 'Hall Cleaned and Swept', status: 'Pending' },
        { id: 2, text: 'Seating Arranged', status: 'Pending' },
        { id: 3, text: 'Dustbins Placed and Emptied', status: 'Pending' }
    ] : [
        { id: 1, text: 'Projector Checked and Aligned', status: 'Pending' },
        { id: 2, text: 'Internet Connectivity Working', status: 'Pending' },
        { id: 3, text: 'Audio and Mics Tested', status: 'Pending' }
    ];

    const [tasks, setTasks] = useState(initialTasks);

    const toggleTask = (taskId, act) => {
        setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
                if (act === 'start') return { ...t, status: 'In Progress' };
                if (act === 'finish') return { ...t, status: 'Completed' };
                if (act === 'reset') return { ...t, status: 'Pending' };
            }
            return t;
        }));
    };

    const completedCount = tasks.filter(t => t.status === 'Completed').length;
    const progress = (completedCount / tasks.length) * 100;

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--primary-color)' }}>Operational Checklist</h3>
                    <p className="text-muted mb-0">Manage your specific workspace setup tasks for Annual Tech Symposium 2026.</p>
                </div>
                <div className="text-end">
                    <p className="fw-bold mb-1" style={{ color: 'var(--primary-color)' }}>{completedCount} of {tasks.length} Completed</p>
                    <ProgressBar now={progress} variant={progress === 100 ? "success" : "primary"} style={{ width: '200px', height: '8px' }} />
                </div>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden flex-grow-1 p-0">
                <div className="bg-light px-4 py-3 d-flex" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <div style={{ flex: '3 1 0' }}>Task Description</div>
                    <div style={{ flex: '1 1 0' }}>Current Status</div>
                    <div style={{ flex: '2 1 0', textAlign: 'right' }}>Action</div>
                </div>

                <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-2">
                    {tasks.map(task => (
                        <motion.div variants={itemVariants} key={task.id} className="mx-2 my-2 rounded-4 p-4 d-flex align-items-center bg-white shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.04)' }}>
                            <div style={{ flex: '3 1 0' }} className="d-flex align-items-center gap-3">
                                {task.status === 'Completed' ? <CheckCircle2 size={24} className="text-success flex-shrink-0" /> : 
                                 task.status === 'In Progress' ? <ClipboardCheck size={24} className="text-primary flex-shrink-0" /> : 
                                 <Circle size={24} className="text-muted opacity-50 flex-shrink-0" />}
                                
                                <span className={`fw-bold ${task.status === 'Completed' ? 'text-muted text-decoration-line-through' : 'text-dark'}`} style={{ fontSize: '1.1rem' }}>
                                    {task.text}
                                </span>
                            </div>
                            <div style={{ flex: '1 1 0' }}>
                                <span className={`fw-bold d-flex align-items-center gap-1 ${task.status === 'Completed' ? 'text-success' : task.status === 'In Progress' ? 'text-primary' : 'text-muted'}`}>
                                    {task.status === 'In Progress' && <AlertCircle size={14} className="text-primary"/>}{task.status}
                                </span>
                            </div>
                            <div style={{ flex: '2 1 0', textAlign: 'right' }} className="d-flex justify-content-end gap-2">
                                {task.status === 'Pending' && (
                                    <Button variant="outline-primary" className="rounded-pill px-4 fw-medium" onClick={() => toggleTask(task.id, 'start')}>Start Task</Button>
                                )}
                                {task.status === 'In Progress' && (
                                    <>
                                        <Button variant="light" className="rounded-pill px-4 fw-medium text-muted border shadow-sm" onClick={() => toggleTask(task.id, 'reset')}>Cancel</Button>
                                        <Button variant="primary" className="rounded-pill px-4 fw-medium shadow-sm d-flex align-items-center" onClick={() => toggleTask(task.id, 'finish')}><CheckCircle2 size={16} className="me-2"/> Mark Complete</Button>
                                    </>
                                )}
                                {task.status === 'Completed' && (
                                    <Button variant="light" className="rounded-pill px-4 fw-medium text-muted border shadow-sm" onClick={() => toggleTask(task.id, 'reset')}>Undo</Button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {progress === 100 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="m-4 mt-2 p-4 bg-success bg-opacity-10 text-success rounded-4 d-flex align-items-center justify-content-center gap-3 border shadow-sm" style={{ borderColor: 'rgba(16, 185, 129, 0.2) !important' }}>
                        <CheckCircle2 size={30} />
                        <div>
                            <h5 className="fw-bold mb-1 text-success">All Operations Completed!</h5>
                            <p className="mb-0 small fw-medium">Great job! You have fully prepared your section for the event.</p>
                        </div>
                    </motion.div>
                )}
            </Card>
        </motion.div>
    );
};

export default EmployeeTasks;
