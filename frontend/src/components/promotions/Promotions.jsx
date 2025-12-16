import React, { useState, useEffect } from 'react';
import api from '../../api';

const Promotions = () => {
    const [settings, setSettings] = useState({
        fidelizacion_activa: false,
        dias_para_fidelizacion: 30, // Also used as seconds in test mode
        dias_inicio_fidelizacion: 7, // New field
        descuento_fidelizacion: 5,
        mensaje_fidelizacion: ''
    });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const empresaId = localStorage.getItem('empresa_id');
            const [settingsRes, historyRes] = await Promise.all([
                api.get(`empresas/${empresaId}/`),
                api.get('promociones/')
            ]);

            setSettings({
                fidelizacion_activa: settingsRes.data.fidelizacion_activa,
                dias_para_fidelizacion: settingsRes.data.dias_para_fidelizacion,
                dias_inicio_fidelizacion: settingsRes.data.dias_inicio_fidelizacion || 7,
                descuento_fidelizacion: settingsRes.data.descuento_fidelizacion,
                mensaje_fidelizacion: settingsRes.data.mensaje_fidelizacion
            });

            // Handle pagination for history
            const historyData = historyRes.data.results ? historyRes.data.results : historyRes.data;
            setHistory(historyData);
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const empresaId = localStorage.getItem('empresa_id');
            await api.patch(`empresas/${empresaId}/`, settings);
            setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al guardar la configuración' });
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                Gestión de Promociones y Fidelización
            </h2>

            {message && (
                <div style={{
                    padding: '10px',
                    marginBottom: '20px',
                    borderRadius: '4px',
                    backgroundColor: message.type === 'success' ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)',
                    color: message.type === 'success' ? '#52c41a' : '#ff4d4f',
                    border: `1px solid ${message.type === 'success' ? '#52c41a' : '#ff4d4f'}`
                }}>
                    {message.text}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                {/* Configuration Column */}
                <div>
                    <h3 style={{ marginBottom: '20px' }}>Configuración Automática</h3>
                    <form onSubmit={handleSave} className="settings-form">
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <input
                                type="checkbox"
                                name="fidelizacion_activa"
                                checked={settings.fidelizacion_activa}
                                onChange={handleChange}
                                id="fid_active"
                                style={{ width: '20px', height: '20px' }}
                            />
                            <label htmlFor="fid_active" style={{ cursor: 'pointer' }}>
                                Activar envío automático de correos de fidelización
                            </label>
                        </div>

                        <div className="form-group">
                            <label>Inicio: Días después del registro para enviar (o Segundos en prueba):</label>
                            <input
                                type="number"
                                name="dias_inicio_fidelizacion"
                                value={settings.dias_inicio_fidelizacion}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>Frecuencia: Días entre cada correo (o Segundos en prueba):</label>
                            <input
                                type="number"
                                name="dias_para_fidelizacion"
                                value={settings.dias_para_fidelizacion}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>Descuento ofrecido (%):</label>
                            <input
                                type="number"
                                step="0.01"
                                name="descuento_fidelizacion"
                                value={settings.descuento_fidelizacion}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>Mensaje de introducción:</label>
                            <textarea
                                name="mensaje_fidelizacion"
                                value={settings.mensaje_fidelizacion}
                                onChange={handleChange}
                                className="form-control"
                                rows="4"
                                style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                            />
                            <small>Este mensaje aparecerá antes de la oferta del producto.</small>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                            Guardar Configuración
                        </button>
                    </form>
                </div>

                {/* History Column */}
                <div>
                    <h3 style={{ marginBottom: '20px' }}>Historial de Promociones Enviadas</h3>
                    <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', padding: '15px', borderRadius: '8px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Fecha</th>
                                    <th style={{ padding: '10px' }}>Cliente</th>
                                    <th style={{ padding: '10px' }}>Desc.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length > 0 ? (
                                    history.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '10px' }}>{new Date(item.fecha_envio).toLocaleDateString()} {new Date(item.fecha_envio).toLocaleTimeString()}</td>
                                            <td style={{ padding: '10px' }}>
                                                <div>{item.cliente_nombre}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.cliente_email}</div>
                                            </td>
                                            <td style={{ padding: '10px' }}>{item.descuento_ofrecido}%</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            No se han enviado promociones aún.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Promotions;
