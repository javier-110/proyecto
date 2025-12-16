import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const CompanySwitcher = ({ currentCompanyName }) => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('rol');

    useEffect(() => {
        if (isOpen) {
            fetchCompanies();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [wrapperRef]);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const response = await api.get('api/user-companies/');
            setCompanies(response.data);
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSwitch = async (targetUserId) => {
        try {
            const response = await api.post('api/switch-company/', { user_id: targetUserId });

            // Update LocalStorage
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('rol', response.data.user.rol);
            localStorage.setItem('user_id', response.data.user.id);

            if (response.data.user.empresa_id) {
                localStorage.setItem('empresa_id', response.data.user.empresa_id);
            } else {
                localStorage.removeItem('empresa_id');
            }

            // Reload to apply changes (fresh state)
            window.location.reload();
        } catch (error) {
            console.error('Error switching company:', error);
            alert('Error al cambiar de empresa');
        }
    };

    const handleCreateCompany = async (e) => {
        e.preventDefault();
        setCreating(true);
        const formData = new FormData(e.target);
        const data = {
            nombre: formData.get('nombre'),
            rut: formData.get('rut'),
            telefono: formData.get('telefono'),
            direccion: formData.get('direccion'),
        };

        try {
            const response = await api.post('api/create-company-direct/', data);
            // Immediately switch to the new user/company
            if (response.data.user_id) {
                await handleSwitch(response.data.user_id);
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error creating company:', error);
            alert('Error al crear la empresa: ' + (error.response?.data?.error || 'Error desconocido'));
            setCreating(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('rol');
        localStorage.removeItem('user_id');
        localStorage.removeItem('empresa_id');
        navigate('/login');
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', marginBottom: '20px' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '10px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid var(--border-color, #333)'
                }}
            >
                <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Empresa Actual</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{currentCompanyName || 'Seleccionar...'}</strong>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>▼</span>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#1e1e1e', // Dark bg
                    border: '1px solid #444',
                    borderRadius: '8px',
                    marginTop: '5px',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    overflow: 'hidden'
                }}>
                    {loading ? (
                        <div style={{ padding: '10px', color: '#888', textAlign: 'center' }}>Cargando...</div>
                    ) : (
                        <>
                            {companies.map(c => (
                                <div
                                    key={c.user_id}
                                    onClick={() => !c.is_current && handleSwitch(c.user_id)}
                                    style={{
                                        padding: '10px',
                                        cursor: c.is_current ? 'default' : 'pointer',
                                        backgroundColor: c.is_current ? 'rgba(100, 108, 255, 0.1)' : 'transparent',
                                        color: c.is_current ? '#646cff' : '#ccc',
                                        borderBottom: '1px solid #333',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                    onMouseEnter={(e) => !c.is_current && (e.currentTarget.style.backgroundColor = '#2a2a2a')}
                                    onMouseLeave={(e) => !c.is_current && (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {c.empresa_logo && (
                                            <img
                                                src={`http://127.0.0.1:8000${c.empresa_logo}`}
                                                alt={c.empresa_nombre}
                                                style={{ height: '24px', maxWidth: '24px', objectFit: 'contain', borderRadius: '2px' }}
                                            />
                                        )}
                                        <span>{c.empresa_nombre}</span>
                                    </div>
                                    {c.is_current && <span style={{ fontSize: '0.8rem' }}>✓</span>}
                                </div>
                            ))}

                            {userRole !== 'TRABAJADOR' && (
                                <div
                                    onClick={() => setShowAddModal(true)}
                                    style={{
                                        padding: '12px',
                                        cursor: 'pointer',
                                        color: '#4caf50',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        backgroundColor: 'rgba(76, 175, 80, 0.1)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(76, 175, 80, 0.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(76, 175, 80, 0.1)'}
                                >
                                    + Nueva Empresa
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Modal for Direct Company Creation */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div className="card" style={{ width: '400px', padding: '30px', position: 'relative' }}>
                        <button
                            onClick={() => setShowAddModal(false)}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
                        >
                            ✕
                        </button>
                        <h3 style={{ marginTop: 0, textAlign: 'center' }}>Crear Nueva Empresa</h3>
                        <form onSubmit={handleCreateCompany} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label>Nombre Empresa *</label>
                                <input name="nombre" required placeholder="Ej: Mi Nueva Pyme" />
                            </div>
                            <div>
                                <label>RUT</label>
                                <input name="rut" placeholder="12.345.678-9" />
                            </div>
                            <div>
                                <label>Teléfono</label>
                                <input name="telefono" placeholder="+569..." />
                            </div>
                            <div>
                                <label>Dirección</label>
                                <input name="direccion" placeholder="Calle 123..." />
                            </div>
                            <button type="submit" disabled={creating} className="btn-primary" style={{ marginTop: '10px' }}>
                                {creating ? 'Creando...' : 'Crear y Cambiar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanySwitcher;
