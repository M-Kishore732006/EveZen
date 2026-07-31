import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { QrCode, ShieldAlert, RefreshCw, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MyQR = () => {
    const [timer, setTimer] = useState(60);
    const [qrSalt, setQrSalt] = useState(Date.now());
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Simulate an actively registered event context
    const eventName = "Annual Tech Symposium 2026";
    const teamName = "Cyber Ninjas";

    useEffect(() => {
        let interval = setInterval(() => {
            setTimer((prev) => {
                if (prev === 1) {
                    generateNewQR();
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const generateNewQR = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setQrSalt(Date.now());
            setIsRefreshing(false);
            setTimer(60);
        }, 800); // Visual delay for the spinning loader
    };

    const formattedTime = `00:${timer < 10 ? `0${timer}` : timer}`;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-100 d-flex flex-column align-items-center justify-content-center">
            
            <div className="text-center mb-4">
                <h3 style={{ fontWeight: 700, color: 'var(--primary-color)' }}>Authentication QR</h3>
                <p className="text-muted mb-0">Present this dynamic code at venue entry checkpoints.</p>
            </div>

            <Card className="border-0 shadow position-relative p-0 overflow-hidden" style={{ width: '100%', maxWidth: '420px', borderRadius: '24px' }}>
                <div style={{ height: '80px', background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)' }} className="d-flex align-items-center justify-content-center">
                    <Ticket className="text-white opacity-50" size={30}/>
                </div>
                
                <div className="p-5 text-center mt-n4 position-relative">
                    <AnimatePresence mode="wait">
                        {isRefreshing ? (
                            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto bg-light rounded-4 d-flex flex-column align-items-center justify-content-center border shadow-sm" style={{ width: '250px', height: '250px' }}>
                                <RefreshCw className="text-primary mb-3" size={40} style={{ animation: 'spin 1s linear infinite' }}/>
                                <p className="text-muted fw-bold small">Generating Secure QR...</p>
                                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                            </motion.div>
                        ) : (
                            <motion.div key="qr" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="mx-auto bg-white rounded-4 p-3 border shadow-sm" style={{ width: '250px', height: '250px' }}>
                                {/* Using free public API for QR generation placeholder with salt to destroy cache */}
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=EveZen-${qrSalt}`} alt="Dynamic QR" className="img-fluid rounded" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <h5 className="fw-bold text-dark mt-4 mb-1">{eventName}</h5>
                    <p className="text-muted small mb-0">{teamName}</p>
                    
                    <div className="d-flex justify-content-center align-items-center gap-2 mt-4 text-primary fw-bold" style={{ fontSize: '1.5rem', fontVariantNumeric: 'tabular-nums' }}>
                        <ClockIcon /> {formattedTime}
                    </div>
                </div>

                <div className="bg-light p-3 text-center d-flex align-items-start gap-2 text-start border-top">
                    <ShieldAlert size={24} className="text-warning flex-shrink-0" style={{ marginTop: '2px' }}/>
                    <p className="text-muted small mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>
                        <strong>Strict Security Enabled.</strong> For security purposes, this dynamic cryptographic QR changes every 60 seconds. Screenshots or previously generated codes will absolutely not be accepted at entry.
                    </p>
                </div>
            </Card>

            <Button variant="outline-primary" className="mt-4 rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm bg-white" onClick={generateNewQR} disabled={isRefreshing}>
                <RefreshCw size={16}/> Force Generate New QR
            </Button>
            
        </motion.div>
    );
};

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-timer"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg>
);

export default MyQR;
