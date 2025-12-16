import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { FaWhatsapp, FaFilePdf, FaEye, FaEnvelope } from 'react-icons/fa';
import QuoteDetail from './QuoteDetail';
import { formatCurrency } from '../../utils/formatCurrency';

const QuoteList = () => {
  const [quotes, setQuotes] = useState([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [companySettings, setCompanySettings] = useState(null);

  useEffect(() => {
    fetchQuotes();
    const empresaId = localStorage.getItem('empresa_id');
    if (empresaId) {
      api.get(`empresas/${empresaId}/`)
        .then(res => setCompanySettings(res.data))
        .catch(err => console.error(err));
    }
  }, []);

  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const fetchQuotes = async (url = null) => {
    try {
      let response;
      if (url) {
        const relativeUrl = url.replace(api.defaults.baseURL, '');
        response = await api.get(relativeUrl);
      } else {
        response = await api.get('cotizaciones/');
      }

      let data = [];
      if (response.data.results) {
        data = response.data.results;
        setNextPage(response.data.next);
        setPrevPage(response.data.previous);
      } else {
        data = response.data;
        setNextPage(null);
        setPrevPage(null);
      }

      // Sort by date descending (newest first)
      const sortedQuotes = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setQuotes(sortedQuotes);
    } catch (error) {
      console.error('Error fetching quotes', error);
    }
  };

  const handleDownloadPDF = async (quoteId) => {
    try {
      const response = await api.get(`cotizaciones/${quoteId}/generar_pdf/`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const quote = quotes.find(q => q.id === quoteId);
      const clientName = quote ? quote.cliente_nombre.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'cliente';

      let dateStr = '';
      if (quote) {
        const dateObj = new Date(quote.fecha);
        dateStr = `_${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`;
      }

      link.setAttribute('download', `Cotizacion_${clientName}${dateStr}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF', error);
      alert('Error al descargar el PDF');
    }
  };

  const handleSendEmail = async (quote) => {
    if (!quote.cliente_email) {
      alert('El cliente no tiene email registrado.');
      return;
    }

    if (!window.confirm(`¿Enviar cotización #${quote.id} a ${quote.cliente_email}?`)) {
      return;
    }

    try {
      const response = await api.post(`cotizaciones/${quote.id}/enviar_email/`);
      alert(response.data.message || 'Email enviado exitosamente');
      updateStatusToSent(quote);
    } catch (error) {
      console.error('Error sending email', error);
      const errorMsg = error.response?.data?.error || 'Error al enviar el email';
      alert(errorMsg);
    }
  };

  const handleSendWhatsApp = async (quote) => {
    if (!quote.cliente_telefono) {
      alert('El cliente no tiene teléfono registrado.');
      return;
    }

    try {
      const response = await api.post(`cotizaciones/${quote.id}/enviar_whatsapp/`);

      if (response.data.method === 'web') {
        const companyName = response.data.company_name;
        const companyPhone = response.data.company_phone || '';
        const cleanPhone = quote.cliente_telefono.replace(/\D/g, '');
        const message = `Hola ${quote.cliente_nombre}, soy de ${companyName}. Le enviamos la cotización #${quote.id}.\n\nTotal: ${formatCurrency(quote.total, companySettings)}\n\n${companyPhone ? `Contáctenos al: ${companyPhone}` : 'Quedamos atentos a sus consultas.'}`;
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
      } else {
        alert(response.data.message || 'WhatsApp enviado exitosamente');
      }
      updateStatusToSent(quote);
    } catch (error) {
      console.error('Error sending WhatsApp', error);
      const errorMsg = error.response?.data?.error || 'Error al enviar WhatsApp';
      alert(errorMsg);
    }
  };

  const handleDelete = async (quoteId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta cotización? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await api.delete(`cotizaciones/${quoteId}/`);
      alert('Cotización eliminada exitosamente');
      fetchQuotes();
    } catch (error) {
      console.error('Error deleting quote', error);
      alert('Error al eliminar la cotización');
    }
  };

  const handleStatusChange = async (quoteId, newStatus) => {
    try {
      await api.patch(`cotizaciones/${quoteId}/`, { estado: newStatus });
      fetchQuotes();
    } catch (error) {
      console.error('Error updating status', error);
      alert('Error al actualizar el estado');
    }
  };

  const updateStatusToSent = async (quote) => {
    if (quote.estado === 'BORRADOR') {
      await handleStatusChange(quote.id, 'ENVIADA');
    }
  };

  const actionBtnStyle = {
    padding: '6px 10px',
    backgroundColor: 'white',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1.2em',
    transition: 'all 0.2s'
  };

  const filteredQuotes = quotes.filter(quote => {
    const term = searchTerm.toLowerCase();
    const dateStr = new Date(quote.fecha).toLocaleDateString();
    return (
      quote.cliente_nombre.toLowerCase().includes(term) ||
      (quote.id && quote.id.toString().includes(term)) ||
      dateStr.includes(term)
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Historial de Cotizaciones</h2>
        <input
          type="text"
          placeholder="Buscar cotización (Cliente o #ID)..."
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
      <Link to="/dashboard/cotizaciones/nueva" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '15px' }}>Nueva Cotización</Link>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5', textAlign: 'left', color: '#333' }}>
            <th style={{ padding: '12px' }}>N° Cotización</th>
            <th style={{ padding: '12px' }}>Cliente</th>
            {/* <th style={{ padding: '12px' }}>Vendedor</th> */}
            <th style={{ padding: '12px' }}>Productos/Servicios</th>
            <th style={{ padding: '12px' }}>Fecha</th>
            <th style={{ padding: '12px' }}>Estado</th>
            <th style={{ padding: '12px' }}>Total</th>
            <th style={{ padding: '12px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredQuotes.map(quote => (
            <tr key={quote.id} style={{ borderBottom: '1px solid #eee', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#f9f9f9' } }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>#{quote.id}</td>
              <td style={{ padding: '12px' }}>
                <strong style={{ display: 'block', fontSize: '1.1em' }}>{quote.cliente_nombre}</strong>
                <span style={{ fontSize: '0.85em', color: '#666' }}>{quote.cliente_email}</span>
              </td>
              {/* <td style={{ padding: '12px', fontWeight: 500 }}>{quote.trabajador_nombre}</td> */}
              <td style={{ padding: '10px', maxWidth: '200px' }}>
                {quote.detalles && quote.detalles.length > 0 ? (
                  <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9em' }}>
                    {quote.detalles.map(d => (
                      <li key={d.id}>{d.producto_nombre} (x{d.cantidad})</li>
                    ))}
                  </ul>
                ) : 'Sin productos'}
              </td>
              <td style={{ padding: '10px' }}>
                {new Date(quote.fecha).toLocaleDateString('es-CL')}
                <div style={{ fontSize: '0.85em', color: '#888' }}>
                  {new Date(quote.fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.85em',
                  fontWeight: 'bold',
                  backgroundColor:
                    quote.estado === 'ACEPTADA' ? '#e6f7ff' :
                      quote.estado === 'RECHAZADA' ? '#fff1f0' :
                        quote.estado === 'ENVIADA' ? '#fff7e6' : '#f9f0ff',
                  color:
                    quote.estado === 'ACEPTADA' ? '#1890ff' :
                      quote.estado === 'RECHAZADA' ? '#ff4d4f' :
                        quote.estado === 'ENVIADA' ? '#fa8c16' : '#722ed1',
                  border: `1px solid ${quote.estado === 'ACEPTADA' ? '#91d5ff' :
                    quote.estado === 'RECHAZADA' ? '#ffa39e' :
                      quote.estado === 'ENVIADA' ? '#ffd591' : '#d3adf7'
                    }`
                }}>
                  {quote.estado}
                </span>
              </td>
              <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(quote.total, companySettings)}
              </td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'wrap' }}>
                  <button onClick={() => setSelectedQuoteId(quote.id)} title="Ver Detalle" style={{ ...actionBtnStyle, color: '#1890ff', borderColor: '#1890ff' }}><FaEye size={20} /></button>
                  <button onClick={() => handleDownloadPDF(quote.id)} title="Descargar PDF" style={{ ...actionBtnStyle, color: '#F40F02', borderColor: '#F40F02' }}><FaFilePdf size={20} /></button>
                  <button onClick={() => handleSendEmail(quote)} title="Enviar Email" style={{ ...actionBtnStyle, color: '#fa8c16', borderColor: '#fa8c16' }}><FaEnvelope size={20} /></button>
                  <button onClick={() => handleSendWhatsApp(quote)} title="Enviar WhatsApp" style={{ ...actionBtnStyle, color: '#25D366', borderColor: '#25D366' }}><FaWhatsapp size={20} /></button>

                  {quote.estado !== 'ACEPTADA' && (
                    <button
                      onClick={() => handleStatusChange(quote.id, 'ACEPTADA')}
                      title="Marcar como Aceptada"
                      style={{ ...actionBtnStyle, backgroundColor: '#f6ffed', borderColor: '#b7eb8f', color: '#52c41a' }}
                    >
                      ✅
                    </button>
                  )}

                  {quote.estado !== 'RECHAZADA' && (
                    <button
                      onClick={() => handleStatusChange(quote.id, 'RECHAZADA')}
                      title="Marcar como Rechazada"
                      style={{ ...actionBtnStyle, backgroundColor: '#fff2f0', borderColor: '#ffccc7', color: '#ff4d4f' }}
                    >
                      ❌
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(quote.id)}
                    title="Eliminar"
                    style={{ ...actionBtnStyle, backgroundColor: '#fff1f0', borderColor: '#ffa39e', color: '#f5222d' }}
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button
          onClick={() => fetchQuotes(prevPage)}
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
          onClick={() => fetchQuotes(nextPage)}
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

      {selectedQuoteId && (
        <QuoteDetail quoteId={selectedQuoteId} onClose={() => setSelectedQuoteId(null)} />
      )}
    </div>
  );
};

export default QuoteList;
