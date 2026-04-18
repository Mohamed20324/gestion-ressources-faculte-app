import { useState, useEffect } from 'react';
import { 
  Plus, Search, Loader, FileText, Trash2, 
  AlertTriangle, CheckCircle, Clock, XCircle, 
  ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

interface Besoin {
  id: number;
  typeRessourceId: number;
  quantite: number;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE';
  departementId: number;
  reunionId: number;
  enseignantId?: number;
  description?: string;
}

const BesoinsPage = () => {
  const { user } = useAuth();
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [besoins, setBesoins] = useState<Besoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    typeRessourceId: '',
    quantite: 1,
    reunionId: '',
    description: ''
  });

  const [typesRessources, setTypesRessources] = useState<any[]>([]);
  const [reunions, setReunions] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Get user details
      const userRes = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (userRes.ok) {
        const data = await userRes.json();
        setUserData(data);
        
        // 2. Load Besoins
        if (data.departementId) {
          loadBesoins(data.departementId);
          loadReunions(data.departementId);
        }
      }

      // 3. Load Resource Types
      const typesRes = await api.getAllTypesRessources();
      if (typesRes.ok) {
        setTypesRessources(await typesRes.json());
      }

    } catch (error) {
      showNotification('error', 'Erreur de chargement');
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
        // Default to the most recent meeting if possible
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, reunionId: data[0].id }));
        }
      }
    } catch (error) {
      console.error('Error loading reunions:', error);
    }
  };

  const handleOpenModal = () => {
    setFormData({ 
      typeRessourceId: typesRessources[0]?.id || '', 
      quantite: 1,
      reunionId: reunions[0]?.id || '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.departementId) return;
    if (!formData.typeRessourceId || !formData.reunionId) {
      showNotification('error', 'Veuillez sélectionner un type et une réunion');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        typeRessourceId: parseInt(formData.typeRessourceId as string),
        quantite: formData.quantite,
        reunionId: parseInt(formData.reunionId as string),
        departementId: userData.departementId,
        description: formData.description,
        statut: 'EN_ATTENTE',
        categorie: 'STANDARD',
        enseignantId: user.role === 'ENSEIGNANT' ? user.id : null
      };

      const response = await api.createBesoin(payload);
      if (response.ok) {
        showNotification('success', 'Besoin soumis avec succès');
        setIsModalOpen(false);
        loadBesoins(userData.departementId);
      } else {
        const errData = await response.json();
        showNotification('error', errData.message || 'Erreur lors de la soumission');
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
      } else {
        showNotification('error', 'Impossible de supprimer ce besoin');
      }
    } catch (error) {
      showNotification('error', 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const handleIncreaseQuantity = async (besoin: Besoin) => {
    if (besoin.statut !== 'EN_ATTENTE') return;
    
    try {
      const response = await api.updateBesoin(besoin.id, {
        ...besoin,
        quantite: besoin.quantite + 1
      });
      
      if (response.ok) {
        showNotification('success', 'Quantité augmentée');
        setBesoins(besoins.map(b => b.id === besoin.id ? { ...b, quantite: b.quantite + 1 } : b));
      } else {
        showNotification('error', 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
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
      case 'REJETE': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VALIDE': return <CheckCircle size={14} />;
      case 'REJETE': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen pb-20">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="text-purple-600" size={32} />
            Mes Besoins en Ressources
          </h1>
          <p className="text-gray-500 mt-1">Exprimez vos besoins en matériel pour votre département.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
          >
            <Plus size={20} />
            Nouveau Besoin
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-purple-600">
          <Loader className="animate-spin" size={40} />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Type de Ressource</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Quantité</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentItems.map((besoin) => {
                    const typeName = typesRessources.find(t => t.id === besoin.typeRessourceId)?.libelle || 'Type Inconnu';
                    return (
                      <tr key={besoin.id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100">
                              <FileText size={20} />
                            </div>
                            <span className="font-bold text-gray-900">{typeName}</span>
                          </div>
                        </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-gray-600">{besoin.quantite}</span>
                          {besoin.statut === 'EN_ATTENTE' && (
                            <button 
                              onClick={() => handleIncreaseQuantity(besoin)}
                              className="p-1 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors"
                              title="Augmenter la quantité"
                            >
                              <Plus size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 w-fit ${getStatusStyle(besoin.statut)}`}>
                          {getStatusIcon(besoin.statut)}
                          {besoin.statut}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right text-purple-600">
                        {besoin.statut === 'EN_ATTENTE' && (
                          <button 
                            onClick={() => handleDeleteClick(besoin.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
            
            {filteredBesoins.length === 0 && (
              <div className="text-center py-20">
                <FileText className="mx-auto text-gray-200 mb-4" size={64} />
                <p className="text-gray-500 text-lg font-medium">Aucun besoin soumis pour le moment.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-8 py-5 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 hidden sm:block">
                Affichage de <span className="font-bold text-gray-900">{currentItems.length}</span> sur <span className="font-bold text-gray-900">{filteredBesoins.length}</span> besoins
              </p>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p-1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        currentPage === i + 1 
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' 
                          : 'text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* New Besoin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Nouveau Besoin</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Type de Ressource</label>
                <select 
                  required
                  value={formData.typeRessourceId}
                  onChange={(e) => setFormData({...formData, typeRessourceId: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium"
                >
                  <option value="">Sélectionner un type...</option>
                  {typesRessources.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.libelle}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Quantité</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    value={formData.quantite}
                    onChange={(e) => setFormData({...formData, quantite: parseInt(e.target.value)})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Réunion</label>
                  <select 
                    required
                    value={formData.reunionId}
                    onChange={(e) => setFormData({...formData, reunionId: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium"
                  >
                    <option value="">Sélectionner une réunion...</option>
                    {reunions.map((r: any) => {
                      const dateStr = Array.isArray(r.date) ? `${r.date[2]}/${r.date[1]}/${r.date[0]}` : r.date;
                      return (
                        <option key={r.id} value={r.id}>
                          Réunion #{r.id} - {dateStr} ({r.heure})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Description (Optionnel)</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium min-h-[100px]"
                  placeholder="Détails supplémentaires..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 px-6 border border-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-[2] py-4 px-6 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader className="animate-spin" size={20} /> : 'Soumettre le besoin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Supprimer le besoin</h2>
              <p className="text-gray-500 text-sm mb-8">
                Êtes-vous sûr de vouloir supprimer cette demande ? Cette action est irréversible.
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleting ? <Loader className="animate-spin" size={18} /> : 'Supprimer'}
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
