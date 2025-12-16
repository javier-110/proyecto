import React, { useEffect, useState } from 'react';
import api from '../../api';
import { formatCurrency } from '../../utils/formatCurrency';

const CompanyDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [companySettings, setCompanySettings] = useState(null);

    const months = [
        { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
        { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
        { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
        { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
    ];

    const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

    useEffect(() => {
        const fetchCompanySettings = async () => {
            const empresaId = localStorage.getItem('empresa_id');
            if (empresaId) {
                try {
                    const res = await api.get(`empresas/${empresaId}/`);
                    setCompanySettings(res.data);
                } catch (err) {
                    console.error(err);
                }
            }
        };
        fetchCompanySettings();
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await api.get(`dashboard/stats/?month=${selectedMonth}&year=${selectedYear}`);
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [selectedMonth, selectedYear]);

    const handleDownloadReport = async () => {
        try {
            const response = await api.get(`dashboard/export_csv/?month=${selectedMonth}&year=${selectedYear}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Generate filename: "cotizaciones-mes-año.csv"
            const monthName = months.find(m => m.value === parseInt(selectedMonth))?.label.toLowerCase() || 'mes';
            const fileName = `cotizaciones-${monthName}-${selectedYear}.csv`;

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error downloading report', error);
            alert('Error al descargar el reporte');
        }
    };

    if (loading && !stats) return <p>Cargando estadísticas...</p>; // Allow loading state while showing old data if preferred, but simple loading for now
    if (!stats && !loading) return <p>No se pudieron cargar las estadísticas.</p>;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
                <h2>Panel de Control</h2>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        style={{ padding: '8px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#2d2d2d', color: 'white' }}
                    >
                        {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>

                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        style={{ padding: '8px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#2d2d2d', color: 'white' }}
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>

                    <button onClick={handleDownloadReport} style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '10px 15px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}>
                        Descargar Excel/CSV
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Actualizando datos...</p>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div style={cardStyle}>
                            <h3>Ventas Totales</h3>
                            <p style={numberStyle}>{formatCurrency(stats.total_ventas || 0, companySettings)}</p>
                        </div>
                        <div style={cardStyle}>
                            <h3>Cotizaciones Activas</h3>
                            <p style={numberStyle}>{stats.cotizaciones_activas}</p>
                        </div>
                        <div style={cardStyle}>
                            <h3>Aceptadas</h3>
                            <p style={{ ...numberStyle, color: '#52c41a' }}>{stats.cotizaciones_aceptadas}</p>
                        </div>
                        <div style={cardStyle}>
                            <h3>Rechazadas</h3>
                            <p style={{ ...numberStyle, color: '#ff4d4f' }}>{stats.cotizaciones_rechazadas}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                        <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px' }}>
                            <h3>Últimas Ventas ({months.find(m => m.value == selectedMonth)?.label} {selectedYear})</h3>
                            {stats.ultimas_ventas && stats.ultimas_ventas.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                                            <th style={{ padding: '10px' }}>Fecha</th>
                                            <th style={{ padding: '10px' }}>Cliente</th>
                                            <th style={{ padding: '10px' }}>Vendedor</th>
                                            <th style={{ padding: '10px' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.ultimas_ventas.map(venta => (
                                            <tr key={venta.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                                <td style={{ padding: '10px' }}>{venta.fecha}</td>
                                                <td style={{ padding: '10px' }}>{venta.cliente}</td>
                                                <td style={{ padding: '10px' }}>
                                                    {venta.vendedor_rol === 'TRABAJADOR' ? venta.vendedor : <span style={{ color: '#aaa' }}>-</span>}
                                                </td>
                                                <td style={{ padding: '10px' }}>{formatCurrency(venta.total, companySettings)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No hay ventas registradas en este periodo.</p>
                            )}
                        </div>
                    </div>
                </>
            )}
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
    color: '#1890ff'
};

export default CompanyDashboard;
