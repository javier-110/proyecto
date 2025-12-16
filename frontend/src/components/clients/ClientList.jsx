import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const ClientList = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('clientes/');
      const data = response.data.results ? response.data.results : response.data;
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await api.delete(`clientes/${id}/`);
        setClients(clients.filter(client => client.id !== id));
      } catch (error) {
        console.error('Error deleting client', error);
        alert('Error al eliminar el cliente');
      }
    }
  };

  // State for search
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase();
    return (
      client.nombre.toLowerCase().includes(term) ||
      (client.rut && client.rut.toLowerCase().includes(term)) ||
      (client.email && client.email.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Clientes</h2>
        <input
          type="text"
          placeholder="Buscar cliente..."
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
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '10px' }}>Nombre</th>
            <th style={{ padding: '10px' }}>RUT</th>
            <th style={{ padding: '10px' }}>Email</th>
            <th style={{ padding: '10px' }}>Teléfono</th>
            <th style={{ padding: '10px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredClients.map((client) => (
            <tr key={client.id}>
              <td style={{ padding: '10px' }}>{client.nombre}</td>
              <td style={{ padding: '10px' }}>{client.rut || '-'}</td>
              <td style={{ padding: '10px' }}>{client.email}</td>
              <td style={{ padding: '10px' }}>{client.telefono || '-'}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <Link to={`/dashboard/clientes/editar/${client.id}`} style={{ marginRight: '10px', color: '#1890ff' }}>Editar</Link>
                <button onClick={() => handleDelete(client.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientList;
