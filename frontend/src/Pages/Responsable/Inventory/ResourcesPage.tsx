import { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Package, Search, Loader,
  ChevronLeft, ChevronRight, AlertTriangle, Filter,
  Monitor, Info, MoreHorizontal
} from 'lucide-react';
import { api } from '../../../services/api';
import { NotificationContainer } from '../../../components/Notification';
import { useNotifications } from '../../../hooks/useNotifications';

interface Ressource {
  id: number;
  numeroInventaire: string;
  marque: string;
  statut: string;
  categorie: string;
  dateFinGarantie?: string;
  fournisseurNom?: string;
  departementId?: number;
  departementDemandeurNom?: string;
  descriptionTechnique?: string;
  prix?: number;
}

interface Affectation {
  id: number;
  ressourceId: number;
  departementId: number;
  enseignantId?: number;
  affectationCollective: boolean;
  dateAffectation: string;
}

const ResourcesPage = () => {
  const { notifications, showNotification, removeNotification } = useNotifications();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [resources, setResources] = useState<Ressource[]>([]);
  const [affectations, setAffectations] = useState<Record<number, Affectation>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [activeTab, setActiveTab] = useState<'ALL' | 'AVAILABLE'>('ALL');

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [resToDelete, setResToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit Resource Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<Ressource>>({});

  // Affectation Modal (used for both Create and Edit)
  const [isAffectModalOpen, setIsAffectModalOpen] = useState(false);
  const [isEditingAffect, setIsEditingAffect] = useState(false);
  const [selectedRes, setSelectedRes] = useState<Ressource | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [affectData, setAffectData] = useState({
    departementId: 0,
    enseignantId: null as number | null,
    isCollective: true
  });
  const [affecting, setAffecting] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const [resResponse, deptsResponse] = await Promise.all([
        api.getAllRessources(),
        api.getAllDepartements()
      ]);

      if (resResponse.ok) {
        const resData = await resResponse.json();
        setResources(resData);

        // Fetch affectations for affected resources
        const affMap: Record<number, Affectation> = {};
        await Promise.all(resData.map(async (r: any) => {
          if (r.statut === 'AFFECTEE') {
            try {
              const affRes = await api.getAffectationByRessource(r.id);
              if (affRes.ok) {
                affMap[r.id] = await affRes.json();
              }
            } catch (e) { }
          }
        }));
        setAffectations(affMap);
      }

      if (deptsResponse.ok) {
        setDepartments(await deptsResponse.json());
      }
    } catch (error) {
      showNotification('error', 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (res: Ressource) => {
    setEditData(res);
    setIsEditModalOpen(true);
  };

  const handleUpdateResource = async () => {
    if (!editData.id) return;
    setLoading(true);
    try {
      const res = await api.updateRessource(editData.id, editData);
      if (res.ok) {
        showNotification('success', 'Ressource mise à jour');
        setIsEditModalOpen(false);
        loadResources();
      }
    } catch (error) {
      showNotification('error', 'Erreur de mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAffectModal = async (res: Ressource, isEdit = false) => {
    setSelectedRes(res);
    setIsEditingAffect(isEdit);

    if (isEdit && affectations[res.id]) {
      const aff = affectations[res.id];
      setAffectData({
        departementId: aff.departementId,
        enseignantId: aff.enseignantId || null,
        isCollective: aff.affectationCollective
      });
      const tRes = await api.getEnseignantsByDepartement(aff.departementId);
      if (tRes.ok) setTeachers(await tRes.json());
    } else {
      setAffectData({
        departementId: res.departementId || 0,
        enseignantId: null,
        isCollective: true
      });
    }

    setIsAffectModalOpen(true);
  };

  const handleDeptChange = async (deptId: number) => {
    setAffectData({ ...affectData, departementId: deptId, enseignantId: null });
  };

  const handleOpenBulkAffectModal = () => {
    if (selectedIds.length === 0) return;
    setAffectData({
      departementId: 0,
      enseignantId: null,
      isCollective: true
    });
    setIsEditingAffect(false);
    setSelectedRes(null);
    setIsAffectModalOpen(true);
  };

  const handleCreateAffectation = async () => {
    const idsToProcess = selectedRes ? [selectedRes.id] : selectedIds;
    if (idsToProcess.length === 0 || !affectData.departementId) return;

    setAffecting(true);
    try {
      // 1. Calculate total price to subtract from budget
      const resourcesToAffect = resources.filter(r => idsToProcess.includes(r.id));
      const totalCost = resourcesToAffect.reduce((sum, r) => sum + (r.prix || 0), 0);

      // 2. Fetch department to check budget
      const deptRes = await api.getDepartementById(affectData.departementId);
      if (deptRes.ok) {
        const dept = await deptRes.json();
        if (dept.budget < totalCost) {
          showNotification('error', `Budget insuffisant ! Coût total: ${totalCost} MAD, Budget disponible: ${dept.budget} MAD`);
          setAffecting(false);
          return;
        }

        // 3. Update department budget
        const updatedDept = { ...dept, budget: dept.budget - totalCost };
        await api.updateDepartement(dept.id, updatedDept);
      }

      // 4. Create affectations
      let successCount = 0;
      await Promise.all(idsToProcess.map(async (id) => {
        const res = await api.createAffectation({
          ressourceId: id,
          departementId: affectData.departementId,
          enseignantId: affectData.isCollective ? null : affectData.enseignantId,
          affectationCollective: affectData.isCollective,
          dateAffectation: new Date().toISOString().split('T')[0],
          expediteurId: user.id
        });
        if (res.ok) successCount++;
      }));

      showNotification('success', `${successCount} ressource(s) affectée(s) avec succès. Budget mis à jour (-${totalCost} MAD)`);
      setIsAffectModalOpen(false);
      setSelectedIds([]);
      loadResources();
    } catch (error) {
      showNotification('error', 'Erreur technique lors de l\'affectation');
    } finally {
      setAffecting(false);
    }
  };

  const handleRemoveAffectation = async (resId: number) => {
    const aff = affectations[resId];
    if (!aff) return;
    if (!window.confirm("Voulez-vous libérer cette ressource ? Elle redeviendra disponible pour une autre affectation.")) return;

    try {
      const res = await api.deleteAffectation(aff.id);
      if (res.ok) {
        showNotification('success', 'Ressource libérée');
        loadResources();
      }
    } catch (error) {
      showNotification('error', 'Erreur lors de la libération');
    }
  };

  const confirmDelete = async () => {
    if (!resToDelete) return;
    setDeleting(true);
    try {
      const response = await api.deleteRessource(resToDelete);
      if (response.ok) {
        setResources(resources.filter(r => r.id !== resToDelete));
        setIsDeleteModalOpen(false);
        showNotification('success', 'Ressource supprimée');
      }
    } catch (error) {
      showNotification('error', 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch =
      res.numeroInventaire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.marque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.categorie?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'AVAILABLE') {
      return matchesSearch && res.statut === 'DISPONIBLE';
    }
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const currentItems = filteredResources.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'DISPONIBLE': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'AFFECTEE': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'EN_PANNE': return 'bg-red-50 text-red-700 border-red-100';
      case 'MAINTENANCE': return 'bg-amber-50 text-amber-700 border-amber-100';
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
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Inventaire Global</h1>
            <p className="text-gray-500 mt-1 font-medium">Gestion et suivi en temps réel de l'ensemble du parc technologique de la faculté.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par n° inventaire, marque..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all shadow-sm font-medium"
              />
            </div>

            {/* Floating Action Button 
       <button 
        className="fixed bottom-10 right-10 z-[100] group flex items-center justify-center"
      >
        <div className="absolute right-full mr-4 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl">
          Ajouter une ressource
        </div>
        <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl shadow-gray-200 hover:bg-black hover:scale-110 active:scale-95 transition-all duration-300 animate-in zoom-in slide-in-from-bottom-10">
          <Plus size={32} />
        </div>
        <div className="absolute inset-0 w-16 h-16 bg-gray-900 rounded-full animate-ping opacity-20 -z-10 group-hover:hidden" />
      </button>*/}
          </div>
        </div>
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 w-fit mb-2 shadow-sm">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'ALL' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Toutes les ressources ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab('AVAILABLE')}
            className={`px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'AVAILABLE' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Non affectées ({resources.filter(r => r.statut === 'DISPONIBLE').length})
          </button>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Synchronisation...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-3 py-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === currentItems.filter(r => r.statut === 'DISPONIBLE').length && selectedIds.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(currentItems.filter(r => r.statut === 'DISPONIBLE').map(r => r.id));
                            } else {
                              setSelectedIds([]);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Ressource</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Catégorie</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        Demandé par
                        <div className="group/info relative">
                          <Info size={12} className="text-gray-300" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-[9px] text-white rounded opacity-0 group-hover/info:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Département ayant exprimé le besoin initial
                          </div>
                        </div>
                      </th>
                      <th className="px-3 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Valeur (MAD)</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Affectation</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {currentItems.map((res) => {
                      const isExpired = res.dateFinGarantie && new Date(res.dateFinGarantie) < new Date();
                      const isSelected = selectedIds.includes(res.id);

                      return (
                        <tr key={res.id} className={`group transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}`}>
                          <td className="px-3 py-4">
                            {res.statut === 'DISPONIBLE' && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  if (isSelected) setSelectedIds(selectedIds.filter(id => id !== res.id));
                                  else setSelectedIds([...selectedIds, res.id]);
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                                <Monitor size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{res.numeroInventaire}</p>
                                <p className="text-xs font-medium text-gray-400">{res.marque}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                              {res.categorie}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {res.departementDemandeurNom ? (
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                <span className="text-xs font-bold text-gray-700">{res.departementDemandeurNom}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-300 italic">Aucune demande</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-gray-900">
                              {res.prix?.toLocaleString() || '0'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {res.statut === 'AFFECTEE' ? (
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-900">
                                  {departments.find(d => d.id === affectations[res.id]?.departementId)?.nom || 'Dpt.'}
                                </span>
                                <span className="text-[10px] text-blue-600 font-bold uppercase">
                                  {affectations[res.id]?.affectationCollective ? 'Collectif' : 'Individuel'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium italic">Non affectée</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 w-fit ${getStatusStyle(res.statut)}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${res.statut === 'AFFECTEE' ? 'bg-emerald-500' : (res.statut === 'EN_PANNE' ? 'bg-red-500' : 'bg-blue-500')}`} />
                              {res.statut === 'DISPONIBLE' ? 'PRÊT' : res.statut}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {res.statut === 'DISPONIBLE' ? (
                                <button
                                  onClick={() => handleOpenAffectModal(res)}
                                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-sm"
                                >
                                  <Info size={12} /> Affecter
                                </button>
                              ) : res.statut === 'AFFECTEE' ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleOpenAffectModal(res, true)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Modifier l'affectation"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveAffectation(res.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Libérer la ressource"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ) : null}
                              <button
                                onClick={() => handleOpenEditModal(res)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Modifier les infos ressource"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => { setResToDelete(res.id); setIsDeleteModalOpen(true); }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer de l'inventaire"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredResources.length === 0 && (
                <div className="py-24 text-center bg-gray-50/20">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="text-gray-200" size={32} />
                  </div>
                  <h3 className="text-gray-900 font-bold">Inventaire vide</h3>
                  <p className="text-gray-400 text-sm mt-1">Aucune ressource ne correspond à votre recherche.</p>
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
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-white transition-all shadow-sm"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* Sliding Window Pagination */}
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 || 
                        pageNum === totalPages || 
                        (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      
                      if (
                        (pageNum === currentPage - 3 && pageNum > 1) ||
                        (pageNum === currentPage + 3 && pageNum < totalPages)
                      ) {
                        return <span key={pageNum} className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs font-bold">...</span>;
                      }
                      
                      return null;
                    })}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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

      {/* Affectation Modal */}
      {isAffectModalOpen && (selectedRes || selectedIds.length > 0) && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Affectation {selectedRes ? 'Ressource' : 'Multiple'}</h2>
            <p className="text-sm font-medium text-blue-600 mb-8">
              {selectedRes 
                ? `${selectedRes.numeroInventaire} (${selectedRes.marque})` 
                : `${selectedIds.length} ressources sélectionnées`}
            </p>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Département cible</label>
                <select
                  value={affectData.departementId}
                  onChange={e => handleDeptChange(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Sélectionner un département</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                </select>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Information</p>
                <p className="text-sm font-bold text-blue-900">
                  L'affectation sera faite au niveau du département. Le chef de département pourra ensuite l'attribuer à un enseignant spécifique.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsAffectModalOpen(false)}
                  className="flex-1 py-4 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateAffectation}
                  disabled={affecting || !affectData.departementId || (!affectData.isCollective && !affectData.enseignantId)}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {affecting ? <Loader className="animate-spin" size={20} /> : (isEditingAffect ? 'Mettre à jour' : 'Affecter')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Resource Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Modifier la Ressource</h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">N° Inventaire</label>
                <input
                  value={editData.numeroInventaire || ''}
                  onChange={e => setEditData({ ...editData, numeroInventaire: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Marque</label>
                <input
                  value={editData.marque || ''}
                  onChange={e => setEditData({ ...editData, marque: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">État de fonctionnement</label>
                <select
                  value={editData.statut || ''}
                  onChange={e => setEditData({ ...editData, statut: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FONCTIONNELLE">FONCTIONNELLE</option>
                  <option value="EN_PANNE">EN_PANNE</option>
                  <option value="EN_MAINTENANCE">EN_MAINTENANCE</option>
                  <option value="DISPONIBLE">DISPONIBLE (Non affectée)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateResource}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold">
                {selectedIds.length}
              </div>
              <div>
                <p className="font-bold text-sm">Ressources sélectionnées</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Action groupée</p>
              </div>
            </div>
            <div className="h-10 w-px bg-gray-800" />
            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenBulkAffectModal}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
              >
                <Info size={16} /> Affecter la sélection
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-6 py-2 bg-transparent hover:bg-gray-800 rounded-xl font-bold text-sm transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Supprimer la ressource ?</h2>
            <p className="text-gray-500 font-medium mb-8 text-sm leading-relaxed">
              Cette action est irréversible. La ressource sera définitivement retirée de l'inventaire global.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-md transition-all flex items-center justify-center gap-2"
              >
                {deleting ? <Loader className="animate-spin" size={18} /> : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;


