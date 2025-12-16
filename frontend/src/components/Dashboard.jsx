import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import api from '../api';
import ProductList from './products/ProductList';
import ProductForm from './products/ProductForm';
import ClientList from './clients/ClientList';
import ClientForm from './clients/ClientForm';
import QuoteList from './quotes/QuoteList';
import QuoteForm from './quotes/QuoteForm';
import AdminDashboard from './dashboards/AdminDashboard';
import CompanyDashboard from './dashboards/CompanyDashboard';
import WorkerDashboard from './dashboards/WorkerDashboard';
import CompanyList from './companies/CompanyList';
import WorkerList from './workers/WorkerList';
import CompanySettings from './companies/CompanySettings';
import WorkerForm from './workers/WorkerForm';
import OffersManager from './offers/OffersManager';
import Promotions from './promotions/Promotions';
import ManualUsuario from './ManualUsuario';
import CompanySwitcher from './common/CompanySwitcher';

const Dashboard = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [logoUrl, setLogoUrl] = useState(null);

    useEffect(() => {
        const storedRole = localStorage.getItem('rol');
        if (storedRole) {
            setRole(storedRole);
        }

        // Fetch company name and logo
        const fetchCompanyData = async () => {
            const empresaId = localStorage.getItem('empresa_id');
            if (empresaId) {
                try {
                    const response = await api.get(`empresas/${empresaId}/`);
                    setCompanyName(response.data.nombre);
                    if (response.data.logo) {
                        setLogoUrl(response.data.logo);
                    }

                    // Apply company colors
                    const root = document.documentElement;
                    if (response.data.color_menu_sidebar) root.style.setProperty('--bg-secondary', response.data.color_menu_sidebar);
                    if (response.data.color_boton_principal) root.style.setProperty('--accent-color', response.data.color_boton_principal);
                    if (response.data.color_texto_principal) root.style.setProperty('--text-primary', response.data.color_texto_principal);
                    if (response.data.color_fondo_pagina) root.style.setProperty('--bg-primary', response.data.color_fondo_pagina);
                    if (response.data.color_texto_secundario) root.style.setProperty('--text-secondary', response.data.color_texto_secundario);
                    if (response.data.color_borde) root.style.setProperty('--border-color', response.data.color_borde);

                } catch (error) {
                    console.error('Error fetching company data', error);
                }
            }
        };
        fetchCompanyData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('rol');
        localStorage.removeItem('user_id');
        localStorage.removeItem('empresa_id');
        navigate('/login');
    };

    const renderDashboardHome = () => {
        switch (role) {
            case 'ADMIN':
                return <AdminDashboard />;
            case 'EMPRESA':
                return <CompanyDashboard />;
            case 'TRABAJADOR':
                return <WorkerDashboard />;
            default:
                return <h2>Bienvenido al Panel de Control</h2>;
        }
    };

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h3>Admi Cotizaciones</h3>
                    {companyName && (
                        <div style={{ marginTop: '10px' }}>
                            <CompanySwitcher currentCompanyName={companyName} />
                        </div>
                    )}
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li><Link to="/dashboard">Inicio</Link></li>
                        {role === 'ADMIN' && <li><Link to="/dashboard/empresas">Empresas</Link></li>}
                        {role === 'EMPRESA' && (
                            <>
                                <li><Link to="/dashboard/productos">Productos/Servicios</Link></li>
                                <li><Link to="/dashboard/ofertas">Ofertas</Link></li>
                                <li><Link to="/dashboard/clientes">Clientes</Link></li>
                                <li><Link to="/dashboard/trabajadores">Trabajadores</Link></li>
                                <li><Link to="/dashboard/cotizaciones">Cotizaciones</Link></li>
                                <li><Link to="/dashboard/cotizaciones/nueva">Crear Cotización</Link></li>
                                <li><Link to="/dashboard/promociones">Promociones</Link></li>
                                <li><Link to="/dashboard/configuracion">Configuración</Link></li>
                            </>
                        )}
                        {role === 'TRABAJADOR' && (
                            <>
                                <li><Link to="/dashboard/clientes">Clientes</Link></li>
                                <li><Link to="/dashboard/cotizaciones">Cotizaciones</Link></li>
                                <li><Link to="/dashboard/cotizaciones/nueva">Crear Cotización</Link></li>
                            </>
                        )}
                        <li style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                            <Link to="/dashboard/ayuda" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>?</span> Ayuda / Manual
                            </Link>
                        </li>
                    </ul>
                </nav>
                <div style={{ marginTop: 'auto' }}>
                    <button onClick={handleLogout} className="danger" style={{ width: '100%' }}>Cerrar Sesión</button>
                </div>
            </div>
            <div className="main-content">
                {logoUrl && (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', padding: '10px 20px 0 0' }}>
                        <img
                            src={logoUrl}
                            alt="Logo Empresa"
                            style={{
                                height: '40px',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
                            }}
                        />
                    </div>
                )}
                <Routes>
                    <Route path="/" element={renderDashboardHome()} />
                    <Route path="productos" element={<ProductList />} />
                    <Route path="productos/nuevo" element={<ProductForm />} />
                    <Route path="productos/editar/:id" element={<ProductForm />} />
                    <Route path="ofertas" element={<OffersManager />} />
                    <Route path="clientes" element={<ClientList />} />
                    <Route path="clientes/nuevo" element={<ClientForm />} />
                    <Route path="clientes/editar/:id" element={<ClientForm />} />
                    <Route path="cotizaciones" element={<QuoteList />} />
                    <Route path="cotizaciones/nueva" element={<QuoteForm />} />
                    <Route path="empresas" element={<CompanyList />} />
                    <Route path="trabajadores" element={<WorkerList />} />
                    <Route path="trabajadores/nuevo" element={<WorkerForm />} />
                    <Route path="trabajadores/nuevo" element={<WorkerForm />} />
                    <Route path="configuracion" element={<CompanySettings />} />
                    <Route path="promociones" element={<Promotions />} />
                    <Route path="ayuda" element={<ManualUsuario />} />
                </Routes>
            </div>
        </div>
    );
};

export default Dashboard;
