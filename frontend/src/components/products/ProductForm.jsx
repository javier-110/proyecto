import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

const ProductForm = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        impuesto: 19,
        categoria: '',
        marca: '',
        stock: 0,
        empresa: '',
        impuesto_adicional: null, // Legacy support
        impuestos: [] // New Multi-Tax
    });
    const [precioConIVA, setPrecioConIVA] = useState('');
    const [showSpecificTax, setShowSpecificTax] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    const [companies, setCompanies] = useState([]);
    const [taxes, setTaxes] = useState([]);
    const role = localStorage.getItem('rol');

    useEffect(() => {
        if (id) {
            fetchProduct();
        } else {
            fetchCompanySettings();
        }
        if (role === 'ADMIN') {
            fetchCompanies();
        }
        fetchTaxes();
    }, [id, role]);

    const fetchTaxes = async () => {
        try {
            const res = await api.get('impuestos/');
            setTaxes(res.data.results || res.data);
        } catch (error) {
            console.error('Error fetching taxes', error);
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await api.get('empresas/');
            setCompanies(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching companies', error);
        }
    };

    const fetchCompanySettings = async () => {
        const empresaId = localStorage.getItem('empresa_id');
        if (empresaId) {
            try {
                const response = await api.get(`empresas/${empresaId}/`);
                setCompanies([response.data]); // Store company data for settings access

                setFormData(prev => ({
                    ...prev,
                    empresa: response.data.id,
                    impuesto: response.data.impuesto_defecto || prev.impuesto
                }));
            } catch (error) {
                console.error('Error fetching company settings', error);
            }
        }
    };

    const fetchProduct = async () => {
        try {
            const response = await api.get(`productos/${id}/`);
            const data = response.data;

            // Ensure company settings (decimals) are loaded
            let fetchedCompany = null;
            if (data.empresa) {
                try {
                    const compRes = await api.get(`empresas/${data.empresa}/`);
                    fetchedCompany = compRes.data;
                    setCompanies(prev => {
                        if (!prev.find(c => c.id === compRes.data.id)) {
                            return [...prev, compRes.data];
                        }
                        return prev;
                    });
                } catch (err) {
                    console.error('Error fetching product company', err);
                }
            }

            // Map M2M taxes
            let mappedTaxes = [];
            if (data.impuestos_details && Array.isArray(data.impuestos_details)) {
                mappedTaxes = data.impuestos_details.map(t => t.id);
            } else if (data.impuesto_adicional) {
                // Migration: If has legacy FK but no M2M (yet), use it
                mappedTaxes = [data.impuesto_adicional];
            }

            setFormData({
                ...data,
                impuestos: mappedTaxes
            });

            const impuestoEspecifico = parseFloat(data.impuesto_especifico) || 0;
            if (impuestoEspecifico > 0 || mappedTaxes.length > 0) {
                setShowSpecificTax(true);
            }

            // Recalculate Total Display
            if (data.precio) {
                const total = calculateTotal(data.precio, data.impuesto, mappedTaxes);
                // Force at least 2 decimals for precision in edit mode
                // Use fetched company if available, else try global selector
                const companyDecimals = (fetchedCompany && fetchedCompany.moneda_decimales)
                    ? fetchedCompany.moneda_decimales
                    : (getCompanySettings().moneda_decimales || 0);

                const decimals = Math.min(Math.max(companyDecimals, 2), 4);
                setPrecioConIVA(total.toFixed(decimals));
            }

        } catch (error) {
            console.error('Error fetching product', error);
        }
    };

    // Helper to get selected tax details
    const getSelectedTaxes = (taxIds) => {
        if (!taxIds || !Array.isArray(taxIds)) return [];
        return taxes.filter(t => taxIds.some(id => String(id) === String(t.id)));
    };

    const getCompanySettings = () => {
        if (!formData.empresa && companies.length === 1) return companies[0];
        return companies.find(c => c.id === parseInt(formData.empresa)) || {};
    };

    const calculateTotal = (net, taxRate, taxIds) => {
        const netVal = parseFloat(net) || 0;
        const ivaRate = parseFloat(taxRate) || 19;

        const selectedTaxes = getSelectedTaxes(taxIds);

        // 1. Calculate Base for IVA (Net + Neto Taxes)
        let baseForIVA = netVal;

        // Sum Neto Fixed Taxes
        const netoFixed = selectedTaxes
            .filter(t => t.aplicacion === 'NETO' && t.tipo === 'FIJO')
            .reduce((sum, t) => sum + parseFloat(t.valor), 0);

        // Sum Neto % Taxes
        const netoPct = selectedTaxes
            .filter(t => t.aplicacion === 'NETO' && t.tipo === 'PORCENTAJE')
            .reduce((sum, t) => sum + parseFloat(t.valor), 0);

        baseForIVA += netoFixed + (netVal * (netoPct / 100));

        // 2. Add IVA
        const totalWithIVA = baseForIVA * (1 + (ivaRate / 100));

        // 3. Apply TOTAL taxes
        let finalTotal = totalWithIVA;

        // Sum Total Fixed Taxes
        const totalFixed = selectedTaxes
            .filter(t => t.aplicacion === 'TOTAL' && t.tipo === 'FIJO')
            .reduce((sum, t) => sum + parseFloat(t.valor), 0);

        // Sum Total % Taxes
        const totalPct = selectedTaxes
            .filter(t => t.aplicacion === 'TOTAL' && t.tipo === 'PORCENTAJE')
            .reduce((sum, t) => sum + parseFloat(t.valor), 0);

        finalTotal += totalFixed + (totalWithIVA * (totalPct / 100));

        return finalTotal;
    };


    const calculateBase = (gross, taxRate, taxIds) => {
        const grossVal = parseFloat(gross) || 0;
        const ivaRate = parseFloat(taxRate) || 19;
        const selectedTaxes = getSelectedTaxes(taxIds);

        // Parameters
        const F_n = selectedTaxes
            .filter(t => t.aplicacion === 'NETO' && t.tipo === 'FIJO')
            .reduce((sum, t) => sum + parseFloat(t.valor), 0);

        const P_n = selectedTaxes
            .filter(t => t.aplicacion === 'NETO' && t.tipo === 'PORCENTAJE')
            .reduce((sum, t) => sum + parseFloat(t.valor), 0) / 100;

        const F_t = selectedTaxes
            .filter(t => t.aplicacion === 'TOTAL' && t.tipo === 'FIJO')
            .reduce((sum, t) => sum + parseFloat(t.valor), 0);

        const P_t = selectedTaxes
            .filter(t => t.aplicacion === 'TOTAL' && t.tipo === 'PORCENTAJE')
            .reduce((sum, t) => sum + parseFloat(t.valor), 0) / 100;

        const I = ivaRate / 100;

        // Formula: N = [ (FinalTotal - F_t) / (1+P_t) - F_n*(1+I) ] / [ (1+P_n)*(1+I) ]

        const numerator = ((grossVal - F_t) / (1 + P_t)) - (F_n * (1 + I));
        const denominator = (1 + P_n) * (1 + I);

        if (denominator === 0) return '0'; // Avoid division by zero
        const net = numerator / denominator;
        return net > 0 ? net.toFixed(4) : '0';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'precioConIVA') {
            setPrecioConIVA(value);
            // Reverse Calc
            const base = calculateBase(value, formData.impuesto, formData.impuestos);
            setFormData(prev => ({ ...prev, precio: base }));
        } else if (name === 'impuesto') {
            setFormData(prev => {
                const newData = { ...prev, [name]: value };
                const total = calculateTotal(newData.precio, newData.impuesto, newData.impuestos);
                const companyDecimals = getCompanySettings().moneda_decimales || 0;
                const decimals = Math.min(Math.max(companyDecimals, 2), 4);
                setPrecioConIVA(total.toFixed(decimals));
                return newData;
            });
        } else if (name === 'precio') {
            setFormData(prev => {
                const newData = { ...prev, [name]: value };
                const total = calculateTotal(newData.precio, newData.impuesto, newData.impuestos);
                const companyDecimals = getCompanySettings().moneda_decimales || 0;
                const decimals = Math.min(Math.max(companyDecimals, 2), 4);
                setPrecioConIVA(total.toFixed(decimals));
                return newData;
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleTaxToggle = (taxId) => {
        setFormData(prev => {
            const currentTaxes = prev.impuestos || [];
            let newTaxes = [];
            if (currentTaxes.includes(taxId)) {
                newTaxes = currentTaxes.filter(id => id !== taxId);
            } else {
                newTaxes = [...currentTaxes, taxId];
            }

            const newData = { ...prev, impuestos: newTaxes };
            const total = calculateTotal(newData.precio, newData.impuesto, newTaxes);
            const companyDecimals = getCompanySettings().moneda_decimales || 0;
            const decimals = Math.min(Math.max(companyDecimals, 2), 4);
            setPrecioConIVA(total.toFixed(decimals));
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            // Ensure numbers
            payload.impuesto_especifico = parseFloat(payload.impuesto_especifico) || 0;

            // Map impuesto_adicional (ID)
            if (!showSpecificTax) {
                payload.impuesto_adicional = null;
                payload.impuesto_especifico = 0;
                payload.impuestos = []; // Clear M2M taxes if toggle is off
            } else {
                payload.impuesto_adicional = null; // Deprecate this field in payload
            }

            // If not Admin, remove 'empresa' field so backend injects it from user profile
            if (role !== 'ADMIN') {
                delete payload.empresa;
            }

            if (id) {
                await api.put(`productos/${id}/`, payload);
                alert('Producto actualizado');
            } else {
                await api.post('productos/', payload);
                alert('Producto creado');
            }
            navigate('/dashboard/productos');
        } catch (error) {
            console.error('Error saving product', error);
            let errorMessage = 'Error al guardar el producto';
            if (error.response && error.response.data) {
                errorMessage = Object.values(error.response.data).flat().join(', ');
            }
            alert(errorMessage);
        }
    };

    return (
        <div>
            <h2>{id ? 'Editar Producto/Servicio' : 'Nuevo Producto/Servicio'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre:</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>
                {role === 'ADMIN' && (
                    <div>
                        <label>Empresa:</label>
                        <select name="empresa" value={formData.empresa || ''} onChange={handleChange} required>
                            <option value="">Seleccione una empresa</option>
                            {companies.map(company => (
                                <option key={company.id} value={company.id}>{company.nombre}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div>
                    <label>Descripción:</label>
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} />
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <label>Precio Neto:</label>
                        <input
                            type="number"
                            name="precio"
                            value={formData.precio}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={showSpecificTax}
                                onChange={(e) => {
                                    setShowSpecificTax(e.target.checked);
                                    if (!e.target.checked) {
                                        // Clear Tax
                                        setFormData(prev => {
                                            const newData = { ...prev, impuestos: [], impuesto_especifico: 0 };
                                            const total = calculateTotal(newData.precio, newData.impuesto, []);
                                            const decimals = getCompanySettings().moneda_decimales || 0;
                                            setPrecioConIVA(total.toFixed(decimals));
                                            return newData;
                                        });
                                    }
                                }}
                                style={{ marginRight: '8px' }}
                            />
                            Tiene Impuestos Adicionales
                        </label>
                        {showSpecificTax && (
                            <div style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                                {taxes.length === 0 ? (
                                    <div style={{ color: 'orange', fontSize: '12px' }}>
                                        No hay impuestos configurados.
                                    </div>
                                ) : (
                                    taxes.map(tax => (
                                        <div key={tax.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                            <input
                                                type="checkbox"
                                                id={`tax-${tax.id}`}
                                                checked={(formData.impuestos || []).includes(tax.id)}
                                                onChange={() => handleTaxToggle(tax.id)}
                                                style={{ marginRight: '8px' }}
                                            />
                                            <label htmlFor={`tax-${tax.id}`} style={{ fontSize: '13px', cursor: 'pointer' }}>
                                                {tax.nombre} ({tax.valor} {tax.tipo === 'PORCENTAJE' ? '%' : '$'}) - {tax.aplicacion}
                                            </label>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {showSpecificTax && (
                        <div style={{ flex: 1 }}>
                            <label style={{ color: '#888', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                                {(() => {
                                    // Determine label based on selected taxes?
                                    // Since we can have mixed, let's just say "Total Intermedio"
                                    return "Base + Impuestos Adicionales (Estimado)";
                                })()}
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={(() => {
                                    const net = parseFloat(formData.precio) || 0;
                                    const selectedTaxes = getSelectedTaxes(formData.impuestos);

                                    // Calculate Intermediate Sum (Net + Neto Taxes)
                                    // For Total Application taxes, they are not in this intermediate base usually, 
                                    // but the user wanted "Precio Neto + Impuesto Adicional".
                                    // If we have mixed, it's confusing.
                                    // Let's show: Net + Sum(Neto Taxes). 
                                    // Or just show calculation trace?
                                    // Let's show: Net + All Applicable Taxes (excluding IVA part?)

                                    let val = net;
                                    selectedTaxes.forEach(t => {
                                        if (t.aplicacion === 'NETO') { // Only consider NETO taxes for this intermediate display
                                            if (t.tipo === 'FIJO') val += parseFloat(t.valor);
                                            else val += net * (parseFloat(t.valor) / 100);
                                        }
                                    });

                                    const companyDecimals = getCompanySettings().moneda_decimales || 0;
                                    const decimals = Math.min(Math.max(companyDecimals, 2), 4);
                                    return val.toFixed(decimals);
                                })()}
                                style={{ backgroundColor: '#f0f0f0', color: '#555', cursor: 'default', width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label>Precio con IVA (Final):</label>
                    <input
                        type="number"
                        name="precioConIVA"
                        value={precioConIVA}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Marca:</label>
                    <input type="text" name="marca" value={formData.marca} onChange={handleChange} />
                </div>
                <div>
                    <label>Stock:</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} />
                </div>
                <div>
                    <label>SKU:</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            name="sku"
                            value={formData.sku || ''}
                            onChange={handleChange}
                            style={{ flex: 1 }}
                            placeholder="Código SKU"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                const namePart = formData.nombre ? formData.nombre.substring(0, 3).toUpperCase() : 'PRO';
                                const brandPart = formData.marca ? formData.marca.substring(0, 3).toUpperCase() : 'GEN';
                                const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
                                const sku = `${namePart}-${brandPart}-${randomNum}`;
                                setFormData(prev => ({ ...prev, sku: sku }));
                            }}
                            style={{ padding: '0 15px', whiteSpace: 'nowrap' }}
                        >
                            Generar Automático
                        </button>
                    </div>
                </div>
                <button type="submit" style={{ marginTop: '20px' }}>Guardar</button>
            </form>
        </div>
    );
};

export default ProductForm;
