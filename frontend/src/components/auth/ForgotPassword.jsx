import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const response = await api.post('password-reset/request/', { email });
            setMessage(response.data.message);
        } catch (err) {
            console.error(err);
            setError('Ocurrió un error. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: 'var(--bg-primary)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Recuperar Contraseña</h2>

                {message && (
                    <div style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', padding: '10px', borderRadius: '5px', marginBottom: '15px', color: '#52c41a' }}>
                        {message}
                    </div>
                )}

                {error && (
                    <div style={{ backgroundColor: '#fff2f0', border: '1px solid #ffccc7', padding: '10px', borderRadius: '5px', marginBottom: '15px', color: '#ff4d4f' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label>Ingresa tu correo electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="ejemplo@correo.com"
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', marginTop: '5px' }}
                        />
                    </div>
                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px' }}>
                        {loading ? 'Enviando...' : 'Enviar enlace'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Link to="/login">Volver al inicio de sesión</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
