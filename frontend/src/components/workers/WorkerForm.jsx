import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const WorkerForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        rol: 'TRABAJADOR'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('usuarios/', formData);
            alert('Trabajador creado exitosamente');
            navigate('/dashboard/trabajadores');
        } catch (error) {
            console.error('Error creating worker', error);
            let errorMessage = 'Error al crear trabajador';
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
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2>Crear Nuevo Trabajador</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre de Usuario:</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required style={{ width: '100%', marginBottom: '10px' }} />
                </div>
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', marginBottom: '10px' }} />
                </div>
                <div>
                    <label>Contraseña Inicial:</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', marginBottom: '10px' }} />
                </div>
                <button type="submit">Crear Trabajador</button>
            </form>
        </div>
    );
};

export default WorkerForm;
