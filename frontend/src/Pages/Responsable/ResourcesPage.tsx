import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Package, Search, Loader, 
  ChevronLeft, ChevronRight, AlertTriangle, Filter,
  Monitor, Info, MoreHorizontal
} from 'lucide-react';
import { api } from '../../services/api';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

interface Ressource {
  id: number;
  numeroInventaire: string;
  marque: string;
  statut: string;
  categorie: string;
  dateFinGarantie?: string;
  fournisseurNom?: string;
}

const ResourcesPage = () => {
  const { notifications, showNotification, removeNotification } = useNotifications();
  
  const [resources, setResources] = useState<Ressource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [resToDelete, setResToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const response = await api.getAllRessources();
      if (response.ok) {
        setResources(await response.json());
      }
    } catch (error) {
      showNotification('error', 'Erreur de chargement');
    } finally {
      setLoading(false);
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

  const filteredResources = resources.filter(res => 
    res.numeroInventaire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.marque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.categorie?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const currentItems = filteredResources.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'FONCTIONNELLE': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'EN_PANNE': return 'bg-red-50 text-red-700 border-red-100';
      case 'EN_MAINTENANCE': return 'bg-amber-50 text-amber-700 border-amber-100';
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
            <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-600 shadow-sm">
              <Filter size={20} />
            </button>
            <button className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center gap-2">
              <Plus size={20} />
              Ajouter
            </button>
          </div>
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
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Ressource</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Catégorie</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Garantie</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Fournisseur</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {currentItems.map((res) => {
                      const isExpired = res.dateFinGarantie && new Date(res.dateFinGarantie) < new Date();
                      
                      return (
                        <tr key={res.id} className="group transition-colors hover:bg-gray-50/50">
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
                            {res.dateFinGarantie ? (
                              <div className="flex flex-col">
                                <span className={`text-xs font-bold ${isExpired ? 'text-red-500' : 'text-emerald-600'}`}>
                                  {isExpired ? 'Expirée' : 'Active'}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">{res.dateFinGarantie}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-600 truncate max-w-[150px] inline-block">
                              {res.fournisseurNom || 'Direct'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 w-fit ${getStatusStyle(res.statut)}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${res.statut === 'FONCTIONNELLE' ? 'bg-emerald-500' : (res.statut === 'EN_PANNE' ? 'bg-red-500' : 'bg-amber-500')}`} />
                              {res.statut}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => { setResToDelete(res.id); setIsDeleteModalOpen(true); }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-gray-900 rounded-lg transition-colors">
                                <MoreHorizontal size={18} />
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
