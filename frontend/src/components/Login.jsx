import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showCompanySelect, setShowCompanySelect] = useState(false);
    const [companies, setCompanies] = useState([]);
    const navigate = useNavigate();

    // Registration States
    const [showRegister, setShowRegister] = useState(false);
    const [regEmail, setRegEmail] = useState('');
    const [sendingCode, setSendingCode] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('token/', { username, password });

            // Temporary storage, will be final if only 1 company or current selected
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            if (response.data.rol) localStorage.setItem('rol', response.data.rol);
            if (response.data.user_id) localStorage.setItem('user_id', response.data.user_id);
            if (response.data.empresa_id) localStorage.setItem('empresa_id', response.data.empresa_id);

            // Check if multiple companies exist
            if (response.data.companies && response.data.companies.length > 1) {
                setCompanies(response.data.companies);
                setShowCompanySelect(true);
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Login failed', error);
            setError('Error al iniciar sesión: ' + (error.response?.data?.detail || 'Credenciales inválidas'));
        }
    };

    const handleSelectCompany = async (company) => {
        try {
            if (!company.is_current) {
                // Switch token
                const response = await api.post('api/switch-company/', { user_id: company.user_id });
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                localStorage.setItem('rol', response.data.user.rol);
                localStorage.setItem('user_id', response.data.user.id);
                if (response.data.user.empresa_id) {
                    localStorage.setItem('empresa_id', response.data.user.empresa_id);
                } else {
                    localStorage.removeItem('empresa_id');
                }
            }
            navigate('/dashboard');
        } catch (error) {
            console.error('Error switching:', error);
            setError('Error al seleccionar empresa');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setSendingCode(true);
        setError('');
        try {
            await api.post('invite-company/', { email: regEmail });
            alert(`Código enviado a ${regEmail}. Redirigiendo a validación...`);
            navigate('/validate-company', { state: { email: regEmail } });
        } catch (error) {
            console.error('Registration error', error);
            setError('Error al registrar: ' + (error.response?.data?.error || 'Error desconocido'));
        } finally {
            setSendingCode(false);
        }
    };

    if (showRegister) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
                <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '30px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Registro de Empresa</h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                        Ingresa tu correo para recibir un código de validación.
                    </p>
                    {error && <div className="error-message" style={{ marginBottom: '15px' }}>{error}</div>}
                    <form onSubmit={handleRegister}>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Correo Electrónico</label>
                            <input
                                type="email"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                required
                                placeholder="empresa@ejemplo.com"
                                style={{ width: '100%', padding: '10px' }}
                            />
                        </div>
                        <button type="submit" disabled={sendingCode} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                            {sendingCode ? 'Enviando...' : 'Enviar Código'}
                        </button>
                    </form>
                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                        <button onClick={() => setShowRegister(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            Volver al Inicio de Sesión
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (showCompanySelect) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: 'var(--bg-primary)'
            }}>
                <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '50px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Seleccione Empresa</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.1rem' }}>
                        Su correo está asociado a múltiples empresas.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {companies.map(c => (
                            <button
                                key={c.user_id}
                                onClick={() => handleSelectCompany(c)}
                                className="btn-secondary"
                                style={{
                                    padding: '20px',
                                    textAlign: 'left',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    {c.empresa_logo && (
                                        <img
                                            src={`http://127.0.0.1:8000${c.empresa_logo}`}
                                            alt={c.empresa_nombre}
                                            style={{ height: '50px', maxWidth: '50px', objectFit: 'contain', borderRadius: '4px' }}
                                        />
                                    )}
                                    <span style={{ fontWeight: '600', fontSize: '1.2rem' }}>{c.empresa_nombre}</span>
                                </div>
                                {c.is_current && <span style={{ fontSize: '1.2rem', color: 'var(--accent-color)' }}>✓</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: 'var(--bg-primary)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <h2 style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    fontSize: '2rem',
                    background: 'linear-gradient(to right, #646cff, #9089fc)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Bienvenido
                </h2>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(255, 77, 79, 0.1)',
                        color: 'var(--danger-color)',
                        padding: '10px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        textAlign: 'center',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Correo Electrónico</label>
                        <input
                            type="email"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="ejemplo@correo.com"
                        />
                    </div>
                    <div>
                        <label>Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                        <a href="/forgot-password" style={{ fontSize: '0.8rem', color: '#646cff', textDecoration: 'none' }}>
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>
                    <button type="submit" style={{ marginTop: '5px', padding: '12px' }}>
                        Ingresar
                    </button>
                </form>

                <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span>¿Eres una nueva empresa? </span>
                    <button
                        onClick={() => setShowRegister(true)}
                        style={{ background: 'none', border: 'none', color: '#646cff', cursor: 'pointer', fontWeight: 500, padding: 0, textDecoration: 'underline' }}
                    >
                        Registra tu empresa aquí
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
