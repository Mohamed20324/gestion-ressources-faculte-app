import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Wrench, X, Loader, Mail, Phone, User, Search, ChevronLeft, ChevronRight, AlertTriangle, Eye, Power, ShieldCheck, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';

interface Technician {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  specialite?: string;
  disponibilite?: string;
  actif: boolean;
  motDePasse?: string;
}

const TechniciansPage = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [techToDelete, setTechToDelete] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [viewingTech, setViewingTech] = useState<Technician | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<number | null>(null);

  // Pagination & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      const response = await api.getUsersByRole('TECHNICIEN');
      if (response.ok) {
        const data = await response.json();
        setTechnicians(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      setSaving(true);
      let response;
      if (editingTech) {
        const { motDePasse, ...updateData } = formData;
        response = await api.updateUser(editingTech.id, updateData);
      } else {
        response = await api.createTechnicien(formData);
      }

      if (response.ok) {
        await loadTechnicians();
        setIsModalOpen(false);
        setEditingTech(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur technique lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const toggleAccountStatus = async (tech: Technician) => {
    try {
      setTogglingStatus(tech.id);
      const response = await api.updateUser(tech.id, { actif: !tech.actif });
      if (response.ok) {
        setTechnicians(technicians.map(t => t.id === tech.id ? { ...t, actif: !t.actif } : t));
      } else {
        alert('Erreur lors du changement de statut');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur technique');
    } finally {
      setTogglingStatus(null);
    }
  };

  const confirmDelete = async () => {
    if (!techToDelete) return;
    try {
      setDeleting(true);
      const response = await api.deleteUser(techToDelete);
      if (response.ok) {
        setTechnicians(technicians.filter(t => t.id !== techToDelete));
        setIsDeleteModalOpen(false);
        setTechToDelete(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Impossible de supprimer ce technicien');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur technique lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setTechToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Multi-search logic
  const filteredTechnicians = technicians.filter(t => 
    t.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.specialite && t.specialite.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.telephone && t.telephone.includes(searchTerm))
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTechnicians.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTechnicians.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50/50">
        <div className="text-center">
          <Loader className="animate-spin text-green-600 mx-auto mb-4" size={48} />
          <p className="text-gray-500 font-medium">Chargement des techniciens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Wrench className="text-green-600" size={32} />
            Équipe Technique
          </h1>
          <p className="text-gray-500 mt-1 ml-11">Gestion de la maintenance et du support</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => { setEditingTech(null); setIsModalOpen(true); }}
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center gap-2 font-semibold whitespace-nowrap"
          >
            <Plus size={20} />
            Nouveau
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Technicien</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Spécialité</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentItems.map((tech) => (
                <tr key={tech.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 border border-green-100">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{tech.nom} {tech.prenom}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail size={12} /> {tech.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} className="text-gray-400" />
                      {tech.telephone || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                      {tech.specialite || 'Générale'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider w-fit ${tech.disponibilite === 'Occupé' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                        {tech.disponibilite || 'Disponible'}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold w-fit ${tech.actif ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {tech.actif ? 'Compte Actif' : 'Compte Inactif'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 transition-opacity">
                      <button 
                        onClick={() => setViewingTech(tech)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Voir détails"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => toggleAccountStatus(tech)}
                        disabled={togglingStatus === tech.id}
                        className={`p-2 rounded-lg transition-colors ${tech.actif ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                        title={tech.actif ? 'Désactiver le compte' : 'Activer le compte'}
                      >
                        {togglingStatus === tech.id ? <Loader className="animate-spin" size={18} /> : <Power size={18} />}
                      </button>
                      <button 
                        onClick={() => { setEditingTech(tech); setIsModalOpen(true); }} 
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(tech.id)} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTechnicians.length === 0 && !loading && (
          <div className="text-center py-20 bg-gray-50/50">
            <Wrench className="mx-auto text-gray-200 mb-4" size={64} />
            <p className="text-gray-500 text-lg font-medium">Aucun technicien trouvé.</p>
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
                Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à <span className="font-medium">{Math.min(indexOfLastItem, filteredTechnicians.length)}</span> sur <span className="font-medium">{filteredTechnicians.length}</span> résultats
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
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${currentPage === i + 1 ? 'bg-green-600 text-white shadow-lg shadow-blue-100' : 'text-gray-600 hover:bg-gray-50'}`}
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
        title="Supprimer le technicien"
        message="Êtes-vous sûr de vouloir supprimer ce technicien ? Cette action est irréversible."
        loading={deleting}
      />

      <TechnicianModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        technician={editingTech} 
        saving={saving}
      />

      <TechDetailModal 
        isOpen={!!viewingTech} 
        onClose={() => setViewingTech(null)} 
        tech={viewingTech} 
      />
    </div>
  );
};

const TechDetailModal = ({ isOpen, onClose, tech }: any) => {
    if (!isOpen || !tech) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-4 border border-green-100">
                        <Wrench size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{tech.nom} {tech.prenom}</h2>
                    <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${tech.actif ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {tech.actif ? 'Compte Actif' : 'Compte Inactif'}
                    </span>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Informations de compte</p>
                        <div className="flex items-center gap-3 text-gray-700 mb-2">
                            <Mail size={16} className="text-gray-400" />
                            <span className="text-sm font-medium">{tech.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <ShieldCheck size={16} className="text-gray-400" />
                            <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200 break-all w-full">
                                {tech.motDePasse || 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Détails Techniques</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Spécialité</p>
                                <p className="text-sm font-bold text-gray-800">{tech.specialite || 'Générale'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Disponibilité</p>
                                <p className={`text-sm font-bold ${tech.disponibilite === 'Occupé' ? 'text-orange-600' : 'text-green-600'}`}>
                                    {tech.disponibilite || 'Disponible'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Téléphone</p>
                                <p className="text-sm font-bold text-gray-800">{tech.telephone || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={onClose}
                    className="w-full mt-8 py-3.5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
                >
                    Fermer
                </button>
            </div>
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

const TechnicianModal = ({ isOpen, onClose, onSave, technician, saving }: any) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    telephone: '',
    specialite: '',
    disponibilite: 'Disponible'
  });

  useEffect(() => {
    if (technician) {
      setFormData({
        nom: technician.nom,
        prenom: technician.prenom,
        email: technician.email,
        motDePasse: '',
        telephone: technician.telephone || '',
        specialite: technician.specialite || '',
        disponibilite: technician.disponibilite || 'Disponible'
      });
    } else {
      setFormData({ nom: '', prenom: '', email: '', motDePasse: '', telephone: '', specialite: '', disponibilite: 'Disponible' });
    }
  }, [technician, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{technician ? 'Modifier' : 'Nouveau'} Technicien</h2>
          <p className="text-gray-500 mt-1 text-sm">Créez ou modifiez les accès du personnel technique</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="col-span-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Nom</label>
            <input type="text" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Prénom</label>
            <input type="text" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" />
          </div>
          {!technician && (
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Mot de passe provisoire</label>
              <input type="password" value={formData.motDePasse} onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" />
            </div>
          )}
          <div className="col-span-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Téléphone</label>
            <input type="text" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Spécialité</label>
            <input type="text" value={formData.specialite} onChange={(e) => setFormData({ ...formData, specialite: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Disponibilité</label>
            <select value={formData.disponibilite} onChange={(e) => setFormData({ ...formData, disponibilite: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all appearance-none">
              <option value="Disponible">Disponible</option>
              <option value="Occupé">Occupé</option>
              <option value="En congé">En congé</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="flex-1 px-6 py-3.5 border border-gray-200 rounded-2xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button 
            onClick={() => onSave(formData)} 
            disabled={saving}
            className="flex-1 px-6 py-3.5 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {saving ? <Loader className="animate-spin" size={20} /> : (technician ? 'Mettre à jour' : 'Enregistrer')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechniciansPage;