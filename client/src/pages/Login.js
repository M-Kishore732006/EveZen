import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const user = await login(email, password);
            if (user.role === 'Admin') navigate('/admin');
            else if (user.role === 'Faculty') navigate('/faculty');
            else if (user.role === 'Student') navigate('/student');
            else if (user.role === 'Supporting Staff') navigate('/staff');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Card style={{ width: '400px' }} className="p-4 shadow-sm border-0">
                <div className="text-center mb-4">
                    <h3 style={{ color: 'var(--primary-color)', fontWeight: 700 }}>EveZen</h3>
                    <p className="text-muted">Sign in to your account</p>
                </div>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control 
                            type="email" 
                            required 
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label>Password</Form.Label>
                        <div className="position-relative">
                            <Form.Control 
                                type={showPassword ? "text" : "password"} 
                                required 
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="position-absolute text-muted" onClick={() => setShowPassword(!showPassword)} style={{ right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
                                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                            </div>
                        </div>
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100 mb-3">
                        Sign In
                    </Button>
                </Form>
                <div className="text-center mt-3">
                    <span className="text-muted">Student? </span>
                    <Link to="/signup" style={{ color: 'var(--secondary-color)', textDecoration: 'none' }}>Create an account</Link>
                </div>
            </Card>
        </Container>
    );
};

export default Login;
