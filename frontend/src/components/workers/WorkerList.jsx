import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Link } from 'react-router-dom';

const WorkerList = () => {
    const [workers, setWorkers] = useState([]);

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const response = await api.get('usuarios/');
            const data = response.data.results ? response.data.results : response.data;
            // Filter only workers (backend should already filter, but just in case)
            const trabajadores = data.filter(u => u.rol === 'TRABAJADOR');
            setWorkers(trabajadores);
        } catch (error) {
            console.error('Error fetching workers', error);
        }
    };

    // State for search
    const [searchTerm, setSearchTerm] = useState('');

    const filteredWorkers = workers.filter(worker => {
        const term = searchTerm.toLowerCase();
        return (
            worker.username.toLowerCase().includes(term) ||
            (worker.email && worker.email.toLowerCase().includes(term))
        );
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Gestión de Trabajadores</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Buscar trabajador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            width: '250px'
                        }}
                    />
                    <Link to="/dashboard/trabajadores/nuevo">
                        <button className="btn-primary">Nuevo Trabajador</button>
                    </Link>
                </div>
            </div>

            <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Rol</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredWorkers.map((worker) => (
                        <tr key={worker.id}>
                            <td>{worker.username}</td>
                            <td>{worker.email}</td>
                            <td>{worker.rol}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WorkerList;
