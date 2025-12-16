import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { LATAM_PREFIXES, getPhonePrefix, getPhoneNumber } from '../../utils/phonePrefixes';
import CountryCodeSelector from '../common/CountryCodeSelector';

const ValidateCompany = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        code: '',
        password: '',
        empresa: {
            rut: '',
            nombre: '',
            direccion: '',
            telefono: ''
        }
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCompanyChange = (e) => {
        setFormData({
            ...formData,
            empresa: { ...formData.empresa, [e.target.name]: e.target.value }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('validate-company/', formData);
            alert('Cuenta validada exitosamente. Ahora puedes iniciar sesión.');
            navigate('/login');
        } catch (error) {
            console.error('Validation failed', error);
            let errorMessage = 'Datos inválidos';
            if (error.response?.data) {
                if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else {
                    // Handle serializer errors (e.g., { rut: ["Already exists"] })
                    errorMessage = Object.entries(error.response.data)
                        .map(([key, val]) => `${key}: ${val}`)
                        .join(', ');
                }
            }
            alert('Error al validar cuenta: ' + errorMessage);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
            <h2>Validar Cuenta de Empresa</h2>
            {step === 1 ? (
                <div>
                    <p>Ingresa el código que recibiste por correo.</p>
                    <div>
                        <label>Email:</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', marginBottom: '10px' }} />
                    </div>
                    <div>
                        <label>Código Temporal:</label>
                        <input type="text" name="code" value={formData.code} onChange={handleChange} style={{ width: '100%', marginBottom: '10px' }} />
                    </div>
                    <button onClick={() => setStep(2)} disabled={!formData.email || !formData.code}>Siguiente</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <h3>Datos de la Empresa</h3>
                    <div>
                        <label>RUT:</label>
                        <input type="text" name="rut" value={formData.empresa.rut} onChange={handleCompanyChange} required style={{ width: '100%', marginBottom: '10px' }} />
                    </div>
                    <div>
                        <label>Nombre Empresa:</label>
                        <input type="text" name="nombre" value={formData.empresa.nombre} onChange={handleCompanyChange} required style={{ width: '100%', marginBottom: '10px' }} />
                    </div>
                    <div>
                        <label>Dirección:</label>
                        <input type="text" name="direccion" value={formData.empresa.direccion} onChange={handleCompanyChange} style={{ width: '100%', marginBottom: '10px' }} />
                    </div>
                    <div>
                        <label>Teléfono:</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <CountryCodeSelector
                                selectedPrefix={getPhonePrefix(formData.empresa.telefono)}
                                onSelect={(newPrefix) => {
                                    const number = getPhoneNumber(formData.empresa.telefono);
                                    handleCompanyChange({
                                        target: { name: 'telefono', value: newPrefix + number }
                                    });
                                }}
                            />
                            <input
                                type="text"
                                name="telefono_number"
                                placeholder="912345678"
                                value={getPhoneNumber(formData.empresa.telefono)}
                                onChange={(e) => {
                                    const newNumber = e.target.value;
                                    const currentPrefix = getPhonePrefix(formData.empresa.telefono);

                                    handleCompanyChange({
                                        target: { name: 'telefono', value: currentPrefix + newNumber }
                                    });
                                }}
                                style={{ flex: 1, marginBottom: '10px' }}
                            />
                        </div>
                    </div>
                    <h3>Seguridad</h3>
                    <div>
                        <label>Nueva Contraseña:</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', marginBottom: '10px' }} />
                    </div>
                    <button type="submit">Validar y Activar</button>
                    <button type="button" onClick={() => setStep(1)} style={{ marginLeft: '10px' }}>Atrás</button>
                </form>
            )}
        </div>
    );
};

export default ValidateCompany;
