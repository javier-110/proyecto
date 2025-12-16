import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const ResetPassword = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        try {
            await api.post('password-reset/confirm/', {
                uid: uid,
                token: token,
                password: password
            });
            setMessage('Contraseña restablecida exitosamente. Redirigiendo...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error(err);
            setError('Error al restablecer contraseña. El enlace puede haber expirado.');
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
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Nueva Contraseña</h2>

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

                {!message && (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Nueva Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                minLength={6}
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', marginTop: '5px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label>Confirmar Contraseña</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                minLength={6}
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', marginTop: '5px' }}
                            />
                        </div>
                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px' }}>
                            {loading ? 'Restableciendo...' : 'Guardar Contraseña'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
