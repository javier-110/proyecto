import React, { useEffect, useState } from 'react';
import api from '../../api';

const CompanyList = () => {
    const [companies, setCompanies] = useState([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await api.get('empresas/');
            const data = response.data.results ? response.data.results : response.data;
            setCompanies(data);
        } catch (error) {
            console.error('Error fetching companies', error);
        }
    };

    const handleInvite = async () => {
        try {
            const response = await api.post('invite-company/', { email: inviteEmail });
            alert(`Invitación enviada. Código Temporal: ${response.data.code}`);
            setShowInviteModal(false);
            setInviteEmail('');
        } catch (error) {
            console.error('Error inviting company', error);
            alert('Error al invitar empresa');
        }
    };



    return (
        <div>
            <h2>Gestión de Empresas</h2>
            <button onClick={() => setShowInviteModal(true)}>Invitar Nueva Empresa</button>

            <table border="1" style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>RUT</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                    </tr>
                </thead>
                <tbody>
                    {companies.map((company) => (
                        <tr key={company.id}>
                            <td>{company.nombre}</td>
                            <td>{company.rut}</td>
                            <td>{company.email}</td>
                            <td>{company.telefono}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showInviteModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '5px' }}>
                        <h3>Invitar Empresa</h3>
                        <input
                            type="email"
                            placeholder="Email de la empresa"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            style={{ width: '100%', marginBottom: '10px' }}
                        />
                        <button onClick={handleInvite}>Generar Invitación</button>
                        <button onClick={() => setShowInviteModal(false)} style={{ marginLeft: '10px' }}>Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyList;
