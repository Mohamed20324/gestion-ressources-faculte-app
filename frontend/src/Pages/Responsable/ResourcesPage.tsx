import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Package, Search, Loader, 
  ChevronLeft, ChevronRight, AlertTriangle
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
  const itemsPerPage = 8;

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
      showNotification('error', 'Erreur de chargement de l\'inventaire');
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

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen pb-20">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Package className="text-blue-600" size={36} />
            Inventaire des Ressources
          </h1>
          <p className="text-gray-500 mt-1 font-medium ml-11">Consultez et gérez le parc informatique de la faculté.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher une ressource..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
          <button 
            className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center"
            title="Ajouter une ressource"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-gray-500 font-bold">Chargement de l'inventaire...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Ressource</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Catégorie</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Fournisseur</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Garantie</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentItems.map((res) => (
                    <tr key={res.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                            <Package size={22} />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{res.numeroInventaire}</div>
                            <div className="text-xs text-gray-400 font-mono">ID: #{res.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                          {res.categorie}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-600">
                        {res.fournisseurNom || 'N/A'}
                      </td>
                      <td className="px-8 py-5">
                        {res.dateFinGarantie ? (
                          <div className={`text-xs font-bold ${new Date(res.dateFinGarantie) > new Date() ? 'text-green-600' : 'text-red-500'}`}>
                            {new Date(res.dateFinGarantie) > new Date() ? 'ACTIVE' : 'EXPIRÉE'}
                            <div className="text-[10px] text-gray-400">{res.dateFinGarantie}</div>
                          </div>
                        ) : 'N/A'}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit border ${
                          res.statut === 'FONCTIONNELLE' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${res.statut === 'FONCTIONNELLE' ? 'bg-green-500' : 'bg-red-500'}`} />
                          {res.statut}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                          <button className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100 shadow-sm">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => { setResToDelete(res.id); setIsDeleteModalOpen(true); }} className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100 shadow-sm">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-24 flex flex-col items-center">
                <Package className="mx-auto text-gray-200 mb-4" size={64} />
                <p className="text-gray-500 text-xl font-bold">Aucune ressource trouvée.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-8 py-5 rounded-[2rem] border border-gray-100 shadow-lg">
              <p className="text-sm font-bold text-gray-400">
                Page <span className="text-gray-900">{currentPage}</span> sur <span className="text-gray-900">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p-1))}
                  disabled={currentPage === 1}
                  className="p-3 border border-gray-100 rounded-2xl disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
                  disabled={currentPage === totalPages}
                  className="p-3 border border-gray-100 rounded-2xl disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-3xl text-center border border-white/20">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6 shadow-inner border-4 border-white">
              <AlertTriangle size={48} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Confirmation</h2>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed">
              Voulez-vous supprimer cette ressource de l'inventaire ?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-4 px-6 border border-gray-100 rounded-2xl font-bold text-gray-400 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-4 px-6 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 shadow-xl shadow-red-100 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {deleting ? <Loader className="animate-spin" size={20} /> : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
