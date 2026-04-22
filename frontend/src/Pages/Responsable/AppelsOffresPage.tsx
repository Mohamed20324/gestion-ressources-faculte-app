import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Loader, Calendar, 
  FileText, Clock, ChevronLeft, ChevronRight, 
  Edit, Trash2, DollarSign, Send, 
  X, CheckCircle, Package, ArrowRight,
  Info
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

interface AppelOffre {
  id: number;
  reference: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  besoinIds: number[];
}

const AppelsOffresPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, showNotification, removeNotification } = useNotifications();
  
  const [appels, setAppels] = useState<AppelOffre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAO, setSelectedAO] = useState<any>(null);
  const [aoBesoins, setAoBesoins] = useState<any[]>([]);
  const [typesRessources, setTypesRessources] = useState<any[]>([]);
  
  const [newAO, setNewAO] = useState({ 
    reference: '', 
    dateDebut: new Date().toISOString().split('T')[0], 
    dateFin: '' 
  });
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appelsRes, typesRes] = await Promise.all([
        api.getAllAppelsOffres(),
        api.getAllTypesRessources()
      ]);
      
      if (appelsRes.ok) {
        setAppels(await appelsRes.json());
      }
      if (typesRes.ok) {
        setTypesRessources(await typesRes.json());
      }
    } catch (error) {
      showNotification('error', 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAO = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.createAppelOffre({
        ...newAO,
        statut: 'BROUILLON',
        responsableId: user?.id
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewAO({ reference: '', dateDebut: new Date().toISOString().split('T')[0], dateFin: '' });
        showNotification('success', 'Brouillon d\'appel d\'offre créé');
        loadData();
      } else {
        const err = await res.json();
        showNotification('error', err.message || 'Erreur lors de la création');
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditModal = async (ao: AppelOffre) => {
    setSelectedAO(ao);
    setIsEditModalOpen(true);
    setActionLoading(true);
    try {
      const allBesoinsRes = await api.getAllBesoins();
      if (allBesoinsRes.ok) {
        const allBesoins = await allBesoinsRes.json();
        // Filter needs that belong to this AO
        const filtered = allBesoins.filter((b: any) => b.appelOffreId === ao.id);
        setAoBesoins(filtered);
      }
    } catch (error) {
      showNotification('error', 'Erreur de chargement des besoins');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateBesoinQuantity = async (besoinId: number, newQty: number) => {
    if (newQty < 1) return;
    try {
      const res = await api.updateBesoin(besoinId, { quantite: newQty });
      if (res.ok) {
        setAoBesoins(prev => prev.map(b => b.id === besoinId ? { ...b, quantite: newQty } : b));
        showNotification('success', 'Quantité mise à jour');
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    }
  };

  const handleRemoveBesoin = async (besoinId: number) => {
    if (!window.confirm("Retirer ce besoin de l'appel d'offre ?")) return;
    try {
      const res = await api.retirerBesoinFromAO(selectedAO.id, besoinId);
      if (res.ok) {
        setAoBesoins(prev => prev.filter(b => b.id !== besoinId));
        showNotification('success', 'Besoin retiré');
        loadData();
      }
    } catch (error) {
      showNotification('error', 'Erreur lors du retrait');
    }
  };

  const handlePublish = async (id: number) => {
    if (!window.confirm("Publier cet appel d'offre ? Il deviendra visible pour les fournisseurs.")) return;
    try {
      const res = await api.publierAppelOffre(id);
      if (res.ok) {
        showNotification('success', 'Appel d\'offre publié avec succès !');
        loadData();
      }
    } catch (error) {
      showNotification('error', 'Erreur de publication');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer ce brouillon ?")) return;
    try {
      const res = await api.supprimerAppelOffre(id);
      if (res.ok) {
        showNotification('success', 'Brouillon supprimé');
        loadData();
      }
    } catch (error) {
      showNotification('error', 'Erreur de suppression');
    }
  };

  const filteredAppels = appels.filter(a => 
    a.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.statut.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItems = filteredAppels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredAppels.length / itemsPerPage);

  const formatDate = (dateStr: any) => {
    if (!dateStr) return 'N/A';
    try {
      if (Array.isArray(dateStr)) {
        return `${dateStr[2].toString().padStart(2, '0')}/${dateStr[1].toString().padStart(2, '0')}/${dateStr[0]}`;
      }
      return new Date(dateStr).toLocaleDateString();
    } catch (e) { return dateStr; }
  };

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen pb-24">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <FileText className="text-purple-600" size={40} />
            Marchés & Appels d'Offres
          </h1>
          <p className="text-gray-500 font-medium mt-1 italic">Gérez vos listes de besoins avant publication officielle.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher un dossier..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-bold transition-all shadow-xl shadow-gray-100/50"
            />
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-14 h-14 bg-purple-600 text-white rounded-2xl shadow-2xl shadow-purple-200 hover:bg-purple-700 transition-all flex items-center justify-center active:scale-90"
            title="Nouveau Brouillon"
          >
            <Plus size={32} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        {currentItems.map((appel) => (
          <div key={appel.id} className={`bg-white rounded-[2.5rem] p-8 border ${appel.statut === 'BROUILLON' ? 'border-dashed border-purple-200 bg-purple-50/10' : 'border-gray-100'} shadow-xl group transition-all`}>
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border ${
                    appel.statut === 'BROUILLON' ? 'bg-purple-100 text-purple-600 border-purple-200' : 
                    appel.statut === 'OUVERT' ? 'bg-green-100 text-green-600 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>
                    <FileText size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-black text-gray-900">{appel.reference}</h3>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                        appel.statut === 'BROUILLON' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                        appel.statut === 'OUVERT' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-600 border-gray-100'
                      }`}>
                        {appel.statut}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 font-bold mt-1">ID Marché : #AO-{appel.id}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar size={12} className="text-purple-400" /> Date Lancement
                    </p>
                    <p className="font-bold text-gray-700">{formatDate(appel.dateDebut)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock size={12} className="text-red-400" /> Date Échéance
                    </p>
                    <p className="font-bold text-gray-700">{formatDate(appel.dateFin)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Package size={12} className="text-blue-400" /> Besoins
                    </p>
                    <p className="font-bold text-gray-700">{appel.besoinIds?.length || 0} items</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-3 lg:w-56">
                {appel.statut === 'BROUILLON' ? (
                  <>
                    <button 
                      onClick={() => handlePublish(appel.id)}
                      className="w-full py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                    >
                      <Send size={18} /> Publier
                    </button>
                    <button 
                      onClick={() => handleOpenEditModal(appel)}
                      className="w-full py-4 bg-purple-50 text-purple-700 rounded-2xl font-black hover:bg-purple-100 transition-all flex items-center justify-center gap-2 border border-purple-100"
                    >
                      <Edit size={18} /> Gérer Besoins
                    </button>
                    <button 
                      onClick={() => handleDelete(appel.id)}
                      className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-100"
                    >
                      <Trash2 size={18} /> Supprimer
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => navigate(`/responsable/appels-offres/${appel.id}/offres`)}
                      className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl"
                    >
                      <DollarSign size={18} /> Voir Offres
                    </button>
                    <div className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase">Marché Actif</p>
                      <p className="text-xs font-bold text-gray-600 mt-1">Non modifiable</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredAppels.length === 0 && (
          <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200 shadow-sm">
            <Info className="mx-auto text-gray-200 mb-4" size={64} />
            <p className="text-gray-500 font-bold text-xl">Aucun appel d'offre trouvé.</p>
          </div>
        )}
      </div>

      {/* Create AO Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-gray-900">Nouveau Dossier</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreateAO} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Référence Dossier</label>
                <input 
                  required
                  type="text"
                  placeholder="ex: AO-PC-2026-001"
                  value={newAO.reference}
                  onChange={e => setNewAO({...newAO, reference: e.target.value.toUpperCase()})}
                  className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-bold text-gray-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Début</label>
                  <input required type="date" value={newAO.dateDebut} onClick={(e) => (e.target as HTMLInputElement).showPicker()} onChange={e => setNewAO({...newAO, dateDebut: e.target.value})} className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl font-bold cursor-pointer" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Échéance</label>
                  <input required type="date" value={newAO.dateFin} onClick={(e) => (e.target as HTMLInputElement).showPicker()} onChange={e => setNewAO({...newAO, dateFin: e.target.value})} className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl font-bold cursor-pointer" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full py-5 bg-purple-600 text-white rounded-3xl font-black hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 flex items-center justify-center gap-2">
                {saving ? <Loader className="animate-spin" size={24} /> : 'Enregistrer Brouillon'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Needs Modal */}
      {isEditModalOpen && selectedAO && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] p-10 shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                  <Edit className="text-purple-600" />
                  Gérer les Besoins
                </h2>
                <p className="text-gray-500 font-bold mt-1">Dossier : <span className="text-purple-600">{selectedAO.reference}</span></p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all">
                <X size={28} className="text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              {actionLoading ? (
                <div className="py-20 text-center">
                  <Loader className="animate-spin mx-auto text-purple-600" size={48} />
                </div>
              ) : (
                <div className="space-y-4">
                  {aoBesoins.map((besoin) => {
                    const typeName = typesRessources.find(t => t.id === besoin.typeRessourceId)?.libelle || 'Inconnu';
                    return (
                      <div key={besoin.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:bg-white hover:shadow-lg transition-all">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 border border-gray-100 shadow-sm">
                            <Package size={24} />
                          </div>
                          <div>
                            <p className="text-lg font-black text-gray-900">{typeName}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                              DEPT #{besoin.departementId} <ArrowRight size={10} /> Besoins #{besoin.id}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-8">
                          <div className="flex items-center gap-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase">Quantité</p>
                            <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                              <button 
                                onClick={() => handleUpdateBesoinQuantity(besoin.id, besoin.quantite - 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-lg text-gray-500 font-black"
                              >-</button>
                              <input 
                                type="number" 
                                value={besoin.quantite} 
                                onChange={(e) => handleUpdateBesoinQuantity(besoin.id, parseInt(e.target.value))}
                                className="w-12 text-center font-black text-purple-600 outline-none"
                              />
                              <button 
                                onClick={() => handleUpdateBesoinQuantity(besoin.id, besoin.quantite + 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-lg text-gray-500 font-black"
                              >+</button>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleRemoveBesoin(besoin.id)}
                            className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Supprimer de la liste"
                          >
                            <Trash2 size={24} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {aoBesoins.length === 0 && (
                    <div className="py-20 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                      <p className="text-gray-400 font-bold">Aucun besoin dans ce dossier.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end gap-4">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-gray-800 transition-all"
              >
                Terminer la modification
              </button>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-12 h-12 rounded-2xl font-black text-sm transition-all ${
                currentPage === i + 1 
                  ? 'bg-purple-600 text-white shadow-xl shadow-purple-200 scale-110' 
                  : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppelsOffresPage;
