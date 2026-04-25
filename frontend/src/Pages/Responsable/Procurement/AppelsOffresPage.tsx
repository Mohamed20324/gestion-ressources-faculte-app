import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Loader, Calendar, 
  FileText, Clock, ChevronLeft, ChevronRight, 
  Edit, Trash2, DollarSign, Send, 
  X, CheckCircle, Package, ArrowRight,
  Info, MoreHorizontal, LayoutGrid, List as ListIcon,
  Archive, FileCheck, Eye, User,
  ShieldAlert, Award, ChevronDown, ChevronUp, XCircle
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
  besoins: any[];
  offresCount: number;
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
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [newAO, setNewAO] = useState({ 
    reference: '', 
    dateDebut: new Date().toISOString().split('T')[0], 
    dateFin: '' 
  });
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isOffresModalOpen, setIsOffresModalOpen] = useState(false);
  const [offres, setOffres] = useState<any[]>([]);
  const [offresLoading, setOffresLoading] = useState(false);
  const [showMotifModal, setShowMotifModal] = useState({ show: false, offreId: null, action: '' });
  const [motif, setMotif] = useState('');
  const [expandedOffre, setExpandedOffre] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appelsRes, typesRes, deptsRes, allOffresRes] = await Promise.all([
        api.getAllAppelsOffres(),
        api.getAllTypesRessources(),
        api.getAllDepartements(),
        api.getAllOffres()
      ]);
      
      let allAppels: AppelOffre[] = [];
      if (appelsRes.ok) {
        allAppels = await appelsRes.json();
      }

      let allOffres: any[] = [];
      if (allOffresRes.ok) {
        allOffres = await allOffresRes.json();
      }

      // Map offer counts to calls
      const mappedAppels = allAppels.map(ao => ({
        ...ao,
        offresCount: allOffres.filter(o => o.appelOffreId === ao.id).length
      }));

      setAppels(mappedAppels);

      if (typesRes.ok) {
        setTypesRessources(await typesRes.json());
      }
      if (deptsRes.ok) {
        setDepartments(await deptsRes.json());
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

  const handleOpenEditModal = async (ao: any) => {
    setSelectedAO(ao);
    setIsEditModalOpen(true);
    // Directly use the needs linked in the AO object
    setAoBesoins(ao.besoins || []);
  };

  const handleOpenOffresModal = async (ao: any) => {
    setSelectedAO(ao);
    setIsOffresModalOpen(true);
    setOffresLoading(true);
    try {
      const res = await api.getOffresByAppelOffre(ao.id);
      if (res.ok) {
        setOffres(await res.json());
      }
    } catch (error) {
      showNotification('error', 'Erreur de chargement des offres');
    } finally {
      setOffresLoading(false);
    }
  };

  const handleAcceptOffre = async (offreId: number) => {
    if (!window.confirm("Accepter cette offre ? Cette action est définitive et rejettera automatiquement toutes les autres propositions pour ce marché.")) return;
    setActionLoading(true);
    try {
      const res = await api.accepterOffre(offreId);
      if (res.ok) {
        showNotification('success', 'Offre acceptée avec succès ! Le marché est désormais clôturé.');
        // Refresh both modal and main list
        handleOpenOffresModal(selectedAO);
        loadData();
      } else {
        const errorData = await res.json();
        showNotification('error', errorData.message || 'Le serveur a refusé l\'acceptation');
      }
    } catch (error) {
      showNotification('error', 'Erreur lors de l\'acceptation (vérifiez votre connexion)');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActionWithMotif = async () => {
    if (!motif) return;
    setActionLoading(true);
    try {
      const res = showMotifModal.action === 'REJETER' 
        ? await api.rejeterOffre(showMotifModal.offreId!, motif)
        : await api.eliminerOffre(showMotifModal.offreId!, motif);
      
      if (res.ok) {
        showNotification('success', `Action de ${showMotifModal.action.toLowerCase()} effectuée avec succès.`);
        setShowMotifModal({ show: false, offreId: null, action: '' });
        setMotif('');
        handleOpenOffresModal(selectedAO);
        loadData();
      } else {
        const errorData = await res.json();
        showNotification('error', errorData.message || 'L\'action a échoué');
      }
    } catch (error) {
      showNotification('error', 'Erreur technique lors du traitement du motif');
    } finally {
      setActionLoading(false);
    }
  };

  const identifyMoinsDisant = () => {
    if (offres.length === 0) return;
    const sorted = [...offres].sort((a, b) => a.prixTotal - b.prixTotal);
    showNotification('info', `Le moins disant est ${sorted[0].fournisseurNom} (${sorted[0].prixTotal} MAD)`);
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
  const handleImportAvailableNeeds = async () => {
    if (!selectedAO) return;
    setActionLoading(true);
    try {
      const res = await api.getBesoinsByStatut('VALIDE');
      if (res.ok) {
        const availableBesoins = await res.json();
        const unlinked = availableBesoins.filter((b: any) => !b.appelOffreId);
        
        if (unlinked.length === 0) {
          showNotification('info', 'Aucun besoin validé disponible pour le moment');
          return;
        }

        const ids = unlinked.map((b: any) => b.id);
        const linkRes = await api.addBesoinsToAppelOffre(selectedAO.id, ids);
        
        if (linkRes.ok) {
          showNotification('success', `${ids.length} besoins rattachés automatiquement`);
          handleOpenEditModal(selectedAO);
        }
      }
    } catch (error) {
      showNotification('error', 'Erreur lors de l\'importation');
    } finally {
      setActionLoading(false);
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
  ).sort((a, b) => {
    const aHasOffers = a.offresCount > 0;
    const bHasOffers = b.offresCount > 0;
    
    if (aHasOffers && !bHasOffers) return -1;
    if (!aHasOffers && bHasOffers) return 1;
    
    // Si les deux en ont (ou aucun des deux), on trie du plus récent au plus ancien
    return b.id - a.id;
  });

  const currentItems = filteredAppels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredAppels.length / itemsPerPage);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'OUVERT': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'BROUILLON': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'CLOTURE': return 'bg-slate-50 text-slate-700 border-slate-100';
      case 'ANNULE': return 'bg-red-50 text-red-700 border-red-100 italic';
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
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-10 right-10 z-[100] group flex items-center justify-center"
      >
        <div className="absolute right-full mr-4 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl">
          Lancer un Appel d'Offres
        </div>
        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all duration-300 animate-in zoom-in slide-in-from-bottom-10">
          <Plus size={32} />
        </div>
        <div className="absolute inset-0 w-16 h-16 bg-blue-600 rounded-full animate-ping opacity-20 -z-10 group-hover:hidden" />
      </button>
          </div>
        </div>


        {/* Items List */}
        <div className="grid grid-cols-1 gap-4">
          {currentItems.map((appel) => (
            <div 
              key={appel.id} 
              onClick={() => handleOpenOffresModal(appel)}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer relative"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${
                    appel.statut === 'BROUILLON' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                    appel.statut === 'OUVERT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    appel.statut === 'ANNULE' ? 'bg-red-50 text-red-600 border-red-100' :
                    'bg-slate-50 text-slate-600 border-slate-200'
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
                      {appel.statut === 'OUVERT' && appel.offresCount > 0 && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                          <DollarSign size={12} />
                          <span>{appel.offresCount} soumission(s) reçue(s)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {appel.statut === 'BROUILLON' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePublish(appel.id); }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all text-sm shadow-sm"
                    >
                      <Send size={16} /> Publier
                    </button>
                  )}
                  
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleOpenEditModal(appel);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all text-sm shadow-md"
                    title="Voir les besoins rattachés"
                  >
                    <Package size={16} /> Besoins
                  </button>

                  {appel.statut === 'BROUILLON' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(appel.id); }}
                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
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
                  <input 
                    required 
                    type="date" 
                    value={newAO.dateDebut} 
                    readOnly
                    className="w-full px-4 py-3.5 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-500 cursor-not-allowed" 
                    title="La date de lancement est fixée automatiquement à aujourd'hui."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Échéance</label>
                  <input 
                    required 
                    type="date" 
                    min={newAO.dateDebut}
                    value={newAO.dateFin} 
                    onChange={e => setNewAO({...newAO, dateFin: e.target.value})} 
                    onClick={(e) => {
                      try {
                        // Ouvre le calendrier natif au clic (supporté par les navigateurs modernes)
                        (e.target as HTMLInputElement).showPicker();
                      } catch (err) {}
                    }}
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer hover:bg-gray-50" 
                  />
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
              <div className="flex items-center gap-3">
                {selectedAO.statut === 'BROUILLON' && (
                  <button 
                    onClick={handleImportAvailableNeeds}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all border border-blue-100 flex items-center gap-2 disabled:opacity-50"
                    title="Rattacher tous les besoins validés en attente"
                  >
                    <Plus size={14} /> Générer les besoins
                  </button>
                )}
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
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
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                              {departments.find(d => d.id === besoin.departementId)?.nom || `Département ${besoin.departementId}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className={`flex items-center gap-2 bg-white rounded-lg border border-gray-200 ${selectedAO.statut === 'BROUILLON' ? 'p-1' : 'px-3 py-1'}`}>
                            {selectedAO.statut === 'BROUILLON' ? (
                              <>
                                <button onClick={() => handleUpdateBesoinQuantity(besoin.id, besoin.quantite - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded text-gray-500 font-bold">-</button>
                                <input type="number" value={besoin.quantite} className="w-10 text-center font-bold text-sm outline-none bg-white" readOnly />
                                <button onClick={() => handleUpdateBesoinQuantity(besoin.id, besoin.quantite + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded text-gray-500 font-bold">+</button>
                              </>
                            ) : (
                              <span className="font-bold text-sm text-gray-700">Qté: {besoin.quantite}</span>
                            )}
                          </div>
                          {selectedAO.statut === 'BROUILLON' && (
                            <button 
                              onClick={() => handleRemoveBesoin(besoin.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
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

      {/* Offers Modal */}
      {isOffresModalOpen && selectedAO && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] p-10 shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Gestion des Offres</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                    {selectedAO.reference}
                  </span>
                  <span className="text-gray-400 font-medium text-sm">
                    {offres.length} offre(s) reçue(s)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={identifyMoinsDisant}
                  disabled={offres.length === 0}
                  className="px-5 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold border border-amber-200 hover:bg-amber-100 transition-all flex items-center gap-2"
                >
                  <Award size={18} /> Moins disant
                </button>
                <button onClick={() => setIsOffresModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full transition-all">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {offresLoading ? (
                <div className="py-20 text-center">
                  <Loader className="animate-spin mx-auto text-blue-600" size={40} />
                  <p className="mt-4 text-gray-500 font-bold">Analyse des offres...</p>
                </div>
              ) : (
                <>
                  {offres.map((offre) => (
                    <div key={offre.id} className={`rounded-3xl border transition-all ${offre.statut === 'ACCEPTEE' ? 'border-green-200 bg-green-50/20' : 'border-gray-100 bg-white shadow-sm'}`}>
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                              <User size={28} />
                            </div>
                            <div>
                              <h4 className="font-black text-gray-900 text-lg">{offre.fournisseurNom}</h4>
                              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                offre.statut === 'ACCEPTEE' ? 'bg-green-100 text-green-700' : 
                                offre.statut === 'REJETEE' ? 'bg-red-100 text-red-700' : 
                                offre.statut === 'ANNULEE' ? 'bg-red-50 text-red-500 border-red-100 italic' :
                                offre.statut === 'ELIMINEE' ? 'bg-gray-800 text-white' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {offre.statut}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-8">
                            <div className="text-center">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Montant Total</p>
                              <p className="text-xl font-black text-blue-600">{offre.prixTotal.toLocaleString()} MAD</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Livraison</p>
                              <p className="text-sm font-bold text-gray-700">{Array.isArray(offre.dateLivraison) ? `${offre.dateLivraison[2]}/${offre.dateLivraison[1]}/${offre.dateLivraison[0]}` : offre.dateLivraison}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {offre.statut === 'SOUMISE' && !offres.some(o => o.statut === 'ACCEPTEE') && (
                                <div className="flex flex-col items-end gap-2">
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleAcceptOffre(offre.id)}
                                      className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center gap-2"
                                    >
                                      <CheckCircle size={14} /> Accepter
                                    </button>
                                    <button 
                                      onClick={() => setShowMotifModal({ show: true, offreId: offre.id, action: 'REJETER' })}
                                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl border border-amber-100 transition-all"
                                      title="Rejeter"
                                    >
                                      <X size={18} />
                                    </button>
                                    <button 
                                      onClick={() => setShowMotifModal({ show: true, offreId: offre.id, action: 'ELIMINER' })}
                                      className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all"
                                      title="Éliminer"
                                    >
                                      <ShieldAlert size={18} />
                                    </button>
                                  </div>
                                  <p className="text-[9px] font-medium text-gray-400 italic">L'acceptation rejettera automatiquement les autres.</p>
                                </div>
                              )}
                              <button 
                                onClick={() => setExpandedOffre(expandedOffre === offre.id ? null : offre.id)}
                                className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400"
                              >
                                {expandedOffre === offre.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {expandedOffre === offre.id && (
                          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-top-4 duration-300">
                            {offre.lignes?.map((line: any, idx: number) => (
                              <div key={idx} className="p-4 bg-white rounded-2xl border border-gray-100 space-y-2">
                                <div className="flex justify-between items-start">
                                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{line.variante}</span>
                                  <span className="text-xs font-bold text-gray-900">{line.prixUnitaire} MAD / u</span>
                                </div>
                                <p className="font-bold text-gray-900 text-sm">{line.marque || 'Marque non spécifiée'}</p>
                                <div className="flex gap-4 text-[10px] text-gray-500 font-bold">
                                  <span>Qté: {line.quantite}</span>
                                  {line.cpu && <span>{line.cpu}</span>}
                                  {line.ram && <span>{line.ram}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {offres.length === 0 && (
                    <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[2rem]">
                      <Package className="mx-auto text-gray-200 mb-4" size={64} />
                      <p className="text-gray-500 font-bold text-xl">Aucune offre soumise</p>
                      <p className="text-gray-400 text-sm mt-1">Les fournisseurs n'ont pas encore répondu à cet appel.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Motif Modal (Reject/Eliminate) */}
      {showMotifModal.show && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              {showMotifModal.action === 'ELIMINER' ? <ShieldAlert className="text-red-600" /> : <XCircle className="text-amber-600" />}
              {showMotifModal.action === 'ELIMINER' ? 'Motif d\'élimination' : 'Motif de rejet'}
            </h3>
            
            <textarea 
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Expliquez la raison..."
              className="w-full h-32 p-6 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-100 font-medium transition-all mb-8 resize-none"
            />

            <div className="flex gap-4">
              <button 
                onClick={() => setShowMotifModal({ show: false, offreId: null, action: '' })}
                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={handleActionWithMotif}
                disabled={!motif || actionLoading}
                className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-50"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification is already handled by showNotification */}
    </div>
  );
};

export default AppelsOffresPage;


