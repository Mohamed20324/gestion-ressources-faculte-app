import { useState, useEffect } from 'react';
import { 
  Plus, Search, Loader, Box, Trash2, Edit2,
  AlertTriangle, CheckCircle, XCircle, 
  ChevronLeft, ChevronRight, Settings
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

interface TypeRessource {
  id: number;
  code: string;
  libelle: string;
  estStandard: boolean;
  actif: boolean;
}

const TypesRessourcesPage = () => {
  const { user } = useAuth();
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [types, setTypes] = useState<TypeRessource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<TypeRessource | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    libelle: '',
    estStandard: false,
    actif: true
  });

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    setLoading(true);
    try {
      const response = await api.getAllTypesRessources();
      if (response.ok) {
        setTypes(await response.json());
      }
    } catch (error) {
      showNotification('error', 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type: TypeRessource | null = null) => {
    if (type) {
      setEditingType(type);
      setFormData({
        code: type.code,
        libelle: type.libelle,
        estStandard: type.estStandard,
        actif: type.actif
      });
    } else {
      setEditingType(null);
      setFormData({
        code: '',
        libelle: '',
        estStandard: false,
        actif: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let response;
      if (editingType) {
        response = await api.updateTypeRessource(editingType.id, formData);
      } else {
        response = await api.createTypeRessource(formData);
      }

      if (response.ok) {
        showNotification('success', editingType ? 'Type modifié' : 'Type créé');
        setIsModalOpen(false);
        loadTypes();
      } else {
        const err = await response.json();
        showNotification('error', err.message || 'Erreur lors de la sauvegarde');
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
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      const response = await api.deleteTypeRessource(itemToDelete);
      if (response.ok) {
        showNotification('success', 'Type supprimé');
        setTypes(types.filter(t => t.id !== itemToDelete));
        setIsDeleteModalOpen(false);
      } else {
        showNotification('error', 'Impossible de supprimer ce type');
      }
    } catch (error) {
      showNotification('error', 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const filteredTypes = types.filter(t => 
    t.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTypes.length / itemsPerPage);
  const currentItems = filteredTypes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen pb-20">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="text-purple-600" size={32} />
            Gestion des Types de Ressources
          </h1>
          <p className="text-gray-500 mt-1">Configurez les catégories de matériel disponibles pour les besoins.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un type..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
          >
            <Plus size={20} />
            Nouveau Type
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
                    <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Libellé</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Standard</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentItems.map((type) => (
                    <tr key={type.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100">
                            <Box size={20} />
                          </div>
                          <span className="font-bold text-gray-900">{type.libelle}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 uppercase">
                          {type.code}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        {type.estStandard ? (
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase border border-blue-100">
                            Système
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-medium">Personnalisé</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 w-fit ${type.actif ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                          {type.actif ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {type.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right space-x-2">
                        <button 
                          onClick={() => handleOpenModal(type)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(type.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-8 py-5 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500">
                Page <span className="font-bold text-gray-900">{currentPage}</span> sur <span className="font-bold text-gray-900">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p-1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-gray-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-gray-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingType ? 'Modifier le Type' : 'Nouveau Type'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Code (Unique)</label>
                <input 
                  required
                  type="text"
                  placeholder="Ex: LAPTOP_DELL"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-mono font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Libellé (Nom affiché)</label>
                <input 
                  required
                  type="text"
                  placeholder="Ex: Ordinateur Portable Dell"
                  value={formData.libelle}
                  onChange={(e) => setFormData({...formData, libelle: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      checked={formData.actif}
                      onChange={(e) => setFormData({...formData, actif: e.target.checked})}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${formData.actif ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.actif ? 'translate-x-6' : ''}`}></div>
                  </div>
                  <span className="text-sm font-bold text-gray-700">Actif</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      checked={formData.estStandard}
                      onChange={(e) => setFormData({...formData, estStandard: e.target.checked})}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${formData.estStandard ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.estStandard ? 'translate-x-6' : ''}`}></div>
                  </div>
                  <span className="text-sm font-bold text-gray-700">Standard</span>
                </label>
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
                  {saving ? <Loader className="animate-spin" size={20} /> : (editingType ? 'Mettre à jour' : 'Créer le type')}
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
              <h2 className="text-xl font-bold text-gray-900 mb-2">Supprimer le type</h2>
              <p className="text-gray-500 text-sm mb-8">
                Êtes-vous sûr de vouloir supprimer ce type de ressource ? Cela pourrait affecter les besoins existants.
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

export default TypesRessourcesPage;
