import React, { useEffect, useState } from 'react';
import api from '../../api';
import { LATAM_PREFIXES, getPhonePrefix, getPhoneNumber } from '../../utils/phonePrefixes';
import CountryCodeSelector from '../common/CountryCodeSelector';

const CompanySettings = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        rut: '',
        email: '',
        telefono: '',
        direccion: '',
        impuesto_defecto: 19,
        whatsapp_enabled: false,
        whatsapp_provider: '',
        whatsapp_account_sid: '',
        whatsapp_auth_token: '',
        whatsapp_from_number: ''
    });
    const [loading, setLoading] = useState(true);
    const [decimalError, setDecimalError] = useState('');
    const empresaId = localStorage.getItem('empresa_id');

    useEffect(() => {
        if (empresaId) {
            fetchCompanyData();
        }
    }, [empresaId]);

    const fetchCompanyData = async () => {
        try {
            const response = await api.get(`empresas/${empresaId}/`);
            setFormData(response.data);
            if (response.data.logo) {
                setLogoPreview(response.data.logo);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching company data', error);
            setLoading(false);
        }
    };

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const objectUrl = URL.createObjectURL(file);
            setLogoPreview(objectUrl);
        }
    };

    const handleResetColors = () => {
        if (window.confirm('¿Estás seguro de restablecer los colores por defecto?')) {
            setFormData({
                ...formData,
                color_menu_sidebar: '#1e1e1e',
                color_boton_principal: '#646cff',
                color_texto_principal: '#ffffff',
                color_fondo_pagina: '#121212',
                color_texto_secundario: '#b3b3b3',
                color_borde: 'rgba(255, 255, 255, 0.1)'
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.moneda_decimales > 4) {
            alert('El máximo son 4 decimales. Por favor corrija el valor.');
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            // Don't send 'logo' as string (existing URL) or null values
            if (key !== 'logo' && formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        if (logoFile) {
            data.append('logo', logoFile);
        }

        try {
            await api.put(`empresas/${empresaId}/`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Configuración actualizada exitosamente');
        } catch (error) {
            console.error('Error updating settings', error);
            alert('Error al actualizar la configuración');
        }
    };

    const handleDeleteCompany = async () => {
        if (window.confirm('¿ESTÁ SEGURO DE ELIMINAR ESTA EMPRESA?\n\nEsta acción es IRREVERSIBLE. Se eliminarán TODOS los datos de la empresa, productos, cotizaciones y este perfil de usuario.\n\nSi tiene otras empresas asociadas a este correo, NO se verán afectadas.')) {
            if (window.confirm('CONFIRMACIÓN FINAL: ¿Realmente desea eliminar la empresa permanentemente?')) {
                try {
                    await api.delete('api/delete-company/');
                    alert('Empresa eliminada correctamente.');
                    // Force logout to clean state
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('rol');
                    localStorage.removeItem('user_id');
                    localStorage.removeItem('empresa_id');
                    window.location.href = '/login';
                } catch (error) {
                    console.error(error);
                    alert('Error al eliminar: ' + (error.response?.data?.error || 'Error desconocido'));
                }
            }
        }
    };

    if (loading) return <p>Cargando...</p>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Configuración de Empresa</h2>
            <form onSubmit={handleSubmit}>
                <button type="submit" style={{ marginBottom: '20px', width: '100%', padding: '10px', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Guardar Cambios
                </button>
                <div>
                    <label>RUT:</label>
                    <input
                        type="text"
                        name="rut"
                        value={formData.rut}
                        disabled
                        style={{
                            width: '100%',
                            marginBottom: '10px',
                            backgroundColor: '#f5f5f5',
                            cursor: 'not-allowed',
                            color: '#666'
                        }}
                    />
                    <small style={{ color: '#666' }}>El RUT no se puede modificar</small>
                </div>
                <div>
                    <label>Nombre:</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required style={{ width: '100%', marginBottom: '10px' }} />
                </div>
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" value={formData.email || ''} onChange={handleChange} style={{ width: '100%', marginBottom: '10px' }} />
                </div>
                <div>
                    <label>Teléfono:</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <CountryCodeSelector
                            selectedPrefix={getPhonePrefix(formData.telefono)}
                            onSelect={(newPrefix) => {
                                const number = getPhoneNumber(formData.telefono);
                                handleChange({
                                    target: { name: 'telefono', value: newPrefix + number }
                                });
                            }}
                        />
                        <input
                            type="text"
                            name="telefono_number"
                            placeholder="912345678"
                            value={getPhoneNumber(formData.telefono)}
                            onChange={(e) => {
                                const newNumber = e.target.value;
                                const currentPrefix = getPhonePrefix(formData.telefono);

                                handleChange({
                                    target: { name: 'telefono', value: currentPrefix + newNumber }
                                });
                            }}
                            style={{
                                flex: 1,
                                marginBottom: '10px',
                                padding: '8px',
                                backgroundColor: '#2a2a2a', // Dark theme bg
                                border: '1px solid #444',
                                borderRadius: '4px',
                                color: 'white' // Text color
                            }}
                        />
                    </div>
                </div>
                <div>
                    <label>Dirección:</label>
                    <input type="text" name="direccion" value={formData.direccion || ''} onChange={handleChange} style={{ width: '100%', marginBottom: '10px' }} />
                </div>

                <hr />
                <h3>Logotipo</h3>
                <div style={{ marginBottom: '20px' }}>
                    {logoPreview && (
                        <div style={{ marginBottom: '10px' }}>
                            <img src={logoPreview} alt="Logo" style={{ maxHeight: '100px', objectFit: 'contain' }} />
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                    />
                    <small style={{ display: 'block', marginTop: '5px' }}>Se usará en los PDFs de las cotizaciones.</small>
                </div>

                <hr />
                <h3 style={{ marginTop: '20px', marginBottom: '20px' }}>Personalización de Colores</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px' }}>Color Menú Lateral:</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="color"
                                name="color_menu_sidebar"
                                value={formData.color_menu_sidebar || '#1e1e1e'}
                                onChange={handleChange}
                                style={{ width: '50px', height: '40px', padding: '0', border: 'none', cursor: 'pointer' }}
                            />
                            <input
                                type="text"
                                name="color_menu_sidebar"
                                value={formData.color_menu_sidebar || '#1e1e1e'}
                                onChange={handleChange}
                                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px' }}>Color Botón Principal:</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="color"
                                name="color_boton_principal"
                                value={formData.color_boton_principal || '#646cff'}
                                onChange={handleChange}
                                style={{ width: '50px', height: '40px', padding: '0', border: 'none', cursor: 'pointer' }}
                            />
                            <input
                                type="text"
                                name="color_boton_principal"
                                value={formData.color_boton_principal || '#646cff'}
                                onChange={handleChange}
                                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px' }}>Color Texto Principal:</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="color"
                                name="color_texto_principal"
                                value={formData.color_texto_principal || '#ffffff'}
                                onChange={handleChange}
                                style={{ width: '50px', height: '40px', padding: '0', border: 'none', cursor: 'pointer' }}
                            />
                            <input
                                type="text"
                                name="color_texto_principal"
                                value={formData.color_texto_principal || '#ffffff'}
                                onChange={handleChange}
                                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px' }}>Color Fondo Página:</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="color"
                                name="color_fondo_pagina"
                                value={formData.color_fondo_pagina || '#121212'}
                                onChange={handleChange}
                                style={{ width: '50px', height: '40px', padding: '0', border: 'none', cursor: 'pointer' }}
                            />
                            <input
                                type="text"
                                name="color_fondo_pagina"
                                value={formData.color_fondo_pagina || '#121212'}
                                onChange={handleChange}
                                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100px' }}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px' }}>Color Texto Secundario:</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="color"
                                name="color_texto_secundario"
                                value={formData.color_texto_secundario || '#b3b3b3'}
                                onChange={handleChange}
                                style={{ width: '50px', height: '40px', padding: '0', border: 'none', cursor: 'pointer' }}
                            />
                            <input
                                type="text"
                                name="color_texto_secundario"
                                value={formData.color_texto_secundario || '#b3b3b3'}
                                onChange={handleChange}
                                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px' }}>Color Bordes:</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="color"
                                name="color_borde"
                                value={formData.color_borde && formData.color_borde.startsWith('#') ? formData.color_borde : '#ffffff'}
                                onChange={handleChange}
                                style={{ width: '50px', height: '40px', padding: '0', border: 'none', cursor: 'pointer' }}
                            />
                            <input
                                type="text"
                                name="color_borde"
                                value={formData.color_borde || 'rgba(255, 255, 255, 0.1)'}
                                onChange={handleChange}
                                placeholder="Ej: #333 o rgba(0,0,0,0.1)"
                                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '200px' }}
                            />
                        </div>

                    </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <button type="button" onClick={handleResetColors} style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer' }}>
                        Restablecer Colores por Defecto
                    </button>
                </div>



                <hr />
                <h3>Valores por Defecto</h3>
                <div>
                    <label>Impuesto (IVA) %:</label>
                    <input type="number" name="impuesto_defecto" value={formData.impuesto_defecto} onChange={handleChange} required style={{ width: '100%', marginBottom: '10px' }} />
                    <small>Este valor se usará automáticamente al crear nuevos productos.</small>
                </div>

                <hr />
                <h3>Configuración de Moneda</h3>

                <div style={{ marginBottom: '10px' }}>
                    <label>Seleccionar Moneda:</label>
                    <select
                        name="currency_select"
                        value={formData.moneda_codigo || 'CLP'}
                        onChange={(e) => {
                            const code = e.target.value;
                            let symbol = '$';
                            let decimals = 0;

                            switch (code) {
                                case 'CLP': symbol = '$'; decimals = 0; break;
                                case 'USD': symbol = '$'; decimals = 2; break;
                                case 'EUR': symbol = '€'; decimals = 2; break;
                                case 'UF': symbol = 'UF'; decimals = 2; break;
                                default: symbol = '$'; decimals = 0;
                            }

                            setFormData({
                                ...formData,
                                moneda_codigo: code,
                                moneda_simbolo: symbol,
                                moneda_decimales: decimals
                            });
                        }}
                        style={{ width: '100%', marginBottom: '10px' }}
                    >
                        <option value="CLP">Peso Chileno (CLP)</option>
                        <option value="USD">Dólar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                        <option value="UF">Unidad de Fomento (UF)</option>
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '10px' }}>
                    <div>
                        <label>Símbolo:</label>
                        <input type="text" name="moneda_simbolo" value={formData.moneda_simbolo || '$'} onChange={handleChange} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label>Decimales:</label>
                        <input
                            type="number"
                            name="moneda_decimales"
                            value={formData.moneda_decimales !== undefined ? formData.moneda_decimales : 0}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                if (val > 4) {
                                    setDecimalError('El máximo son 4 decimales');
                                } else {
                                    setDecimalError('');
                                }
                                handleChange(e);
                            }}
                            style={{ width: '100%' }}
                        />
                        {decimalError && <small style={{ color: 'red', display: 'block', marginTop: '5px' }}>{decimalError}</small>}
                    </div>
                </div>

                <hr />
                <h3>WhatsApp Business API (Opcional)</h3>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            name="whatsapp_enabled"
                            checked={formData.whatsapp_enabled || false}
                            onChange={handleChange}
                        />
                        <span>Activar envío automático por WhatsApp</span>
                    </label>
                    <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                        Si está desactivado, se usará WhatsApp Web (gratis). Si lo activas, necesitas configurar credenciales de API (servicio pagado).
                    </small>
                </div>

                {formData.whatsapp_enabled && (
                    <>
                        <div>
                            <label>Proveedor:</label>
                            <select name="whatsapp_provider" value={formData.whatsapp_provider || ''} onChange={handleChange} style={{ width: '100%', marginBottom: '10px' }}>
                                <option value="">Seleccionar...</option>
                                <option value="twilio">Twilio</option>
                                <option value="360dialog">360dialog</option>
                                <option value="messagebird">MessageBird</option>
                            </select>
                        </div>
                        <div>
                            <label>Account SID:</label>
                            <input type="text" name="whatsapp_account_sid" value={formData.whatsapp_account_sid || ''} onChange={handleChange} style={{ width: '100%', marginBottom: '10px' }} />
                        </div>
                        <div>
                            <label>Auth Token:</label>
                            <input type="password" name="whatsapp_auth_token" value={formData.whatsapp_auth_token || ''} onChange={handleChange} style={{ width: '100%', marginBottom: '10px' }} />
                        </div>
                        <div>
                            <label>Número WhatsApp (formato: +56912345678):</label>
                            <input type="text" name="whatsapp_from_number" value={formData.whatsapp_from_number || ''} onChange={handleChange} placeholder="+56912345678" style={{ width: '100%', marginBottom: '10px' }} />
                        </div>
                    </>
                )}


            </form>

            <hr style={{ margin: '40px 0' }} />

            <ImpuestosManager />

            <hr style={{ margin: '40px 0' }} />
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <button
                    type="button"
                    onClick={handleDeleteCompany}
                    style={{
                        backgroundColor: '#ff4d4f',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        width: '100%',
                        maxWidth: '300px'
                    }}
                >
                    ⚠️ ELIMINAR EMPRESA
                </button>
                <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '10px' }}>
                    Esta acción eliminará el perfil actual y todos los datos de la empresa.
                </p>
            </div>
        </div>
    );
};

const ImpuestosManager = () => {
    const [taxes, setTaxes] = useState([]);
    const [newTax, setNewTax] = useState({ nombre: '', valor: '', tipo: 'PORCENTAJE' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTaxes();
    }, []);

    const fetchTaxes = async () => {
        try {
            const res = await api.get('impuestos/');
            setTaxes(res.data.results || res.data);
        } catch (error) {
            console.error('Error fetching taxes', error);
        }
    };

    const handleAddTax = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('impuestos/', newTax);
            setNewTax({ nombre: '', valor: '', tipo: 'PORCENTAJE' });
            fetchTaxes();
        } catch (error) {
            console.error('Error creating tax', error);
            alert('Error al crear impuesto');
        }
        setLoading(false);
    };

    const handleDeleteTax = async (id) => {
        if (!window.confirm('¿Eliminar este impuesto?')) return;
        try {
            await api.delete(`impuestos/${id}/`);
            fetchTaxes();
        } catch (error) {
            console.error('Error deleting tax', error);
        }
    };

    return (
        <div>
            <h3>Gestión de Impuestos Adicionales</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Crea impuestos personalizados (ej: ILA, Impuesto al Lujo) para aplicarlos a tus productos.</p>

            <form onSubmit={handleAddTax} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Nombre</label>
                    <input
                        required
                        placeholder="Ej: ILA Bebidas"
                        value={newTax.nombre}
                        onChange={e => setNewTax({ ...newTax, nombre: e.target.value })}
                        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Valor</label>
                    <input
                        required
                        type="number"
                        step="0.01"
                        placeholder="10"
                        value={newTax.valor}
                        onChange={e => setNewTax({ ...newTax, valor: e.target.value })}
                        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '80px' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Tipo</label>
                    <select
                        value={newTax.tipo}
                        onChange={e => setNewTax({ ...newTax, tipo: e.target.value })}
                        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                        <option value="PORCENTAJE">Porcentaje (%)</option>
                        <option value="FIJO">Monto Fijo ($)</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Aplicación</label>
                    <select
                        value={newTax.aplicacion || 'NETO'}
                        onChange={e => setNewTax({ ...newTax, aplicacion: e.target.value })}
                        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                        <option value="NETO">Sobre Neto</option>
                        <option value="TOTAL">Sobre Total (con IVA)</option>
                    </select>
                </div>
                <button type="submit" disabled={loading} style={{ padding: '8px 16px', height: '35px' }}>
                    {loading ? 'Agregando...' : '+ Agregar'}
                </button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                    <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Nombre</th>
                        <th style={{ padding: '10px' }}>Valor</th>
                        <th style={{ padding: '10px' }}>Tipo</th>
                        <th style={{ padding: '10px' }}>Aplicación</th>
                        <th style={{ padding: '10px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {taxes.length === 0 ? (
                        <tr><td colSpan="5" style={{ padding: '10px', textAlign: 'center', color: '#888' }}>No hay impuestos adicionales creados.</td></tr>
                    ) : (
                        taxes.map(tax => (
                            <tr key={tax.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{tax.nombre}</td>
                                <td style={{ padding: '10px' }}>{tax.valor}</td>
                                <td style={{ padding: '10px' }}>{tax.tipo === 'PORCENTAJE' ? '%' : '$'}</td>
                                <td style={{ padding: '10px' }}>{tax.aplicacion === 'TOTAL' ? 'Sobre Total' : 'Sobre Neto'}</td>
                                <td style={{ padding: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteTax(tax.id)}
                                        style={{ background: '#ff4d4f', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CompanySettings;
