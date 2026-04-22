import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Loader, Calendar, 
  FileText, Clock, ChevronLeft, ChevronRight, 
  Edit, Trash2, DollarSign, Send, 
  X, CheckCircle, Package, ArrowRight,
  Info, MoreHorizontal, LayoutGrid, List as ListIcon,
  Archive, FileCheck
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { NotificationContainer } from '../../../components/Notification';
import { useNotifications } from '../../../hooks/useNotifications';

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
        showNotification('success', 'Brouillon créé avec succès');
        loadData();
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
        const filtered = allBesoins.filter((b: any) => b.appelOffreId === ao.id);
        setAoBesoins(filtered);
      }
    } catch (error) {
      showNotification('error', 'Erreur de chargement');
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
    if (!window.confirm("Retirer ce besoin du dossier ?")) return;
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
    if (!window.confirm("Voulez-vous publier ce marché ? Cette action est irréversible.")) return;
    try {
      const res = await api.publierAppelOffre(id);
      if (res.ok) {
        showNotification('success', 'Marché publié');
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

  const formatDate = (dateStr: any) => {
    if (!dateStr) return 'N/A';
    try {
      if (Array.isArray(dateStr)) {
        return `${dateStr[2].toString().padStart(2, '0')}/${dateStr[1].toString().padStart(2, '0')}/${dateStr[0]}`;
      }
      return new Date(dateStr).toLocaleDateString('fr-FR');
    } catch (e) { return dateStr; }
  };

  const filteredAppels = appels.filter(a => 
    a.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.statut.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItems = filteredAppels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredAppels.length / itemsPerPage);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'OUVERT': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'BROUILLON': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'CLOTURE': return 'bg-slate-50 text-slate-700 border-slate-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="p-8 bg-gray-50/30 min-h-full pb-8">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="max-w-[1400px] mx-auto">
        {/* Header section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              Marchés & Appels d'Offres
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Gestion du cycle de vie des marchés publics, de la planification à l'attribution.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher par référence..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-medium transition-all shadow-sm"
              />
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Nouveau Dossier
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Archive size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Dossiers</p>
                <p className="text-2xl font-bold text-gray-900">{appels.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">En Brouillon</p>
                <p className="text-2xl font-bold text-gray-900">{appels.filter(a => a.statut === 'BROUILLON').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <FileCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Marchés Ouverts</p>
                <p className="text-2xl font-bold text-gray-900">{appels.filter(a => a.statut === 'OUVERT').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="grid grid-cols-1 gap-4">
          {currentItems.map((appel) => (
            <div key={appel.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-blue-200 transition-all group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${
                    appel.statut === 'BROUILLON' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                    appel.statut === 'OUVERT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    <FileText size={28} />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-900 truncate">{appel.reference}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(appel.statut)}`}>
                        {appel.statut}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <Calendar size={14} className="text-gray-400" />
                        <span>Du {formatDate(appel.dateDebut)} au {formatDate(appel.dateFin)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <Package size={14} className="text-gray-400" />
                        <span>{appel.besoinIds?.length || 0} besoins rattachés</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {appel.statut === 'BROUILLON' ? (
                    <>
                      <button 
                        onClick={() => handlePublish(appel.id)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all text-sm shadow-sm"
                      >
                        <Send size={16} /> Publier
                      </button>
                      <button 
                        onClick={() => handleOpenEditModal(appel)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-all text-sm border border-blue-100"
                      >
                        <Edit size={16} /> Gérer
                      </button>
                      <button 
                        onClick={() => handleDelete(appel.id)}
                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => navigate(`/responsable/appels-offres/${appel.id}/offres`)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all text-sm shadow-sm"
                      >
                        <DollarSign size={16} /> Consulter les Offres
                      </button>
                      <button className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl transition-all">
                        <MoreHorizontal size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredAppels.length === 0 && (
            <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <Info className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-500 font-bold">Aucun appel d'offre ne correspond à votre recherche.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                  currentPage === i + 1 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Create AO Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Nouveau Marché</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreateAO} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Référence Dossier</label>
                <input 
                  required
                  type="text"
                  placeholder="ex: AO/2026/MAT-INFO"
                  value={newAO.reference}
                  onChange={e => setNewAO({...newAO, reference: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Date Lancement</label>
                  <input required type="date" value={newAO.dateDebut} onChange={e => setNewAO({...newAO, dateDebut: e.target.value})} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Échéance</label>
                  <input required type="date" value={newAO.dateFin} onChange={e => setNewAO({...newAO, dateFin: e.target.value})} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-bold" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                {saving ? <Loader className="animate-spin" size={24} /> : 'Créer le Brouillon'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Needs Modal */}
      {isEditModalOpen && selectedAO && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-2xl p-8 shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gestion des Besoins</h2>
                <p className="text-sm font-medium text-blue-600 mt-0.5">{selectedAO.reference}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {actionLoading ? (
                <div className="py-20 text-center">
                  <Loader className="animate-spin mx-auto text-blue-600" size={32} />
                </div>
              ) : (
                <div className="space-y-3">
                  {aoBesoins.map((besoin) => {
                    const typeName = typesRessources.find(t => t.id === besoin.typeRessourceId)?.libelle || 'Inconnu';
                    return (
                      <div key={besoin.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 border border-gray-200">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{typeName}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Département {besoin.departementId}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                            <button onClick={() => handleUpdateBesoinQuantity(besoin.id, besoin.quantite - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded text-gray-500 font-bold">-</button>
                            <input type="number" value={besoin.quantite} className="w-10 text-center font-bold text-sm outline-none" readOnly />
                            <button onClick={() => handleUpdateBesoinQuantity(besoin.id, besoin.quantite + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded text-gray-500 font-bold">+</button>
                          </div>
                          <button 
                            onClick={() => handleRemoveBesoin(besoin.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {aoBesoins.length === 0 && (
                    <div className="py-16 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-400 text-sm font-medium">Aucun besoin n'est rattaché à ce dossier.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppelsOffresPage;


