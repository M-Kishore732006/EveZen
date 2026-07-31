import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Compass, Ticket, QrCode, MessageSquare, User, Menu, Bell, Search, Moon, Sun, ChevronDown, LogOut } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';

const StudentLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [theme, setTheme] = useState(localStorage.getItem('evezen_theme') || 'light');

    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        localStorage.setItem('evezen_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user || user.role !== 'Student') {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
                <div className="text-center p-5 card">
                    <h3 className="mb-4">Unauthorized Access</h3>
                    <button className="btn btn-primary" onClick={() => navigate('/login')}>Return to Login</button>
                </div>
            </div>
        );
    }

    const navItems = [
        { path: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { path: '/student/browse', icon: Compass, label: 'Browse Events' },
        { path: '/student/registrations', icon: Ticket, label: 'My Registrations' },
        { path: '/student/qr', icon: QrCode, label: 'My QR' },
        { path: '/student/forums', icon: MessageSquare, label: 'Discussion Forums' },
        { path: '/student/profile', icon: User, label: 'Profile' }
    ];

    return (
        <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>
            <motion.div 
                initial={false}
                animate={{ width: sidebarOpen ? '260px' : '80px' }}
                style={{ backgroundColor: 'var(--card-bg)', borderRight: '1px solid var(--border-color, rgba(0,0,0,0.04))', display: 'flex', flexDirection: 'column', zIndex: 10 }}
                className="shadow-sm sidebar-panel"
            >
                <div className="p-4 d-flex align-items-center gap-3">
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>EZ</div>
                    {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary-color)' }}>EveZen</motion.span>}
                </div>
                
                <div className="flex-grow-1 px-3 py-4 mt-2">
                    <p className="text-muted mb-3 px-3" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', opacity: sidebarOpen ? 1 : 0 }}>Menu</p>
                    {navItems.map(item => (
                        <NavLink 
                            key={item.path} to={item.path} end={item.end}
                            className={({ isActive }) => `d-flex align-items-center gap-3 mb-2 px-3 py-2 ${isActive ? 'active-nav' : 'text-muted'}`}
                            style={({ isActive }) => ({
                                textDecoration: 'none', borderRadius: '12px',
                                backgroundColor: isActive ? 'var(--nav-active-bg, rgba(108, 99, 255, 0.08))' : 'transparent',
                                color: isActive ? 'var(--accent-color)' : 'var(--text-muted)',
                                fontWeight: isActive ? 600 : 500, transition: 'all 0.2s',
                                justifyContent: sidebarOpen ? 'flex-start' : 'center'
                            })}
                        >
                            <item.icon size={20} />
                            {sidebarOpen && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </div>
            </motion.div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <header className="px-5 py-3 d-flex justify-content-between align-items-center bg-white" style={{ borderBottom: '1px solid var(--border-color, rgba(0,0,0,0.04))' }}>
                    <div className="d-flex align-items-center gap-4 w-50">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-light p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <Menu size={20} className="text-muted" />
                        </button>
                        <div className="position-relative w-100" style={{ maxWidth: '400px' }}>
                            <Search size={18} className="position-absolute text-muted" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input type="text" className="form-control" placeholder="Search events, forums..." style={{ paddingLeft: '44px', borderRadius: '20px', backgroundColor: 'var(--bg-color)', border: 'none' }} />
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-4">
                        <button onClick={toggleTheme} className="btn btn-light p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                             {theme === 'dark' ? <Sun size={20} className="text-muted" /> : <Moon size={20} className="text-muted" />}
                        </button>
                        <button className="btn btn-light p-2 rounded-circle d-flex align-items-center justify-content-center position-relative" style={{ width: '40px', height: '40px' }}>
                            <Bell size={20} className="text-muted" />
                            <span className="position-absolute translate-middle p-1 bg-danger border border-light rounded-circle" style={{ top: '8px', right: '4px' }}></span>
                        </button>
                        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(0,0,0,0.1)' }}></div>
                        <Dropdown align="end">
                            <Dropdown.Toggle variant="link" className="text-decoration-none d-flex align-items-center gap-3 p-0 border-0 text-dark" id="dropdown-user">
                                <div className="text-end d-none d-md-block">
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Student</div>
                                </div>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{user.name.charAt(0).toUpperCase()}</div>
                                <ChevronDown size={16} className="text-muted" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow border-0 rounded-3 mt-3" style={{ minWidth: '200px' }}>
                                <Dropdown.Item className="d-flex align-items-center gap-2 py-2" onClick={() => navigate('/student/profile')}><User size={16}/> Profile</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={handleLogout} className="text-danger d-flex align-items-center gap-2 py-2"><LogOut size={16}/> Logout</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </header>

                <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }} className="p-5">
                    <AnimatePresence mode="wait">
                        <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ height: '100%' }}>
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
