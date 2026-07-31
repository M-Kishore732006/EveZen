import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Navbar, Nav, Button } from 'react-bootstrap';
import { LayoutDashboard, Calendar, MapPin, Users, LogOut } from 'lucide-react';

const AdminLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user || user.role !== 'Admin') {
        return <div className="p-5 text-center">UnAuthorized. <Button onClick={() => navigate('/login')}>Login</Button></div>;
    }

    return (
        <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
            <Navbar className="topbar px-4 py-3 d-flex justify-content-between align-items-center">
                <Navbar.Brand style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '1.5rem' }}>EveZen Admin</Navbar.Brand>
                <div className="d-flex align-items-center gap-3">
                    <span className="text-muted">Welcome, {user.name}</span>
                    <Button variant="outline-danger" size="sm" onClick={handleLogout} className="d-flex align-items-center gap-2">
                        <LogOut size={16} /> Logout
                    </Button>
                </div>
            </Navbar>
            <Container fluid>
                <Row>
                    <Col md={2} className="sidebar p-0 pt-4">
                        <Nav className="flex-column">
                            <NavLink to="/admin" end className="nav-link d-flex align-items-center gap-3">
                                <LayoutDashboard size={20} /> Dashboard
                            </NavLink>
                            <NavLink to="/admin/events" className="nav-link d-flex align-items-center gap-3">
                                <Calendar size={20} /> Event Management
                            </NavLink>
                            <NavLink to="/admin/venues" className="nav-link d-flex align-items-center gap-3">
                                <MapPin size={20} /> Venue Management
                            </NavLink>
                            <NavLink to="/admin/staff" className="nav-link d-flex align-items-center gap-3">
                                <Users size={20} /> Staff Management
                            </NavLink>
                        </Nav>
                    </Col>
                    <Col md={10} className="p-4" style={{ height: 'calc(100vh - 70px)', overflowY: 'auto' }}>
                        <Outlet />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AdminLayout;
