import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { formatCurrency } from '../../utils/formatCurrency';

const QuoteForm = () => {
  const navigate = useNavigate();

  // Client State
  const [clientSearch, setClientSearch] = useState('');
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClientData, setNewClientData] = useState({
    nombre: '',
    rut: '',
    email: '',
    telefono: ''
  });
  const [isNewClient, setIsNewClient] = useState(false);

  // Product State
  const [productSearch, setProductSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [quoteItems, setQuoteItems] = useState([]);

  // Totals
  const [totals, setTotals] = useState({ net: 0, tax: 0, total: 0 });
  const [companyTax, setCompanyTax] = useState(19);
  const [discount, setDiscount] = useState(0);

  // Company Settings
  const [companySettings, setCompanySettings] = useState(null);

  useEffect(() => {
    if (clientSearch.length > 0) {
      searchClients();
    }
  }, [clientSearch]);

  // Click outside handler
  const clientWrapperRef = useRef(null);
  const productWrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (clientWrapperRef.current && !clientWrapperRef.current.contains(event.target)) {
        setClients([]);
      }
      if (productWrapperRef.current && !productWrapperRef.current.contains(event.target)) {
        setProducts([]);
      }
    }
    // Use capture=true to catch the event before any propagation issues
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, []);

  useEffect(() => {
    if (productSearch.length > 0) {
      searchProducts();
    }
  }, [productSearch]);

  useEffect(() => {
    calculateTotals();
  }, [quoteItems, discount]);

  useEffect(() => {
    const fetchCompanySettings = async () => {
      const empresaId = localStorage.getItem('empresa_id');
      if (empresaId) {
        try {
          const response = await api.get(`empresas/${empresaId}/`);
          setCompanySettings(response.data);
          if (response.data.impuesto_defecto) {
            setCompanyTax(response.data.impuesto_defecto);
          }
        } catch (error) {
          console.error('Error fetching company settings', error);
        }
      }
    };
    fetchCompanySettings();
  }, []);

  const searchClients = async () => {
    try {
      const empresaId = localStorage.getItem('empresa_id');
      const response = await api.get(`clientes/`, {
        params: {
          search: clientSearch,
          empresa: empresaId
        }
      });

      if (response.data.results) {
        setClients(response.data.results);
      } else {
        setClients(response.data);
      }
    } catch (error) {
      console.error('Error searching clients', error);
    }
  };

  const searchProducts = async () => {
    try {
      const empresaId = localStorage.getItem('empresa_id');
      const response = await api.get(`productos/`, {
        params: {
          search: productSearch,
          empresa: empresaId
        }
      });

      if (response.data.results) {
        setProducts(response.data.results);
      } else {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error searching products', error);
    }
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setClientSearch(client.nombre);
    setClients([]);
    setIsNewClient(false);
  };

  const handleNewClientChange = (e) => {
    setNewClientData({ ...newClientData, [e.target.name]: e.target.value });
  };

  const calculateFinalPrice = (net, ivaRate, taxes) => {
    const netVal = parseFloat(net) || 0;
    const ivaVal = parseFloat(ivaRate) || 19;
    const selectedTaxes = taxes || [];

    // 1. Calculate Base for IVA (Net + Neto Taxes)
    let baseForIVA = netVal;

    const netoFixed = selectedTaxes
      .filter(t => t.aplicacion === 'NETO' && t.tipo === 'FIJO')
      .reduce((sum, t) => sum + parseFloat(t.valor), 0);

    const netoPct = selectedTaxes
      .filter(t => t.aplicacion === 'NETO' && t.tipo === 'PORCENTAJE')
      .reduce((sum, t) => sum + parseFloat(t.valor), 0);

    baseForIVA += netoFixed + (netVal * (netoPct / 100));

    // 2. Add IVA
    const totalWithIVA = baseForIVA * (1 + (ivaVal / 100));

    // 3. Apply TOTAL taxes
    let finalTotal = totalWithIVA;

    const totalFixed = selectedTaxes
      .filter(t => t.aplicacion === 'TOTAL' && t.tipo === 'FIJO')
      .reduce((sum, t) => sum + parseFloat(t.valor), 0);

    const totalPct = selectedTaxes
      .filter(t => t.aplicacion === 'TOTAL' && t.tipo === 'PORCENTAJE')
      .reduce((sum, t) => sum + parseFloat(t.valor), 0);

    finalTotal += totalFixed + (totalWithIVA * (totalPct / 100));

    return finalTotal;
  };

  const reverseCalculateBase = (gross, ivaRate, taxes) => {
    const grossVal = parseFloat(gross) || 0;
    const ivaVal = parseFloat(ivaRate) || 19;
    const selectedTaxes = taxes || [];

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

    const I = ivaVal / 100;

    const numerator = ((grossVal - F_t) / (1 + P_t)) - (F_n * (1 + I));
    const denominator = (1 + P_n) * (1 + I);

    if (denominator === 0) return 0;
    return numerator / denominator;
  };

  const handleAddProduct = (product) => {
    const existingItem = quoteItems.find(item => item.producto === product.id);
    if (existingItem) {
      alert('El producto ya está en la cotización');
      return;
    }

    const companyTaxRate = companyTax;
    const productTaxRate = parseFloat(product.impuesto) || companyTaxRate;

    // Resolve Taxes
    let productTaxes = [];
    if (product.impuestos_details && Array.isArray(product.impuestos_details)) {
      productTaxes = product.impuestos_details;
    } else if (product.impuesto_adicional_data) {
      // Legacy fallback
      productTaxes = [product.impuesto_adicional_data];
    }

    let precioBase = parseFloat(product.precio);
    if (product.tiene_oferta && product.precio_oferta) {
      precioBase = parseFloat(product.precio_oferta);
    }

    const precioFinal = calculateFinalPrice(precioBase, productTaxRate, productTaxes);

    setQuoteItems([...quoteItems, {
      producto: product.id,
      nombre: product.nombre,
      cantidad: 1,
      precioFinal: precioFinal,
      impuesto: productTaxRate,
      impuestos: productTaxes, // Store full array
      descuento: 0
    }]);
    setProductSearch('');
    setProducts([]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...quoteItems];
    newItems[index][field] = value;
    setQuoteItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...quoteItems];
    newItems.splice(index, 1);
    setQuoteItems(newItems);
  };

  const calculateTotals = () => {
    let totalNet = 0;
    let totalAdditional = 0;
    let totalIVA = 0;
    let totalFinal = 0;

    quoteItems.forEach(item => {
      // 1. Total (Gross) for this item
      const grossUnit = parseFloat(item.precioFinal) || 0;
      const quantity = parseInt(item.cantidad) || 1;
      const discount = parseFloat(item.descuento) || 0;

      const grossTotal = grossUnit * quantity;
      const discountAmount = grossTotal * (discount / 100);
      const finalTotal = grossTotal - discountAmount;

      totalFinal += finalTotal;

      // 2. Reverse Calculate Components from finalTotal
      // We need to reverse calc based on the Unit Price first, or Total?
      // Since taxes are proportional (mostly), we can reverse calc the Total.
      // EXCEPT Fixed taxes. Fixed taxes are Per Unit.
      // So we must Reverse Calc the Unit Price, then multiply components by Quantity.

      // Warning: calculateFinalPrice adds Fixed Tax ONCE per unit.
      // So:
      // UnitNet = reverse(grossUnit)
      // UnitComponents...
      // TotalNet = UnitNet * Q

      const itemTaxes = item.impuestos || [];
      const taxRate = item.impuesto || 19;

      const unitNet = reverseCalculateBase(grossUnit, taxRate, itemTaxes);

      // Calculate Forward to get components breakdown
      // Re-implement distinct sums

      const ivaMultiplier = (1 + (taxRate / 100));

      // Net
      let currentBase = unitNet;

      // Neto Taxes
      let unitAdditional = 0;
      itemTaxes.filter(t => t.aplicacion === 'NETO').forEach(t => {
        if (t.tipo === 'FIJO') unitAdditional += parseFloat(t.valor);
        else unitAdditional += unitNet * (parseFloat(t.valor) / 100);
      });

      // Base For IVA
      const baseForIVA = unitNet + unitAdditional; // Note: In my formula, Neto Taxes are PART of IVA Base? Yes.

      // IVA
      const unitIVA = baseForIVA * (taxRate / 100);

      // Total After IVA
      const totalWithIVA = baseForIVA + unitIVA;

      // Total Taxes
      let unitTotalAdditional = 0;
      itemTaxes.filter(t => t.aplicacion === 'TOTAL').forEach(t => {
        if (t.tipo === 'FIJO') unitTotalAdditional += parseFloat(t.valor);
        else unitTotalAdditional += totalWithIVA * (parseFloat(t.valor) / 100);
      });

      const totalAdditionalForUnit = unitAdditional + unitTotalAdditional;

      // Accumulate
      // Note: Discount applies to the GROSS total.
      // If we discount 10% of total price, we discount 10% of Net, 10% of Tax, etc.
      // So we can just multiply everything by (1 - discount/100)

      const factor = quantity * (1 - (discount / 100));

      totalNet += unitNet * factor;
      totalAdditional += totalAdditionalForUnit * factor;
      totalIVA += unitIVA * factor;

      // totalFinal is already calculated as Gross * Q * Discount
    });

    setTotals({
      net: totalNet,
      additional: totalAdditional,
      iva: totalIVA,
      total: totalFinal
    });
  };

  const handleSubmit = async (shouldSendEmail = false) => {
    if (!selectedClient && !isNewClient) {
      alert('Debe seleccionar un cliente o crear uno nuevo');
      return;
    }
    if (isNewClient && (!newClientData.email || !newClientData.telefono)) {
      alert('Email y Teléfono son obligatorios para nuevos clientes');
      return;
    }
    if (quoteItems.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }

    const payload = {
      cliente: selectedClient ? selectedClient.id : null,
      cliente_data: isNewClient ? newClientData : null,
      detalles: quoteItems.map(item => {
        const taxRate = item.impuesto || 19;
        const taxes = item.impuestos || [];
        const unitNet = reverseCalculateBase(item.precioFinal, taxRate, taxes);

        return {
          producto: item.producto,
          cantidad: item.cantidad,
          precio: unitNet.toFixed(4),
          descuento: item.descuento || 0
        };
      }),
      total: parseFloat(totals.total.toFixed(4)),
      descuento: 0
    };

    try {
      const response = await api.post('cotizaciones/', payload);
      const newQuoteId = response.data.id;

      if (shouldSendEmail) {
        if (!window.confirm('La cotización se guardó correctamente. ¿Desea enviarla ahora?')) {
          navigate('/dashboard/cotizaciones');
          return;
        }
        try {
          await api.post(`cotizaciones/${newQuoteId}/enviar_email/`);
          alert('Cotización guardada y enviada exitosamente.');
        } catch (emailError) {
          console.error('Error sending email', emailError);
          alert('Cotización guardada, pero hubo un error al enviar el email: ' + (emailError.response?.data?.error || 'Error desconocido'));
        }
      } else {
        alert('Cotización guardada exitosamente');
      }

      navigate('/dashboard/cotizaciones');
    } catch (error) {
      console.error('Error creating quote', error);
      let errorMessage = 'Error al crear la cotización';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMessage = Object.entries(error.response.data)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
            .join('\n');
        } else {
          errorMessage = error.response.data;
        }
      }
      alert(errorMessage);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Nueva Cotización</h2>

      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h3>Cliente</h3>
        {!isNewClient ? (
          <div style={{ position: 'relative' }} ref={clientWrapperRef}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Buscar cliente (Nombre, RUT)..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                autoComplete="off"
                style={{ flex: 1 }}
              />
              <button onClick={() => setIsNewClient(true)} style={{ whiteSpace: 'nowrap' }} className="btn-primary">+ Nuevo</button>
            </div>
            {clients.length > 0 && (
              <ul className="search-results-dropdown">
                {clients.map(client => (
                  <li key={client.id} onMouseDown={() => handleSelectClient(client)} className="search-result-item">
                    <div>
                      <div className="item-main-text">{client.nombre}</div>
                      <div className="item-sub-text">{client.rut}</div>
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#888' }}>
                      {client.email}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div>
            <input name="nombre" placeholder="Nombre" onChange={handleNewClientChange} />
            <input name="rut" placeholder="RUT" onChange={handleNewClientChange} />
            <input name="email" placeholder="Email (Obligatorio)" onChange={handleNewClientChange} />
            <input name="telefono" placeholder="Teléfono (Obligatorio)" onChange={handleNewClientChange} />
            <button onClick={() => setIsNewClient(false)}>Cancelar / Buscar</button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h3>Productos/Servicios</h3>
        <div style={{ position: 'relative' }} ref={productWrapperRef}>
          <input
            type="text"
            placeholder="Buscar producto (Nombre, código)..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            autoComplete="off"
          />
          {products.length > 0 && (
            <ul className="search-results-dropdown">
              {products.map(product => (
                <li key={product.id} onMouseDown={() => handleAddProduct(product)} className="search-result-item">
                  <div>
                    <div className="item-main-text">{product.nombre}</div>
                    <div className="item-sub-text">{product.descripcion ? product.descripcion.substring(0, 30) + '...' : ''}</div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#52c41a' }}>
                    {formatCurrency(product.precio, companySettings)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <table style={{ width: '100%', marginTop: '10px' }}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unitario (Final)</th>
              <th>Desc. %</th>
              <th>Subtotal (Final)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {quoteItems.map((item, index) => (
              <tr key={item.producto}>
                <td>
                  {item.nombre}
                  {item.isOffer && (
                    <span style={{
                      marginLeft: '10px',
                      backgroundColor: '#52c41a',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      En Oferta
                    </span>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value) || 1)}
                    style={{ width: '50px' }}
                    min="1"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.precioFinal}
                    onChange={(e) => handleItemChange(index, 'precioFinal', parseFloat(e.target.value) || 0)}
                    style={{ width: '100px' }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.descuento || 0}
                    onChange={(e) => handleItemChange(index, 'descuento', parseFloat(e.target.value) || 0)}
                    style={{ width: '60px' }}
                    min="0"
                    max="100"
                  />
                </td>
                <td>
                  {(() => {
                    const gross = item.cantidad * item.precioFinal;
                    const disc = gross * ((item.descuento || 0) / 100);
                    return formatCurrency(gross - disc, companySettings);
                  })()}
                </td>
                <td><button onClick={() => handleRemoveItem(index)}>X</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'right', marginTop: '20px' }}>
        <hr style={{ margin: '15px 0', borderColor: 'var(--border-color)' }} />
        {/* Global discount input removed as per user request */}

        <p>Neto: {formatCurrency(totals.net, companySettings)}</p>
        {(totals.additional || 0) > 0 && (
          <p>Imp. Adicionales: {formatCurrency(totals.additional, companySettings)}</p>
        )}
        <p>IVA (19%): {formatCurrency(totals.iva, companySettings)}</p>
        <h3>Total: {formatCurrency(totals.total, companySettings)}</h3>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={() => handleSubmit(false)} className="btn-primary" style={{ padding: '12px 24px', fontSize: '16px' }}>
            Guardar Cotización
          </button>
          <button onClick={() => handleSubmit(true)} className="btn-secondary" style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: '#52c41a', color: 'white', border: 'none' }}>
            Guardar y Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuoteForm;
