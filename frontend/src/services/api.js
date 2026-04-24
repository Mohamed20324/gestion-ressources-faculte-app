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

    getBesoinsByEnseignant: (id) => fetch(`${API_BASE_URL}/besoins/enseignant/${id}`, { 
        headers: getHeaders() 
    }),

    createBesoin: (data) => fetch(`${API_BASE_URL}/besoins`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),

    updateBesoin: (id, data) => fetch(`${API_BASE_URL}/besoins/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),

    deleteBesoin: (id) => fetch(`${API_BASE_URL}/besoins/${id}`, {
        method: 'DELETE',
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

    getRessourcesByOffre: (id) => fetch(`${API_BASE_URL}/ressources/offre/${id}`, {
        headers: getHeaders()
    }),

    deleteRessourcesByOffre: (id) => fetch(`${API_BASE_URL}/ressources/offre/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    }),

    // Appels d'offres
    getAllAppelsOffresOuverts: () => fetch(`${API_BASE_URL}/appels-offres/ouverts`, { 
        headers: getHeaders() 
    }),
    publierAppelOffre: (id) => fetch(`${API_BASE_URL}/appels-offres/${id}/publier`, {
        method: 'PUT',
        headers: getHeaders()
    }),
    supprimerAppelOffre: (id) => fetch(`${API_BASE_URL}/appels-offres/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    }),
    retirerBesoinFromAO: (aoId, besoinId) => fetch(`${API_BASE_URL}/appels-offres/${aoId}/besoins/${besoinId}`, {
        method: 'DELETE',
        headers: getHeaders()
    }),
    
    createAppelOffre: (data) => fetch(`${API_BASE_URL}/appels-offres`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),

    addBesoinsToAppelOffre: (id, besoinIds) => fetch(`${API_BASE_URL}/appels-offres/${id}/besoins`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(besoinIds)
    }),

    getAffectationsByEnseignant: (id) => fetch(`${API_BASE_URL}/affectations/enseignant/${id}`, { 
        headers: getHeaders() 
    }),

    getAllAppelsOffres: () => fetch(`${API_BASE_URL}/appels-offres`, { headers: getHeaders() }),
    getAppelOffreById: (id) => fetch(`${API_BASE_URL}/appels-offres/${id}`, { headers: getHeaders() }),

    // Offres
    soumettreOffre: (data) => fetch(`${API_BASE_URL}/offres`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),
    
    getAllOffres: () => fetch(`${API_BASE_URL}/offres`, { headers: getHeaders() }),

    getOffresByAppelOffre: (id) => fetch(`${API_BASE_URL}/offres/appel-offre/${id}`, { 
        headers: getHeaders() 
    }),
    
    getMyOffres: (fournisseurId) => fetch(`${API_BASE_URL}/offres/fournisseur/${fournisseurId}`, {
        headers: getHeaders()
    }),

    accepterOffre: (id) => fetch(`${API_BASE_URL}/offres/${id}/accepter`, {
        method: 'PUT',
        headers: getHeaders()
    }),

    annulerAcceptation: (id) => fetch(`${API_BASE_URL}/offres/${id}/annuler-acceptation`, {
        method: 'PUT',
        headers: getHeaders()
    }),

    annulerReception: (id) => fetch(`${API_BASE_URL}/offres/${id}/annuler-reception`, {
        method: 'PUT',
        headers: getHeaders()
    }),

    rejeterOffre: (id, motif) => fetch(`${API_BASE_URL}/offres/${id}/rejeter?motif=${encodeURIComponent(motif)}`, {
        method: 'PUT',
        headers: getHeaders()
    }),

    eliminerOffre: (id, motif) => fetch(`${API_BASE_URL}/offres/${id}/eliminer?motif=${encodeURIComponent(motif)}`, {
        method: 'PUT',
        headers: getHeaders()
    }),

    getMoinsDisant: (aoId) => fetch(`${API_BASE_URL}/offres/appel-offre/${aoId}/moins-disant`, {
        headers: getHeaders()
    }),

    // Auth & Inscription
    registerFournisseur: (data) => fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }),

    updateFournisseurInfo: (id, data) => fetch(`${API_BASE_URL}/utilisateurs/fournisseur/${id}/completer`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),

    getFournisseurById: (id) => fetch(`${API_BASE_URL}/utilisateurs/${id}`, { 
        headers: getHeaders() 
    }),

    // Blacklist
    blacklistSupplier: (id, motif) => fetch(`${API_BASE_URL}/liste-noire/fournisseur/${id}?motif=${encodeURIComponent(motif)}`, {
        method: 'POST',
        headers: getHeaders()
    }),

    getBlacklistedSuppliers: () => fetch(`${API_BASE_URL}/liste-noire`, { 
        headers: getHeaders() 
    }),

    // Réunions
    getAllReunions: () => fetch(`${API_BASE_URL}/reunion`, { headers: getHeaders() }),

    // Maintenance
    createSignalement: (data) => fetch(`${API_BASE_URL}/signalements`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),

    getSignalementsByEnseignant: (id) => fetch(`${API_BASE_URL}/signalements/enseignant/${id}`, { 
        headers: getHeaders() 
    }),

    getSignalementsByTechnicien: (id) => fetch(`${API_BASE_URL}/signalements/technicien/${id}`, { 
        headers: getHeaders() 
    }),

    getAllSignalements: () => fetch(`${API_BASE_URL}/signalements`, { headers: getHeaders() }),

    resoudreSignalement: (id, technicienId) => fetch(`${API_BASE_URL}/signalements/${id}/resoudre?technicienId=${technicienId}`, {
        method: 'PUT',
        headers: getHeaders()
    }),

    annulerSignalement: (id) => fetch(`${API_BASE_URL}/signalements/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    }),

    getSignalementsByFournisseur: (fournisseurId) => fetch(`${API_BASE_URL}/signalements/fournisseur/${fournisseurId}`, { headers: getHeaders() }),
    
    programmerEchange: (id, date) => fetch(`${API_BASE_URL}/signalements/${id}/programmer-echange?date=${date}`, {
        method: 'PUT',
        headers: getHeaders()
    }),

    receptionnerEchange: (id) => fetch(`${API_BASE_URL}/signalements/${id}/receptionner-echange`, {
        method: 'PUT',
        headers: getHeaders()
    }),

    createConstat: (data) => fetch(`${API_BASE_URL}/constats`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),

    getAllConstats: () => fetch(`${API_BASE_URL}/constats`, { 
        headers: getHeaders() 
    }),

    envoyerAuFournisseur: (id) => fetch(`${API_BASE_URL}/constats/${id}/envoyer-fournisseur`, {
        method: 'PUT',
        headers: getHeaders()
    }),

    demanderEchange: (id) => fetch(`${API_BASE_URL}/constats/${id}/demander-echange`, {
        method: 'PUT',
        headers: getHeaders()
    }),
    
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

    // Types de Ressources
    getAllTypesRessources: () => fetch(`${API_BASE_URL}/types-ressources`, { 
        headers: getHeaders() 
    }),
    createTypeRessource: (data) => fetch(`${API_BASE_URL}/types-ressources`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),
    updateTypeRessource: (id, data) => fetch(`${API_BASE_URL}/types-ressources/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),
    deleteTypeRessource: (id) => fetch(`${API_BASE_URL}/types-ressources/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    }),

    // Notifications
    getNotifications: (userId) => 
        fetch(`${API_BASE_URL}/notifications/utilisateur/${userId}`, { headers: getHeaders() }),
    markNotificationAsRead: (id) =>
        fetch(`${API_BASE_URL}/notifications/${id}/lu`, { method: 'PUT', headers: getHeaders() }),
    createNotification: (data) => {
        const params = new URLSearchParams();
        if (data.utilisateurId || data.destinataireId) params.append('destinataireId', data.utilisateurId || data.destinataireId);
        if (data.expediteurId) params.append('expediteurId', data.expediteurId);
        if (data.message) params.append('message', data.message);
        if (data.type) params.append('type', data.type);
        
        return fetch(`${API_BASE_URL}/notifications?${params.toString()}`, {
            method: 'POST',
            headers: getHeaders()
        });
    },

    // Affectations
    createAffectation: (data) => fetch(`${API_BASE_URL}/affectations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    }),
    deleteAffectation: (id) => fetch(`${API_BASE_URL}/affectations/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    }),
    getAffectationByRessource: (id) => fetch(`${API_BASE_URL}/affectations/ressource/${id}`, {
        headers: getHeaders()
    }),
    getEnseignantsByDepartement: (id) => fetch(`${API_BASE_URL}/utilisateurs/departement/${id}/enseignants`, {
        headers: getHeaders()
    }),

    getAffectationsByDepartement: (id) => fetch(`${API_BASE_URL}/affectations/departement/${id}`, {
        headers: getHeaders()
    }),

    sendLateWarning: (fournisseurId, referenceAO) => fetch(`${API_BASE_URL}/notifications/retard/${fournisseurId}?referenceAO=${encodeURIComponent(referenceAO)}`, {
        method: 'POST',
        headers: getHeaders()
    }),

    getRessourcesByDepartement: (id) => fetch(`${API_BASE_URL}/ressources/departement/${id}`, {
        headers: getHeaders()
    }),

    getLateDeliveriesCount: () => fetch(`${API_BASE_URL}/offres/retards/count`, {
        headers: getHeaders()
    }),

    updateOffreStatus: (id, statut) => fetch(`${API_BASE_URL}/offres/${id}/statut?statut=${statut}`, {
        method: 'PUT',
        headers: getHeaders()
    }),

    sendLateReply: (responsableId, fournisseurId, message) => fetch(`${API_BASE_URL}/notifications/reponse-retard?responsableId=${responsableId}&fournisseurId=${fournisseurId}&message=${encodeURIComponent(message)}`, {
        method: 'POST',
        headers: getHeaders()
    }),
};