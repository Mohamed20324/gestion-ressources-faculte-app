import { useState, useEffect } from 'react';
import { 
  Plus, Search, Loader, FileText, Trash2, 
  AlertTriangle, CheckCircle, Clock, XCircle, 
  ChevronLeft, ChevronRight, Edit2, Send,
  Package, Info, Activity
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

interface Besoin {
  id: number;
  typeRessourceId: number;
  quantite: number;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE' | 'ENVOYE';
  departementId: number;
  reunionId: number;
  enseignantId?: number;
  description?: string;
  categorie: 'STANDARD' | 'ORDINATEUR' | 'IMPRIMANTE';
  cpu?: string;
  ram?: string;
  disqueDur?: string;
  ecran?: string;
  vitesseImpression?: number;
  resolution?: string;
  marque?: string;
}

const BesoinsPage = () => {
  const { user } = useAuth();
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [besoins, setBesoins] = useState<Besoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    typeRessourceId: '',
    quantite: 1,
    reunionId: '',
    description: '',
    marque: '',
    cpu: '',
    ram: '',
    disqueDur: '',
    ecran: '',
    vitesseImpression: 0,
    resolution: ''
  });

  const [typesRessources, setTypesRessources] = useState<any[]>([]);
  const [reunions, setReunions] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Get user details via API service if possible, or direct fetch
      const userRes = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      let deptId = null;
      if (userRes.ok) {
        const data = await userRes.json();
        setUserData(data);
        deptId = data.departementId;
      }

      // 2. Load Types
      const typesRes = await api.getAllTypesRessources();
      if (typesRes.ok) {
        setTypesRessources(await typesRes.json());
      }

      // 3. Load Data if dept exists
      if (deptId) {
        await Promise.all([
          loadBesoins(deptId),
          loadReunions(deptId)
        ]);
      }
    } catch (error) {
      console.error("Initial load error:", error);
      showNotification('error', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadBesoins = async (deptId: number) => {
    try {
      const response = await api.getBesoinsByDepartement(deptId);
      if (response.ok) {
        setBesoins(await response.json());
      }
    } catch (error) {
      console.error('Error loading besoins:', error);
    }
  };

  const loadReunions = async (deptId: number) => {
    try {
      const response = await api.getReunionsByDepartement(deptId);
      if (response.ok) {
        const data = await response.json();
        setReunions(data);
        if (data.length > 0 && !formData.reunionId) {
          setFormData(prev => ({ ...prev, reunionId: data[0].id.toString() }));
        }
      }
    } catch (error) {
      console.error('Error loading reunions:', error);
    }
  };

  const handleOpenModal = () => {
    setFormData({ 
      typeRessourceId: typesRessources[0]?.id?.toString() || '', 
      quantite: 1,
      reunionId: reunions[0]?.id?.toString() || '',
      description: '',
      marque: '',
      cpu: '',
      ram: '',
      disqueDur: '',
      ecran: '',
      vitesseImpression: 0,
      resolution: ''
    });
    setIsEditMode(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (besoin: Besoin) => {
    setFormData({
      typeRessourceId: besoin.typeRessourceId.toString(),
      quantite: besoin.quantite,
      reunionId: besoin.reunionId?.toString() || '',
      description: besoin.description || '',
      marque: besoin.marque || '',
      cpu: besoin.cpu || '',
      ram: besoin.ram || '',
      disqueDur: besoin.disqueDur || '',
      ecran: besoin.ecran || '',
      vitesseImpression: besoin.vitesseImpression || 0,
      resolution: besoin.resolution || ''
    });
    setIsEditMode(true);
    setEditingId(besoin.id);
    setIsModalOpen(true);
  };

  const handleSendToResponsible = async () => {
    if (!userData?.departementId) return;
    setSaving(true);
    try {
      const needsToSend = besoins.filter(b => b.statut === 'VALIDE');
      if (needsToSend.length === 0) {
        showNotification('info', 'Aucun besoin validé à envoyer.');
        setSaving(false);
        return;
      }

      await Promise.all(needsToSend.map(b => 
        api.updateBesoin(b.id, { ...b, statut: 'ENVOYE' })
      ));

      showNotification('success', 'Besoins envoyés au responsable !');
      loadBesoins(userData.departementId);
    } catch (error) {
      showNotification('error', 'Erreur lors de l\'envoi');
    } finally {
      setSaving(false);
    }
  };

  const handleValidateBesoin = async (besoin: Besoin) => {
    try {
      const response = await api.updateBesoin(besoin.id, {
        ...besoin,
        statut: 'VALIDE'
      });
      if (response.ok) {
        showNotification('success', 'Besoin validé');
        loadBesoins(userData.departementId);
      }
    } catch (error) {
      showNotification('error', 'Erreur de validation');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.departementId) return;
    
    setSaving(true);
    try {
      const selectedType = typesRessources.find(t => t.id === parseInt(formData.typeRessourceId));
      const payload = {
        typeRessourceId: parseInt(formData.typeRessourceId),
        quantite: formData.quantite,
        reunionId: parseInt(formData.reunionId),
        departementId: userData.departementId,
        description: formData.description,
        statut: isEditMode ? (besoins.find(b => b.id === editingId)?.statut || 'EN_ATTENTE') : 'EN_ATTENTE',
        categorie: selectedType?.code === 'ORDINATEUR' ? 'ORDINATEUR' : (selectedType?.code === 'IMPRIMANTE' ? 'IMPRIMANTE' : 'STANDARD'),
        enseignantId: user.role === 'ENSEIGNANT' ? user.id : (isEditMode ? besoins.find(b => b.id === editingId)?.enseignantId : null),
        marque: formData.marque,
        cpu: formData.cpu,
        ram: formData.ram,
        disqueDur: formData.disqueDur,
        ecran: formData.ecran,
        vitesseImpression: formData.vitesseImpression,
        resolution: formData.resolution
      };

      const response = isEditMode && editingId
        ? await api.updateBesoin(editingId, { ...payload, id: editingId })
        : await api.createBesoin(payload);

      if (response.ok) {
        showNotification('success', isEditMode ? 'Besoin modifié' : 'Besoin soumis');
        setIsModalOpen(false);
        loadBesoins(userData.departementId);
      } else {
        showNotification('error', 'Erreur lors de la soumission');
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete || !userData?.departementId) return;
    setDeleting(true);
    try {
      const response = await api.deleteBesoin(itemToDelete);
      if (response.ok) {
        showNotification('success', 'Besoin supprimé');
        setBesoins(besoins.filter(b => b.id !== itemToDelete));
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      showNotification('error', 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const filteredBesoins = besoins.filter(b => {
    const typeName = typesRessources.find(t => t.id === b.typeRessourceId)?.libelle || '';
    return typeName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredBesoins.length / itemsPerPage);
  const currentItems = filteredBesoins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'VALIDE': return 'bg-green-100 text-green-700 border-green-200';
      case 'ENVOYE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'REJETE': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VALIDE': return <CheckCircle size={14} />;
      case 'ENVOYE': return <Send size={14} />;
      case 'REJETE': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <Loader className="animate-spin text-purple-600" size={48} />
        <p className="text-gray-500 font-medium animate-pulse">Chargement de vos besoins...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen pb-20">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-200">
              <FileText size={28} />
            </div>
            Mes Besoins
          </h1>
          <p className="text-gray-500 mt-2">Gérez et suivez vos demandes de ressources pour le département.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un besoin..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
          >
            <Plus size={20} />
            Nouveau Besoin
          </button>
          
          {user.role === 'CHEF_DEPARTEMENT' && (
            <button 
              onClick={handleSendToResponsible}
              disabled={saving || besoins.filter(b => b.statut === 'VALIDE').length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              <Send size={20} />
              Transmettre au Responsable
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Type & Catégorie</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Quantité</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentItems.map((besoin) => {
                const type = typesRessources.find(t => t.id === besoin.typeRessourceId);
                const typeName = type?.libelle || 'Type Inconnu';
                return (
                  <tr key={besoin.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100 group-hover:scale-110 transition-transform">
                          <Package size={22} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-base">{typeName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{besoin.categorie}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl font-bold text-gray-700 border border-gray-100">
                          {besoin.quantite}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border flex items-center gap-2 w-fit ${getStatusStyle(besoin.statut)}`}>
                        {getStatusIcon(besoin.statut)}
                        {besoin.statut.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.role === 'CHEF_DEPARTEMENT' && besoin.statut === 'EN_ATTENTE' && (
                          <button 
                            onClick={() => handleValidateBesoin(besoin)}
                            className="p-3 text-green-600 hover:bg-green-50 rounded-2xl transition-all hover:scale-110"
                            title="Valider"
                          >
                            <CheckCircle size={20} />
                          </button>
                        )}
                        {besoin.statut === 'EN_ATTENTE' && (user.role === 'CHEF_DEPARTEMENT' || besoin.enseignantId === user.id) && (
                          <button 
                            onClick={() => handleEditClick(besoin)}
                            className="p-3 text-blue-600 hover:bg-blue-50 rounded-2xl transition-all hover:scale-110"
                            title="Modifier"
                          >
                            <Edit2 size={20} />
                          </button>
                        )}
                        {(
                          (besoin.statut === 'EN_ATTENTE' && (user.role === 'CHEF_DEPARTEMENT' || besoin.enseignantId === user.id)) || 
                          (user.role === 'CHEF_DEPARTEMENT' && besoin.statut === 'VALIDE')
                        ) && (
                          <button 
                            onClick={() => handleDeleteClick(besoin.id)}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-2xl transition-all hover:scale-110"
                            title="Supprimer"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                        {besoin.description && (
                          <div className="group/info relative">
                            <div className="p-3 text-gray-400 hover:bg-gray-50 rounded-2xl cursor-help">
                              <Info size={20} />
                            </div>
                            <div className="absolute bottom-full right-0 mb-2 w-64 p-4 bg-gray-900 text-white text-xs rounded-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-50 shadow-xl">
                              {besoin.description}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredBesoins.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <FileText className="text-gray-200" size={40} />
              </div>
              <p className="text-gray-500 text-xl font-medium">Aucun besoin trouvé</p>
              <p className="text-gray-400 text-sm mt-2">Commencez par ajouter un nouveau besoin pour votre département.</p>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-8 py-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">
            Page <span className="font-bold text-gray-900">{currentPage}</span> sur <span className="font-bold text-gray-900">{totalPages}</span>
          </p>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p-1))}
              disabled={currentPage === 1}
              className="p-3 border border-gray-100 rounded-2xl disabled:opacity-30 hover:bg-gray-50 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
              disabled={currentPage === totalPages}
              className="p-3 border border-gray-100 rounded-2xl disabled:opacity-30 hover:bg-gray-50 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Modals are unchanged but included for completeness in re-write */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-10 shadow-2xl animate-in fade-in zoom-in duration-300 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                  <Plus size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Modifier le Besoin' : 'Nouveau Besoin'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                <XCircle size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Type de Ressource</label>
                  <select 
                    required
                    value={formData.typeRessourceId}
                    onChange={(e) => setFormData({...formData, typeRessourceId: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-[1.5rem] focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-700"
                  >
                    <option value="">Choisir un type...</option>
                    {typesRessources.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.libelle}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Quantité</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    value={formData.quantite}
                    onChange={(e) => setFormData({...formData, quantite: parseInt(e.target.value)})}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-[1.5rem] focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Réunion Associée</label>
                <select 
                  required
                  value={formData.reunionId}
                  onChange={(e) => setFormData({...formData, reunionId: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-[1.5rem] focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-700"
                >
                  <option value="">Associer à une réunion...</option>
                  {reunions.map((r: any) => {
                    const dateStr = Array.isArray(r.date) ? `${r.date[2]}/${r.date[1]}/${r.date[0]}` : r.date;
                    return (
                      <option key={r.id} value={r.id}>
                        Réunion #{r.id} - {dateStr}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Notes & Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-[1.5rem] focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium min-h-[120px]"
                  placeholder="Détails sur l'utilisation prévue, spécificités..."
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 px-6 border border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-[2] py-4 px-6 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader className="animate-spin" size={20} /> : (isEditMode ? 'Sauvegarder' : 'Soumettre')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-10 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-600 mb-6">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Supprimer la demande ?</h2>
              <p className="text-gray-500 text-sm mb-10 leading-relaxed">
                Cette action supprimera définitivement ce besoin. <br/>Vous ne pourrez pas revenir en arrière.
              </p>
              
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-xl shadow-red-100 hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleting ? <Loader className="animate-spin" size={20} /> : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BesoinsPage;
