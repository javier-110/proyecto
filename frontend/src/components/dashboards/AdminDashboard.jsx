import React, { useEffect, useState } from 'react';
import api from '../../api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('dashboard/stats/');
                setStats(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard stats', error);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <p>Cargando estadísticas...</p>;
    if (!stats) return <p>No se pudieron cargar las estadísticas.</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Panel de Administrador</h2>
            <p>Visión general del sistema.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={cardStyle}>
                    <h3>Total Empresas</h3>
                    <p style={numberStyle}>{stats.total_empresas}</p>
                </div>
                <div style={cardStyle}>
                    <h3>Total Usuarios</h3>
                    <p style={numberStyle}>{stats.total_usuarios}</p>
                </div>
                <div style={cardStyle}>
                    <h3>Total Cotizaciones</h3>
                    <p style={numberStyle}>{stats.total_cotizaciones}</p>
                </div>
                <div style={cardStyle}>
                    <h3>Ventas Globales</h3>
                    <p style={{ ...numberStyle, color: '#52c41a' }}>${(stats.total_ventas_global || 0).toLocaleString('es-CL')}</p>
                </div>
            </div>

            <h3 style={{ marginBottom: '15px' }}>Actividad Reciente</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ ...cardStyle, textAlign: 'left' }}>
                    <h4 style={{ marginBottom: '15px', color: '#9089fc' }}>Últimas Cotizaciones</h4>
                    {stats.ultimas_cotizaciones_global && stats.ultimas_cotizaciones_global.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>Info</th>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.ultimas_cotizaciones_global.map(q => (
                                    <tr key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '8px' }}>
                                            <div style={{ fontWeight: 'bold' }}>#{q.id} <span style={{ fontSize: '0.85em', color: '#aaa' }}> - {q.fecha}</span></div>
                                            <small style={{ color: '#52c41a' }}>{q.empresa}</small>
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            ${(q.total || 0).toLocaleString('es-CL')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p>No hay cotizaciones recientes.</p>}
                </div>

                <div style={{ ...cardStyle, textAlign: 'left' }}>
                    <h4 style={{ marginBottom: '15px', color: '#9089fc' }}>Últimos Usuarios</h4>
                    {stats.ultimos_usuarios && stats.ultimos_usuarios.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>Usuario</th>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>Rol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.ultimos_usuarios.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '8px' }}>
                                            <div>{u.username}</div>
                                            <small style={{ color: '#aaa' }}>{u.empresa}</small>
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                background: u.rol === 'ADMIN' ? 'rgba(255, 77, 79, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                                                color: u.rol === 'ADMIN' ? '#ff4d4f' : '#4caf50',
                                                fontSize: '0.8rem'
                                            }}>
                                                {u.rol}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p>No hay registros recientes.</p>}
                </div>
            </div>
        </div>
    );
};

const cardStyle = {
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#1e1e1e',
    textAlign: 'center',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.1)'
};

const numberStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '10px 0 0 0',
    color: '#722ed1'
};

export default AdminDashboard;
