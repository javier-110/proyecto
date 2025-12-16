import React, { useState, useEffect } from 'react';
import api from '../../api';
import { formatCurrency } from '../../utils/formatCurrency';

const OffersManager = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [companySettings, setCompanySettings] = useState(null);

    // Form State
    const [offerData, setOfferData] = useState({
        discountPercent: '',
        durationDays: 7,
        offerPrice: ''
    });

    useEffect(() => {
        fetchProducts();

        const empresaId = localStorage.getItem('empresa_id');
        if (empresaId) {
            api.get(`empresas/${empresaId}/`)
                .then(res => setCompanySettings(res.data))
                .catch(err => console.error(err));
        }
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('productos/');
            // Handle pagination: generic fix
            const data = response.data.results ? response.data.results : response.data;
            setProducts(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products', error);
            setLoading(false);
        }
    };

    const handleManageOffer = (product) => {
        setSelectedProduct(product);

        // Initialize form with existing offer data or defaults
        if (product.tiene_oferta) {
            // Calculate remaining days if needed, or just show current settings
            // For simplicity, we might just load the percentage and price
            setOfferData({
                discountPercent: product.oferta_porcentaje || '',
                durationDays: 7, // Default or calculate from dates
                offerPrice: product.precio_oferta || ''
            });
        } else {
            setOfferData({
                discountPercent: '',
                durationDays: 7,
                offerPrice: ''
            });
        }

        setShowModal(true);
    };

    const handleCalculatePrice = (percent) => {
        if (!selectedProduct || !selectedProduct.precio) return;

        const price = parseFloat(selectedProduct.precio); // Base Price (Net)
        const discount = parseFloat(percent);

        if (!isNaN(price) && !isNaN(discount)) {
            const newPrice = price * (1 - (discount / 100));
            setOfferData(prev => ({
                ...prev,
                discountPercent: percent,
                offerPrice: Math.round(newPrice)
            }));
        } else {
            setOfferData(prev => ({ ...prev, discountPercent: percent }));
        }
    };

    const handleSaveOffer = async () => {
        if (!selectedProduct) return;

        try {
            // Calculate dates
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + parseInt(offerData.durationDays));

            const payload = {
                tiene_oferta: true,
                precio_oferta: offerData.offerPrice,
                oferta_porcentaje: offerData.discountPercent,
                oferta_inicio: startDate.toISOString(),
                oferta_fin: endDate.toISOString()
            };

            await api.patch(`productos/${selectedProduct.id}/`, payload);
            setShowModal(false);
            fetchProducts(); // Refresh list
            alert('Oferta guardada exitosamente');
        } catch (error) {
            console.error('Error saving offer', error);
            alert('Error al guardar la oferta');
        }
    };

    const handleRemoveOffer = async () => {
        if (!selectedProduct) return;

        if (window.confirm('¿Estás seguro de quitar la oferta de este producto?')) {
            try {
                const payload = {
                    tiene_oferta: false,
                    precio_oferta: null,
                    oferta_porcentaje: null,
                    oferta_inicio: null,
                    oferta_fin: null
                };

                await api.patch(`productos/${selectedProduct.id}/`, payload);
                setShowModal(false);
                fetchProducts();
            } catch (error) {
                console.error('Error removing offer', error);
                alert('Error al quitar la oferta');
            }
        }
    };

    // State for search
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(product => {
        const term = searchTerm.toLowerCase();
        return (
            product.nombre.toLowerCase().includes(term) ||
            (product.marca && product.marca.toLowerCase().includes(term)) ||
            (product.sku && product.sku.toLowerCase().includes(term))
        );
    });

    if (loading) return <div>Cargando productos...</div>;

    return (
        <div className="offers-manager-container" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Gestión de Ofertas</h2>
                <input
                    type="text"
                    placeholder="Buscar producto/servicio..."
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

            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Producto/Servicio</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Precio Base</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Estado Oferta</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Precio Oferta</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Descuento</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Vence</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map(product => (
                        <tr key={product.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                            <td style={{ padding: '12px' }}>{product.nombre}</td>
                            <td style={{ padding: '12px' }}>
                                {(() => {
                                    const net = parseFloat(product.precio);
                                    const tax = parseFloat(product.impuesto) || 19;
                                    const specific = parseFloat(product.impuesto_especifico) || 0;
                                    const total = net * (1 + specific / 100) * (1 + tax / 100);
                                    return formatCurrency(total, companySettings);
                                })()}
                            </td>
                            <td style={{ padding: '12px' }}>
                                {product.tiene_oferta ? (
                                    <span style={{ color: 'green', fontWeight: 'bold' }}>Activa</span>
                                ) : (
                                    <span style={{ color: '#6c757d' }}>Inactiva</span>
                                )}
                            </td>
                            <td style={{ padding: '12px' }}>
                                {product.tiene_oferta ? (() => {
                                    const net = parseFloat(product.precio_oferta);
                                    const tax = parseFloat(product.impuesto) || 19;
                                    const specific = parseFloat(product.impuesto_especifico) || 0;
                                    const total = net * (1 + specific / 100) * (1 + tax / 100);
                                    return formatCurrency(total, companySettings);
                                })() : '-'}
                            </td>
                            <td style={{ padding: '12px' }}>
                                {product.tiene_oferta ? `${product.oferta_porcentaje}%` : '-'}
                            </td>
                            <td style={{ padding: '12px' }}>
                                {product.tiene_oferta && product.oferta_fin ? new Date(product.oferta_fin).toLocaleDateString() : '-'}
                            </td>
                            <td style={{ padding: '12px' }}>
                                <button
                                    onClick={() => handleManageOffer(product)}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Gestionar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && selectedProduct && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Gestionar Oferta: {selectedProduct.nombre}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Precio Base (Total):</label>
                            <input
                                type="text"
                                value={(() => {
                                    const net = parseFloat(selectedProduct.precio);
                                    const tax = parseFloat(selectedProduct.impuesto) || 19;
                                    const specific = parseFloat(selectedProduct.impuesto_especifico) || 0;
                                    const total = net * (1 + specific / 100) * (1 + tax / 100);
                                    return formatCurrency(total, companySettings);
                                })()}
                                disabled
                                style={{ width: '100%', padding: '8px', backgroundColor: '#e9ecef', color: '#333', fontWeight: 'bold' }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Porcentaje de Descuento (%):</label>
                            <input
                                type="number"
                                value={offerData.discountPercent}
                                onChange={(e) => handleCalculatePrice(e.target.value)}
                                placeholder="Ej: 20"
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Precio Oferta Calculado (Total):</label>
                            <input
                                type="text"
                                value={offerData.offerPrice ? (() => {
                                    const net = parseFloat(offerData.offerPrice);
                                    const tax = parseFloat(selectedProduct.impuesto) || 19;
                                    const specific = parseFloat(selectedProduct.impuesto_especifico) || 0;
                                    const total = net * (1 + specific / 100) * (1 + tax / 100);
                                    return formatCurrency(total, companySettings);
                                })() : ''}
                                readOnly
                                style={{ width: '100%', padding: '8px', backgroundColor: '#e9ecef', color: '#333', fontWeight: 'bold' }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Duración (Días):</label>
                            <input
                                type="number"
                                value={offerData.durationDays}
                                onChange={(e) => setOfferData({ ...offerData, durationDays: e.target.value })}
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                            <div>
                                {selectedProduct.tiene_oferta && (
                                    <button
                                        onClick={handleRemoveOffer}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            marginRight: '10px'
                                        }}
                                    >
                                        Quitar Oferta
                                    </button>
                                )}
                            </div>
                            <div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        marginRight: '10px'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveOffer}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Guardar Oferta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OffersManager;
