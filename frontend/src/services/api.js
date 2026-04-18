// services/api.js
const API_BASE_URL = 'http://localhost:8081/api';

const getHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const headers = {
        'Content-Type': 'application/json'
    };
    if (user && user.accessToken) {
        headers['Authorization'] = `Bearer ${user.accessToken}`;
    }
    return headers;
};

export const api = {
    // Utilisateurs
    createEnseignant: (data) => fetch(`${API_BASE_URL}/utilisateurs/enseignant`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),

    createChef: (data) => fetch(`${API_BASE_URL}/utilisateurs/chef`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),

    createResponsable: (data) => fetch(`${API_BASE_URL}/utilisateurs/responsable`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),

    createTechnicien: (data) => fetch(`${API_BASE_URL}/utilisateurs/technicien`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),

    getAllUsers: () => fetch(`${API_BASE_URL}/utilisateurs`, { headers: getHeaders() }),
    
    getUsersByRole: (role) => fetch(`${API_BASE_URL}/utilisateurs/role/${role}`, { 
        headers: getHeaders() 
    }),

    updateUser: (id, data) => fetch(`${API_BASE_URL}/utilisateurs/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),

    deleteUser: (id) => fetch(`${API_BASE_URL}/utilisateurs/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    }),

    // Départements
    getAllDepartements: () => fetch(`${API_BASE_URL}/departements`, { 
        headers: getHeaders() 
    }),
    
    getDepartementById: (id) => fetch(`${API_BASE_URL}/departements/${id}`, { 
        headers: getHeaders() 
    }),
    
    createDepartement: (data) => fetch(`${API_BASE_URL}/departements`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),
    
    updateDepartement: (id, data) => fetch(`${API_BASE_URL}/departements/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),

    deleteDepartement: (id) => fetch(`${API_BASE_URL}/departements/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    }),

    // Besoins
    getAllBesoins: () => fetch(`${API_BASE_URL}/besoins`, { 
        headers: getHeaders() 
    }),
    
    getBesoinsByStatut: (statut) => fetch(`${API_BASE_URL}/besoins/statut/${statut}`, { 
        headers: getHeaders() 
    }),
    
    getBesoinsByDepartement: (id) => fetch(`${API_BASE_URL}/besoins/departement/${id}`, { 
        headers: getHeaders() 
    }),
    
    // Ressources
    getAllRessources: (statut = '') => {
        const url = `${API_BASE_URL}/ressources${statut ? `?statut=${statut}` : ''}`;
        return fetch(url, { headers: getHeaders() });
    },
    
    createRessource: (data) => fetch(`${API_BASE_URL}/ressources`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),

    // Appels d'offres
    getAllAppelsOffresOuverts: () => fetch(`${API_BASE_URL}/appels-offres/ouverts`, { 
        headers: getHeaders() 
    }),
    
    createAppelOffre: (data) => fetch(`${API_BASE_URL}/appels-offres`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),

    // Réunions
    getAllReunions: () => fetch(`${API_BASE_URL}/reunion`, { headers: getHeaders() }),
    
    getReunionsByDepartement: (id) => fetch(`${API_BASE_URL}/reunion/departement/${id}`, { 
        headers: getHeaders() 
    }),
    
    createReunion: (data) => fetch(`${API_BASE_URL}/reunion/creer`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),
    
    updateReunion: (id, data) => fetch(`${API_BASE_URL}/reunion/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),
    
    deleteReunion: (id) => fetch(`${API_BASE_URL}/reunion/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    }),
};