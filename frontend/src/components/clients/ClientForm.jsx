import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

const ClientForm = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        rut: '',
        email: '',
        telefono: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            fetchClient();
        }
    }, [id]);

    const fetchClient = async () => {
        try {
            const response = await api.get(`clientes/${id}/`);
            setFormData(response.data);
        } catch (error) {
            console.error('Error fetching client', error);
            alert('Error al cargar el cliente');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await api.put(`clientes/${id}/`, formData);
                alert('Cliente actualizado exitosamente');
            } else {
                await api.post('clientes/', formData);
                alert('Cliente creado exitosamente');
            }
            navigate('/dashboard/clientes');
        } catch (error) {
            console.error('Error saving client', error);
            alert('Error al guardar el cliente');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h2>{id ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Nombre:</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>RUT:</label>
                    <input
                        type="text"
                        name="rut"
                        value={formData.rut}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Teléfono:</label>
                    <input
                        type="text"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" onClick={() => navigate('/dashboard/clientes')} style={{ padding: '10px 20px', backgroundColor: '#f5f5f5', border: '1px solid #d9d9d9', borderRadius: '4px', cursor: 'pointer' }}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClientForm;
