import { useState, useEffect } from 'react';
import {
  Search, Loader, ClipboardList,
  CheckCircle, X, FileText, ShoppingCart, Filter,
  ArrowRight, ChevronLeft, ChevronRight, Package, Tag, Info,
  Plus, ChevronUp, ChevronDown
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { NotificationContainer } from '../../../components/Notification';
import { useNotifications } from '../../../hooks/useNotifications';

interface Departement {
  id: number;
  nom: string;
}

interface Besoin {
  id: number;
  typeRessourceId: number;
  quantite: number;
  statut: string;
  departementId: number;
  reunionId: number;
  description?: string;
  appelOffreId?: number;
}

const BesoinsGlobalPage = () => {
  const { user } = useAuth();
  const { notifications, showNotification, removeNotification } = useNotifications();

  const [besoins, setBesoins] = useState<Besoin[]>([]);
  const [departments, setDepartments] = useState<Departement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedNeeds, setSelectedNeeds] = useState<number[]>([]);
  const [typesRessources, setTypesRessources] = useState<any[]>([]);

  const [isAOModalOpen, setIsAOModalOpen] = useState(false);
  const [openAOs, setOpenAOs] = useState<any[]>([]);
  const [aoMode, setAoMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [aoData, setAoData] = useState({
    existingAoId: '',
    reference: '',
    dateFin: ''
  });
  const [submittingAO, setSubmittingAO] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL_READY');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [besoinsRes, typesRes] = await Promise.all([
        api.getAllBesoins(),
        api.getAllTypesRessources()
      ]);

      if (typesRes.ok) {
        setTypesRessources(await typesRes.json());
      }
      if (besoinsRes.ok) {
        const [besoinsData, deptsRes] = await Promise.all([
          besoinsRes.json(),
          api.getAllDepartements()
        ]);
        setBesoins(besoinsData);
        if (deptsRes.ok) {
          setDepartments(await deptsRes.json());
        }
      }
    } catch (error) {
      showNotification('error', 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAOModal = async () => {
    if (selectedNeeds.length === 0) {
      showNotification('error', 'Sélectionnez au moins un besoin');
      return;
    }
    setIsAOModalOpen(true);
    try {
      const response = await api.getAllAppelsOffres();
      if (response.ok) {
        const data = await response.json();
        const drafts = data.filter((ao: any) => ao.statut === 'BROUILLON');
        setOpenAOs(drafts);
        if (drafts.length === 0) setAoMode('NEW');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleValidateSelection = async () => {
    if (selectedNeeds.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(selectedNeeds.map(id => {
        const fullBesoin = besoins.find(b => b.id === id);
        if (!fullBesoin) return Promise.resolve();
        return api.updateBesoin(id, { ...fullBesoin, statut: 'VALIDE' });
      }));
      showNotification('success', `${selectedNeeds.length} besoin(s) validé(s)`);
      setSelectedNeeds([]);
      loadData();
    } catch (error) {
      showNotification('error', 'Erreur technique');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateOne = async (id: number) => {
    try {
      const fullBesoin = besoins.find(b => b.id === id);
      if (!fullBesoin) return;
      const res = await api.updateBesoin(id, { ...fullBesoin, statut: 'VALIDE' });
      if (res.ok) {
        showNotification('success', 'Besoin validé');
        loadData();
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    }
  };

  const handleAOAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAO(true);
    try {
      let targetAoId: number;

      if (aoMode === 'NEW') {
        const res = await api.createAppelOffre({
          reference: aoData.reference,
          dateDebut: new Date().toISOString().split('T')[0],
          dateFin: aoData.dateFin,
          statut: 'BROUILLON',
          responsableId: user?.id
        });
        if (res.ok) {
          const newAo = await res.json();
          targetAoId = newAo.id;
        } else {
          showNotification('error', 'Erreur lors de la création du marché');
          return;
        }
      } else {
        targetAoId = parseInt(aoData.existingAoId);
      }

      const linkRes = await api.addBesoinsToAppelOffre(targetAoId, selectedNeeds);
      if (linkRes.ok) {
        showNotification('success', 'Besoins rattachés avec succès');
        setIsAOModalOpen(false);
        setSelectedNeeds([]);
        setAoData({ existingAoId: '', reference: '', dateFin: '' });
        loadData();
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    } finally {
      setSubmittingAO(false);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedNeeds(prev =>
      prev.includes(id) ? prev.filter(nid => nid !== id) : [...prev, id]
    );
  };

  const filteredBesoins = besoins.filter(b => {
    const typeName = typesRessources.find(t => t.id === b.typeRessourceId)?.libelle || '';
    const matchesSearch = typeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL_READY') {
      return matchesSearch && (b.statut === 'ENVOYE' || b.statut === 'VALIDE') && !b.appelOffreId;
    }
    if (statusFilter === 'EN_ATTENTE') {
      return matchesSearch && b.statut === 'EN_ATTENTE';
    }
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredBesoins.length / itemsPerPage);
  const currentItems = filteredBesoins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'VALIDE': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'ENVOYE': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'EN_ATTENTE': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="p-8 bg-gray-50/30 min-h-full pb-8">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Affectation des Besoins</h1>
            <p className="text-gray-500 mt-1 font-medium">Centralisez et rattachez les demandes départementales aux marchés publics.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un besoin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all shadow-sm font-medium"
              />
            </div>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 focus:ring-2 focus:ring-blue-600 outline-none shadow-sm cursor-pointer"
            >
              <option value="ALL_READY">Prêts (Validés/Envoyés)</option>
              <option value="EN_ATTENTE">En attente (Départements)</option>
              <option value="TOUS">Tous les besoins</option>
            </select>
            
            <div className="h-10 w-[1px] bg-gray-200 mx-2 hidden lg:block"></div>

            {selectedNeeds.length > 0 && (
              <div className="fixed bottom-10 right-10 z-[100] group flex items-center justify-center animate-in zoom-in slide-in-from-bottom-10 duration-300">
                <div className="absolute right-full mr-4 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl">
                  Rattacher {selectedNeeds.length} besoin(s) au marché
                </div>
                <button
                  onClick={handleOpenAOModal}
                  className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all duration-300 relative"
                >
                  <ShoppingCart size={32} />
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {selectedNeeds.length}
                  </span>
                </button>
                <div className="absolute inset-0 w-16 h-16 bg-blue-600 rounded-full animate-ping opacity-20 -z-10 group-hover:hidden" />
              </div>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Traitement en cours...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-4 w-12 text-center">
                        <div className="flex justify-center">
                          <input type="checkbox" disabled className="rounded border-gray-300 text-blue-600" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Type de Ressource</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Département</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Quantité</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {currentItems.map((besoin) => {
                      const typeName = typesRessources.find(t => t.id === besoin.typeRessourceId)?.libelle || 'Inconnu';
                      const isSelected = selectedNeeds.includes(besoin.id);
                      
                      return (
                        <tr 
                          key={besoin.id} 
                          className={`group transition-colors ${isSelected ? 'bg-blue-50/40' : 'hover:bg-gray-50/50'}`}
                        >
                          <td className="px-6 py-4 text-center">
                            {!besoin.appelOffreId && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelection(besoin.id)}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                              />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'} transition-colors`}>
                                <Package size={18} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{typeName}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ID: {besoin.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                              <span className="text-sm font-semibold text-gray-600">
                                {departments.find(d => d.id === besoin.departementId)?.nom || `Département ${besoin.departementId}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-bold text-gray-700 border border-gray-200">
                              {besoin.quantite}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(besoin.statut)}`}>
                              {besoin.statut}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {besoin.appelOffreId ? (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 text-xs font-bold">
                                  <CheckCircle size={14} />
                                  AO-{besoin.appelOffreId}
                                </div>
                              ) : (
                                <>
                                  <span className="text-xs text-gray-400 font-medium italic">En attente de validation par le Chef</span>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredBesoins.length === 0 && (
                <div className="py-24 text-center bg-gray-50/20">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <ClipboardList className="text-gray-200" size={40} />
                  </div>
                  <h3 className="text-gray-900 font-bold">Aucun besoin trouvé</h3>
                  <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos critères de recherche.</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p-1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-white transition-all shadow-sm"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-white transition-all shadow-sm"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* AO Modal */}
      {isAOModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Rattachement Marché</h2>
                <p className="text-gray-500 text-sm font-medium">{selectedNeeds.length} besoin(s) sélectionnés</p>
              </div>
              <button onClick={() => setIsAOModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
              <button 
                onClick={() => setAoMode('EXISTING')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${aoMode === 'EXISTING' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
              >
                Marché Existant
              </button>
              <button 
                onClick={() => setAoMode('NEW')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${aoMode === 'NEW' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
              >
                Nouveau Dossier
              </button>
            </div>

            <form onSubmit={handleAOAction} className="space-y-6">
              {aoMode === 'EXISTING' ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Sélectionner un Brouillon</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                    <select 
                      required 
                      value={aoData.existingAoId} 
                      onChange={(e) => setAoData({ ...aoData, existingAoId: e.target.value })} 
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-gray-700"
                    >
                      <option value="">-- Choisir un marché --</option>
                      {openAOs.map(ao => (
                        <option key={ao.id} value={ao.id}>
                          {ao.reference}
                        </option>
                      ))}
                    </select>
                  </div>
                  {openAOs.length === 0 && (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                      <Info className="text-amber-500 shrink-0" size={18} />
                      <p className="text-xs font-bold text-amber-700">Aucun brouillon disponible. Utilisez l'option "Nouveau Dossier".</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Référence Marché</label>
                    <input 
                      required
                      type="text"
                      placeholder="ex: AO-2026-MAT-INFO"
                      value={aoData.reference}
                      onChange={e => setAoData({...aoData, reference: e.target.value.toUpperCase()})}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Date d'échéance</label>
                    <input 
                      required
                      type="date"
                      value={aoData.dateFin}
                      onChange={e => setAoData({...aoData, dateFin: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                    />
                  </div>
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={submittingAO || (aoMode === 'EXISTING' && openAOs.length === 0)} 
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingAO ? <Loader className="animate-spin" size={24} /> : (
                  <>
                    <ShoppingCart size={20} />
                    Confirmer l'affectation
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BesoinsGlobalPage;


