import React, { useEffect, useState } from 'react';
import api from '../../api';
import { formatCurrency } from '../../utils/formatCurrency';

const QuoteDetail = ({ quoteId, onClose }) => {
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [companySettings, setCompanySettings] = useState(null);

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const response = await api.get(`cotizaciones/${quoteId}/`);
                setQuote(response.data);

                // Fetch company settings for this quote
                if (response.data.empresa) {
                    const settingsRes = await api.get(`empresas/${response.data.empresa}/`);
                    setCompanySettings(settingsRes.data);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching quote details', error);
                setLoading(false);
            }
        };
        fetchQuote();
    }, [quoteId]);

    if (loading) return <div className="quote-modal-overlay">Cargando detalles...</div>;
    if (!quote) return <div className="quote-modal-overlay">No se encontró la cotización</div>;

    // Calculate totals based on the new logic
    // 1. Subtotal (Gross) = Sum of (Price * Quantity)
    // 2. Discount = % of Subtotal
    // 3. Total = Subtotal - Discount
    // 4. Tax = 19% of Total
    // 5. Net = Total - Tax

    const totalFinal = parseFloat(quote.total);

    // Calculate breakdown by iterating details
    let calculatedNet = 0;
    let calculatedAdditional = 0;
    let calculatedIVA = 0;

    if (quote.detalles) {
        quote.detalles.forEach(item => {
            const basePrice = parseFloat(item.precio); // Stored Net
            const quantity = item.cantidad;
            const discountPercent = parseFloat(item.descuento) || 0;
            const tax = parseFloat(item.impuesto) || 19;
            const ivaMultiplier = (1 + tax / 100);

            // Resolve Taxes
            let itemTaxes = [];
            if (item.impuestos_adicionales_details && Array.isArray(item.impuestos_adicionales_details)) {
                itemTaxes = item.impuestos_adicionales_details;
            } else if (item.impuesto_adicional_valor !== undefined && item.impuesto_adicional_valor !== null) {
                // Fallback to legacy
                itemTaxes = [{
                    valor: item.impuesto_adicional_valor,
                    tipo: item.impuesto_adicional_tipo,
                    aplicacion: item.impuesto_adicional_aplicacion || 'NETO'
                }];
            } else if (item.impuesto_especifico > 0) {
                // Deep Legacy
                itemTaxes = [{
                    valor: item.impuesto_especifico,
                    tipo: 'PORCENTAJE', // Assumed
                    aplicacion: 'NETO'
                }];
            }

            // Calculate Components per Unit (Forward Calc starting from Net)
            let netUnit = basePrice;

            // Neto Taxes
            let unitAdditional = 0;
            itemTaxes.filter(t => t.aplicacion === 'NETO').forEach(t => {
                if (t.tipo === 'FIJO') unitAdditional += parseFloat(t.valor);
                else unitAdditional += netUnit * (parseFloat(t.valor) / 100);
            });

            const baseForIVA = netUnit + unitAdditional;
            const unitIVA = baseForIVA * (tax / 100);
            const totalWithIVA = baseForIVA + unitIVA;

            // Total Taxes
            let unitTotalAdditional = 0;
            itemTaxes.filter(t => t.aplicacion === 'TOTAL').forEach(t => {
                if (t.tipo === 'FIJO') unitTotalAdditional += parseFloat(t.valor);
                else unitTotalAdditional += totalWithIVA * (parseFloat(t.valor) / 100);
            });

            const totalUnit = totalWithIVA + unitTotalAdditional;
            const totalAdditionalForUnit = unitAdditional + unitTotalAdditional;

            // Apply Discount & Quantity
            const ratio = quantity * (1 - (discountPercent / 100));

            calculatedNet += netUnit * ratio;
            calculatedAdditional += totalAdditionalForUnit * ratio;
            calculatedIVA += unitIVA * ratio;
        });
    }

    const handleDownloadPDF = async () => {
        try {
            const response = await api.get(`cotizaciones/${quoteId}/generar_pdf/`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const clientName = (quote.cliente_nombre || 'cliente').replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const dateObj = new Date(quote.fecha);
            const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`;
            link.setAttribute('download', `Cotizacion_${clientName}_${dateStr}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error downloading PDF', error);
            alert('Error al generar el PDF');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Cotización N° {quote.id}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="quote-grid">
                    <div className="info-card">
                        <h3>Información del Cliente</h3>
                        <div className="info-row">
                            <span className="info-label">Nombre:</span>
                            <span>{quote.cliente_nombre}</span>
                        </div>
                        {quote.cliente_email && (
                            <div className="info-row">
                                <span className="info-label">Email:</span>
                                <span>{quote.cliente_email}</span>
                            </div>
                        )}
                        {quote.cliente_telefono && (
                            <div className="info-row">
                                <span className="info-label">Teléfono:</span>
                                <span>{quote.cliente_telefono}</span>
                            </div>
                        )}
                    </div>
                    <div className="info-card">
                        <h3>Detalles del Documento</h3>
                        <div className="info-row">
                            <span className="info-label">Fecha:</span>
                            <span>{new Date(quote.fecha).toLocaleDateString()}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Válida hasta:</span>
                            <span>{new Date(new Date(quote.fecha).setDate(new Date(quote.fecha).getDate() + 30)).toLocaleDateString()}</span>
                        </div>
                        {quote.trabajador_rol === 'TRABAJADOR' && (
                            <div className="info-row">
                                <span className="info-label">Vendedor:</span>
                                <span>{quote.trabajador_nombre}</span>
                            </div>
                        )}
                    </div>
                </div>

                <table className="quote-table">
                    <thead>
                        <tr>
                            <th>Producto/Servicio</th>
                            <th>Cantidad</th>
                            <th>Precio Unit. (Final)</th>
                            <th>Desc. %</th>
                            <th>Subtotal (Final)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quote.detalles.map(item => {
                            const basePrice = parseFloat(item.precio);
                            const tax = parseFloat(item.impuesto) || 19;
                            const discountPercent = parseFloat(item.descuento) || 0;

                            // Resolve Taxes
                            let itemTaxes = [];
                            if (item.impuestos_adicionales_details && Array.isArray(item.impuestos_adicionales_details)) {
                                itemTaxes = item.impuestos_adicionales_details;
                            } else if (item.impuesto_adicional_valor !== undefined && item.impuesto_adicional_valor !== null) {
                                itemTaxes = [{
                                    valor: item.impuesto_adicional_valor,
                                    tipo: item.impuesto_adicional_tipo,
                                    aplicacion: item.impuesto_adicional_aplicacion || 'NETO'
                                }];
                            } else if (item.impuesto_especifico > 0) {
                                itemTaxes = [{ valor: item.impuesto_especifico, tipo: 'PORCENTAJE', aplicacion: 'NETO' }];
                            }

                            // Calculate Gross Price (Unit)
                            // Forward Calc
                            let netUnit = basePrice;

                            // Neto Taxes
                            let unitAdditional = 0;
                            itemTaxes.filter(t => t.aplicacion === 'NETO').forEach(t => {
                                if (t.tipo === 'FIJO') unitAdditional += parseFloat(t.valor);
                                else unitAdditional += netUnit * (parseFloat(t.valor) / 100);
                            });

                            const baseForIVA = netUnit + unitAdditional;
                            const unitIVA = baseForIVA * (tax / 100);
                            const totalWithIVA = baseForIVA + unitIVA;

                            // Total Taxes
                            let unitTotalAdditional = 0;
                            itemTaxes.filter(t => t.aplicacion === 'TOTAL').forEach(t => {
                                if (t.tipo === 'FIJO') unitTotalAdditional += parseFloat(t.valor);
                                else unitTotalAdditional += totalWithIVA * (parseFloat(t.valor) / 100);
                            });

                            const grossPrice = totalWithIVA + unitTotalAdditional;

                            const lineGross = grossPrice * item.cantidad;
                            const lineDiscount = lineGross * (discountPercent / 100);
                            const lineTotal = lineGross - lineDiscount;

                            return (
                                <tr key={item.id}>
                                    <td>{item.producto_nombre}</td>
                                    <td>{item.cantidad}</td>
                                    <td>{formatCurrency(grossPrice, companySettings)}</td>
                                    <td>{discountPercent}%</td>
                                    <td>{formatCurrency(lineTotal, companySettings)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div className="totals-section">
                    <div className="total-row">
                        <span>Neto:</span>
                        <span>{formatCurrency(calculatedNet, companySettings)}</span>
                    </div>
                    {calculatedAdditional > 0 && (
                        <div className="total-row">
                            <span>Imp. Adicionales:</span>
                            <span>{formatCurrency(calculatedAdditional, companySettings)}</span>
                        </div>
                    )}
                    <div className="total-row">
                        <span>IVA (19%):</span>
                        <span>{formatCurrency(calculatedIVA, companySettings)}</span>
                    </div>
                    <div className="total-row final" style={{ marginTop: '10px', borderTop: '2px solid #ddd', paddingTop: '5px' }}>
                        <span>Total:</span>
                        <span>{formatCurrency(totalFinal, companySettings)}</span>
                    </div>
                </div>

                <div className="action-buttons">
                    <button className="btn-primary" onClick={handleDownloadPDF}>Descargar PDF</button>
                    <button className="btn-secondary" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default QuoteDetail;
