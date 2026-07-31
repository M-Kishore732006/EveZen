import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const { signup } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords must match');
        }
        try {
            await signup({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });
            navigate('/student');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', padding: '2rem 0' }}>
            <Card style={{ width: '450px' }} className="p-4 shadow-sm border-0">
                <div className="text-center mb-4">
                    <h3 style={{ color: 'var(--primary-color)', fontWeight: 700 }}>EveZen</h3>
                    <p className="text-muted">Student Registration</p>
                </div>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control type="text" name="name" required value={formData.name} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control type="email" name="email" required value={formData.email} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control type="text" name="phone" required value={formData.phone} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" name="password" required value={formData.password} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100 mb-3">
                        Register Account
                    </Button>
                </Form>
                <div className="text-center mt-3">
                    <span className="text-muted">Already have an account? </span>
                    <Link to="/login" style={{ color: 'var(--secondary-color)', textDecoration: 'none' }}>Sign In</Link>
                </div>
            </Card>
        </Container>
    );
};

export default Signup;
