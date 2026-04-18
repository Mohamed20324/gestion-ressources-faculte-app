import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Search, Loader, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

interface Ressource {
  id: number;
  numeroInventaire: string;
  marque: string;
  statut: string;
  categorie: string;
}

const ResourcesPage = () => {
  const [resources, setResources] = useState<Ressource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [resToDelete, setResToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await api.getAllRessources();
      if (response.ok) {
        const data = await response.json();
        setResources(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!resToDelete) return;
    try {
      setDeleting(true);
      const response = await api.deleteRessource(resToDelete);
      if (response.ok) {
        setResources(resources.filter(r => r.id !== resToDelete));
        setIsDeleteModalOpen(false);
        setResToDelete(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Impossible de supprimer cette ressource');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur technique lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setResToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const filteredResources = resources.filter(res => 
    res.numeroInventaire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.marque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.categorie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.statut?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResources.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50/50">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-500 font-medium">Chargement de l'inventaire...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="text-blue-600" size={32} />
            Inventaire des Ressources
          </h1>
          <p className="text-gray-500 mt-1 ml-11">Gérez le matériel informatique et pédagogique</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher une ressource..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 font-semibold whitespace-nowrap">
            <Plus size={20} />
            Ajouter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ressource</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Marque</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentItems.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{res.numeroInventaire}</div>
                        <div className="text-xs text-gray-500">ID: #{res.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                      {res.categorie}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {res.marque}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      res.statut === 'FONCTIONNELLE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {res.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDeleteClick(res.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredResources.length === 0 && !loading && (
          <div className="text-center py-20">
            <Package className="mx-auto text-gray-200 mb-4" size={64} />
            <p className="text-gray-500 text-lg font-medium">Aucune ressource trouvée.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 border-t border-gray-100 rounded-2xl shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Précédent</button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} className="ml-3 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Suivant</button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à <span className="font-medium">{Math.min(indexOfLastItem, filteredResources.length)}</span> sur <span className="font-medium">{filteredResources.length}</span> résultats
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p-1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border border-gray-200 transition-colors ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <ChevronLeft size={20} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border border-gray-200 transition-colors ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={confirmDelete} 
        title="Supprimer la ressource"
        message="Êtes-vous sûr de vouloir supprimer cette ressource de l'inventaire ? Cette action est irréversible."
        loading={deleting}
      />
    </div>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-500 text-sm mb-8">{message}</p>
          
          <div className="flex gap-3 w-full">
            <button 
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button 
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader className="animate-spin" size={18} /> : 'Supprimer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
