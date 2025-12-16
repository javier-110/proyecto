import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const WorkerDashboard = () => {
    const [recentQuotes, setRecentQuotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentQuotes();
    }, []);

    const fetchRecentQuotes = async () => {
        try {
            const empresaId = localStorage.getItem('empresa_id');
            const response = await api.get('cotizaciones/', {
                params: {
                    empresa: empresaId,
                    limit: 5
                }
            });
            setRecentQuotes(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatMoney = (amount, currency = 'CLP') => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    return (
        <div style={{ color: 'var(--text-primary)' }}>
            <h2 style={{ marginBottom: '20px' }}>Panel de Trabajador</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}>
                    <h3>Nueva Cotización</h3>
                    <div style={{ fontSize: '3rem', margin: '10px 0', color: 'var(--accent-color)' }}>+</div>
                    <Link to="/dashboard/crear-cotizacion" className="btn-primary" style={{ display: 'inline-block', width: '100%', textDecoration: 'none' }}>
                        Crear Ahora
                    </Link>
                </div>

                <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                    <h3>Mis Cotizaciones</h3>
                    <div style={{ fontSize: '3rem', margin: '10px 0', color: '#4caf50' }}>📄</div>
                    <Link to="/dashboard/cotizaciones" className="btn-secondary" style={{ display: 'inline-block', width: '100%', textDecoration: 'none', border: '1px solid var(--border-color)' }}>
                        Ver Historial
                    </Link>
                </div>

                <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                    <h3>Clientes</h3>
                    <div style={{ fontSize: '3rem', margin: '10px 0', color: '#ff9800' }}>👥</div>
                    <Link to="/dashboard/clientes" className="btn-secondary" style={{ display: 'inline-block', width: '100%', textDecoration: 'none', border: '1px solid var(--border-color)' }}>
                        Ver Clientes
                    </Link>
                </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Últimas Cotizaciones</h3>
                {loading ? (
                    <p>Cargando...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>N° Cotización</th>
                                <th style={{ padding: '10px' }}>Cliente</th>
                                <th style={{ padding: '10px' }}>Fecha</th>
                                <th style={{ padding: '10px' }}>Total</th>
                                <th style={{ padding: '10px' }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentQuotes.length > 0 ? (
                                recentQuotes.map(quote => (
                                    <tr key={quote.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '10px' }}>#{quote.id}</td>
                                        <td style={{ padding: '10px' }}>{quote.cliente_nombre}</td>
                                        <td style={{ padding: '10px' }}>{formatDate(quote.fecha)}</td>
                                        <td style={{ padding: '10px' }}>{formatMoney(quote.total, quote.moneda)}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                background: quote.estado === 'APROBADA' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                                                color: quote.estado === 'APROBADA' ? '#4caf50' : '#ff9800'
                                            }}>
                                                {quote.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No hay cotizaciones recientes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default WorkerDashboard;
