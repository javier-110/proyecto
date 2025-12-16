import React, { useState } from 'react';

const ManualUsuario = () => {
    const [activeSection, setActiveSection] = useState('intro');
    const role = localStorage.getItem('rol');

    const allSections = {
        intro: {
            title: 'Bienvenido al Manual de Usuario',
            content: (
                <div>
                    <p>Bienvenido al Sistema de Cotización Automatizada de Admi. Esta plataforma le permite gestionar sus productos/servicios, clientes y cotizaciones de manera centralizada.</p>
                    <p>Utilice el menú de la izquierda para navegar por las diferentes secciones de este manual.</p>
                </div>
            )
        },
        productos: {
            title: 'Gestión de Productos/Servicios',
            content: (
                <div>
                    <h3>Gestión de Inventario</h3>
                    {role === 'EMPRESA' ? (
                        <>
                            <p>Como administrador, usted tiene control total sobre el catálogo:</p>
                            <ul>
                                <li><strong>Agregar:</strong> Use el botón "+ Nuevo Producto" para crear items.</li>
                                <li><strong>Editar/Eliminar:</strong> Modifique precios o stock directamente desde la lista.</li>
                            </ul>
                        </>
                    ) : (
                        <p>Puede visualizar el catálogo completo de productos/servicios disponibles para agregar a las cotizaciones.</p>
                    )}
                </div>
            )
        },
        ofertas: {
            title: 'Gestión de Ofertas',
            content: (
                <div>
                    <h3>Ofertas Especiales</h3>
                    <p>Configure descuentos temporales para productos específicos.</p>
                    <ol>
                        <li>Seleccione un producto.</li>
                        <li>Defina el porcentaje de descuento.</li>
                        <li>Establezca las fechas de vigencia.</li>
                    </ol>
                </div>
            )
        },
        clientes: {
            title: 'Gestión de Clientes',
            content: (
                <div>
                    <h3>Directorio de Clientes</h3>
                    <p>Administre la base de datos de clientes.</p>
                    <ul>
                        <li><strong>Crear:</strong> Registre nuevos clientes con sus datos de contacto.</li>
                        <li><strong>Historial:</strong> Revise cotizaciones anteriores por cliente.</li>
                    </ul>
                </div>
            )
        },
        trabajadores: {
            title: 'Gestión de Trabajadores',
            content: (
                <div>
                    <h3>Equipo de Trabajo</h3>
                    <p>Administre el acceso de sus vendedores.</p>
                    <ul>
                        <li><strong>Crear Cuenta:</strong> Genere un usuario y contraseña para su vendedor.</li>
                        <li><strong>Revocar Acceso:</strong> Elimine o desactive cuentas si un empleado deja la empresa.</li>
                    </ul>
                </div>
            )
        },
        cotizaciones: {
            title: 'Generar Cotizaciones',
            content: (
                <div>
                    <h3>Flujo de Cotización</h3>
                    <ol>
                        <li>Navegue a <strong>Crear Cotización</strong>.</li>
                        <li>Seleccione un cliente y agregue productos.</li>
                        <li><strong>Guardar:</strong> Se genera un borrador.</li>
                        <li><strong>Enviar:</strong> Puede enviar por Email o WhatsApp directamente desde el detalle.</li>
                    </ol>
                </div>
            )
        },
        promociones: {
            title: 'Fidelización',
            content: (
                <div>
                    <h3>Promociones Automáticas</h3>
                    <p>Configure el sistema para enviar correos de "Te extrañamos" a clientes inactivos, ofreciendo descuentos en productos al azar.</p>
                </div>
            )
        },
        configuracion: {
            title: 'Configuración',
            content: (
                <div>
                    <h3>Ajustes de Empresa</h3>
                    <ul>
                        <li><strong>Identidad:</strong> Suba su Logo y defina los colores corporativos.</li>
                        <li><strong>Integraciones:</strong> Configure las llaves de API para WhatsApp y Correo.</li>
                    </ul>
                </div>
            )
        },
        estados: {
            title: 'Glosario de Estados',
            content: (
                <div>
                    <ul>
                        <li><span style={{ color: '#f0ad4e', fontWeight: 'bold' }}>BORRADOR</span>: En edición.</li>
                        <li><span style={{ color: '#5bc0de', fontWeight: 'bold' }}>ENVIADA</span>: Entregada al cliente.</li>
                        <li><span style={{ color: '#0275d8', fontWeight: 'bold' }}>ABIERTA</span>: El cliente la vio.</li>
                        <li><span style={{ color: '#5cb85c', fontWeight: 'bold' }}>ACEPTADA</span>: Venta cerrada.</li>
                        <li><span style={{ color: '#d9534f', fontWeight: 'bold' }}>RECHAZADA</span>: Venta perdida.</li>
                    </ul>
                </div>
            )
        }
    };

    // FILTER SECTIONS BASED ON ROLE
    let allowedKeys = ['intro', 'clientes', 'cotizaciones', 'estados']; // Base for TRABAJADOR

    if (role === 'EMPRESA' || role === 'ADMIN') {
        allowedKeys = ['intro', 'productos', 'ofertas', 'clientes', 'trabajadores', 'cotizaciones', 'promociones', 'configuracion', 'estados'];
    }

    const sections = Object.keys(allSections)
        .filter(key => allowedKeys.includes(key))
        .reduce((obj, key) => {
            obj[key] = allSections[key];
            return obj;
        }, {});

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                Centro de Ayuda y Documentación {role && <span style={{ fontSize: '0.6em', color: 'var(--text-secondary)' }}>({role})</span>}
            </h2>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                <div style={{
                    flex: '1',
                    minWidth: '250px',
                    background: 'var(--bg-secondary)',
                    padding: '20px',
                    borderRadius: '8px',
                    height: 'fit-content'
                }}>
                    <h4 style={{ marginTop: 0 }}>Índice</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {Object.keys(sections).map(key => (
                            <li key={key} style={{ marginBottom: '10px' }}>
                                <button
                                    onClick={() => setActiveSection(key)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '10px',
                                        background: activeSection === key ? 'var(--accent-color)' : 'transparent',
                                        color: activeSection === key ? '#fff' : 'var(--text-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {sections[key].title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={{
                    flex: '3',
                    minWidth: '300px',
                    background: 'var(--bg-secondary)',
                    padding: '30px',
                    borderRadius: '8px',
                    lineHeight: '1.6'
                }}>
                    <h2 style={{ marginTop: 0, color: 'var(--accent-color)' }}>{sections[activeSection].title}</h2>
                    {sections[activeSection].content}
                </div>
            </div>
        </div>
    );
};

export default ManualUsuario;
