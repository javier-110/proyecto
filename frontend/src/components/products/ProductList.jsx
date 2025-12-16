import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getProductos } from '../../api';
import { formatCurrency } from '../../utils/formatCurrency';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const [companySettings, setCompanySettings] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

    const empresaId = localStorage.getItem('empresa_id');

    // Fetch company settings once
    useEffect(() => {
        if (empresaId) {
            api.get(`empresas/${empresaId}/`)
                .then(res => setCompanySettings(res.data))
                .catch(err => console.error(err));
        }
    }, [empresaId]);

    // Debounce search term to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Trigger fetch when debounced term changes
    useEffect(() => {
        fetchProducts();
    }, [debouncedTerm]);

    const fetchProducts = async (url = null) => {
        try {
            const empresaId = localStorage.getItem('empresa_id');
            if (!empresaId) {
                console.error('Empresa ID not found in local storage');
                return;
            }

            let response;
            if (url) {
                const relativeUrl = url.replace(api.defaults.baseURL, '');
                response = await api.get(relativeUrl);
            } else {
                response = await getProductos({
                    params: {
                        empresa: empresaId,
                        search: debouncedTerm // Send search term to backend
                    }
                });
            }

            if (response.data.results) {
                setProducts(response.data.results);
                setNextPage(response.data.next);
                setPrevPage(response.data.previous);
            } else {
                setProducts(response.data);
                setNextPage(null);
                setPrevPage(null);
            }
        } catch (error) {
            console.error('Error fetching products', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                await api.delete(`productos/${id}/`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product', error);
            }
        }
    };

    return (
        <div>
            <h2>Productos/Servicios</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Link to="/dashboard/productos/nuevo" className="btn-primary" style={{ textDecoration: 'none' }}>Crear Nuevo Producto/Servicio</Link>
                <input
                    type="text"
                    placeholder="Buscar producto/servicio (nombre, sku, marca)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        width: '300px'
                    }}
                />
            </div>
            <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Nombre</th>
                        <th>Marca</th>
                        <th>Precio Neto</th>
                        <th>Precio + IVA + Impuestos</th>
                        <th>Oferta</th>
                        <th>Impuesto</th>
                        <th>Stock</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => {
                        const precioNeto = parseFloat(product.precio);
                        const impuesto = parseFloat(product.impuesto) || 0;
                        const impuestoEspecifico = parseFloat(product.impuesto_especifico) || 0;

                        // Calculate Total with Multi-Taxes
                        let baseForIVA = precioNeto;
                        const taxes = product.impuestos_details || [];

                        // Neto Taxes
                        taxes.filter(t => t.aplicacion === 'NETO').forEach(t => {
                            if (t.tipo === 'FIJO') baseForIVA += parseFloat(t.valor);
                            else baseForIVA += precioNeto * (parseFloat(t.valor) / 100);
                        });

                        // Legacy Specific Tax (treat as part of Base for IVA?)
                        // In ProductForm it was removed/migrated, but here we might still have it?
                        // Let's assume M2M takes precedence, but if specific exists add it.
                        if (impuestoEspecifico > 0) {
                            baseForIVA += precioNeto * (impuestoEspecifico / 100);
                        }

                        // Apply IVA
                        const totalWithIVA = baseForIVA * (1 + (impuesto / 100));

                        // Total Taxes
                        let finalPrice = totalWithIVA;
                        taxes.filter(t => t.aplicacion === 'TOTAL').forEach(t => {
                            if (t.tipo === 'FIJO') finalPrice += parseFloat(t.valor);
                            else finalPrice += totalWithIVA * (parseFloat(t.valor) / 100);
                        });

                        const precioConIva = finalPrice;

                        return (
                            <tr key={product.id}>
                                <td>{product.sku || '-'}</td>
                                <td>{product.nombre}</td>
                                <td>{product.marca || '-'}</td>
                                <td>{formatCurrency(precioNeto, companySettings)}</td>
                                <td style={{ fontWeight: 'bold' }}>{formatCurrency(precioConIva, companySettings)}</td>
                                <td>
                                    {product.tiene_oferta ? (
                                        <span style={{
                                            backgroundColor: '#52c41a',
                                            color: 'white',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '12px'
                                        }}>
                                            Sí ({product.oferta_porcentaje}%)
                                        </span>
                                    ) : (
                                        <span style={{ color: '#999' }}>No</span>
                                    )}
                                </td>
                                <td>
                                    {product.impuesto}% (IVA)
                                    {product.impuestos_details && product.impuestos_details.length > 0 && (
                                        <div style={{ fontSize: '0.8em', color: '#666', marginTop: '4px' }}>
                                            {product.impuestos_details.map(t => (
                                                <div key={t.id}>
                                                    + {t.nombre} ({t.valor}{t.tipo === 'PORCENTAJE' ? '%' : '$'})
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </td>
                                <td>{product.stock}</td>
                                <td>
                                    <Link to={`/dashboard/productos/editar/${product.id}`} style={{ marginRight: '10px' }}>Editar</Link>
                                    <button onClick={() => handleDelete(product.id)} className="danger" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Eliminar</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                    onClick={() => fetchProducts(prevPage)}
                    disabled={!prevPage}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: !prevPage ? '#ccc' : '#646cff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !prevPage ? 'not-allowed' : 'pointer'
                    }}
                >
                    Anterior
                </button>
                <button
                    onClick={() => fetchProducts(nextPage)}
                    disabled={!nextPage}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: !nextPage ? '#ccc' : '#646cff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !nextPage ? 'not-allowed' : 'pointer'
                    }}
                >
                    Siguiente
                </button>
            </div>
        </div >
    );
};

export default ProductList;
