import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Loader, DollarSign, User, Building2, Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationContainer } from '../../components/Notification';

interface Departement {
    id: number;
    nom: string;
    budget: number;
    nomChef?: string;
    chefId?: number;
}

interface Chef {
    id: number;
    nom: string;
    prenom: string;
}

const DepartmentsPage = () => {
    const { notifications, showNotification, removeNotification } = useNotifications();
    const [departements, setDepartements] = useState<Departement[]>([]);
    const [chefs, setChefs] = useState<Chef[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deptToDelete, setDeptToDelete] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editingDept, setEditingDept] = useState<Departement | null>(null);

    // Pagination & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const [formData, setFormData] = useState({
        nom: '',
        budget: 0,
        chefId: undefined as number | undefined
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [deptsRes, chefsRes] = await Promise.allSettled([
                api.getAllDepartements(),
                api.getUsersByRole('CHEF_DEPARTEMENT')
            ]);

            if (deptsRes.status === 'fulfilled' && deptsRes.value.ok) {
                const data = await deptsRes.value.json();
                setDepartements(Array.isArray(data) ? data : []);
            }

            if (chefsRes.status === 'fulfilled' && chefsRes.value.ok) {
                const data = await chefsRes.value.json();
                setChefs(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Erreur chargement départements:', error);
            showNotification('error', 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.nom) {
            showNotification('warning', 'Le nom du département est obligatoire');
            return;
        }
        try {
            setSaving(true);
            let response;
            if (editingDept) {
                response = await api.updateDepartement(editingDept.id, formData);
            } else {
                response = await api.createDepartement(formData);
            }

            if (response.ok) {
                await loadInitialData();
                setIsModalOpen(false);
                setEditingDept(null);
                setFormData({ nom: '', budget: 0, chefId: undefined });
                showNotification('success', editingDept ? 'Département mis à jour avec succès' : 'Département créé avec succès');
            } else {
                const error = await response.json();
                showNotification('error', error.message || 'Erreur lors de l\'enregistrement');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('error', 'Erreur technique lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!deptToDelete) return;
        try {
            setDeleting(true);
            const response = await api.deleteDepartement(deptToDelete);
            if (response.ok) {
                setDepartements(departements.filter(d => d.id !== deptToDelete));
                setIsDeleteModalOpen(false);
                setDeptToDelete(null);
                showNotification('success', 'Département supprimé avec succès');
            } else {
                const error = await response.json();
                showNotification('error', error.message || 'Impossible de supprimer ce département');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('error', 'Erreur technique lors de la suppression');
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setDeptToDelete(id);
        setIsDeleteModalOpen(true);
    };

    // Multi-search logic
    const filteredDepts = departements.filter(dept =>
        dept.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.nomChef && dept.nomChef.toLowerCase().includes(searchTerm.toLowerCase())) ||
        dept.budget.toString().includes(searchTerm)
    );

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDepts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDepts.length / itemsPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-500 font-medium">Chargement des départements...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white min-h-screen">
            <NotificationContainer notifications={notifications} removeNotification={removeNotification} />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Building2 className="text-blue-600" size={32} />
                        Gestion des Départements
                    </h1>
                    <p className="text-gray-500 mt-1 ml-11">Structure académique et budgets</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={() => { setEditingDept(null); setFormData({ nom: '', budget: 0, chefId: undefined }); setIsModalOpen(true); }}
                        className="fixed bottom-8 right-8 w-12 h-12 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 hover:scale-110 transition-all flex items-center justify-center z-[50] group"
                        title="Nouveau Département"
                    >
                        <Plus size={24} />
                        <span className="absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Nouveau Département
                        </span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Département</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Chef de département</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Budget Annuel</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentItems.map((dept) => (
                                <tr key={dept.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                                <Building2 size={20} />
                                            </div>
                                            <span className="font-bold text-gray-900">{dept.nom}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                                <User size={14} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{dept.nomChef || 'Non assigné'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                                            <DollarSign size={16} className="text-green-500" />
                                            {dept.budget.toLocaleString()} <span className="text-xs text-gray-400 font-normal">DH</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setEditingDept(dept);
                                                    setFormData({ nom: dept.nom, budget: dept.budget, chefId: dept.chefId });
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Modifier"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(dept.id)}
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

                {filteredDepts.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <Building2 className="mx-auto text-gray-200 mb-4" size={64} />
                        <p className="text-gray-500 text-lg font-medium">Aucun département trouvé.</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-6 py-4 border-t border-gray-100 rounded-2xl">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Précédent</button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Suivant</button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à <span className="font-medium">{Math.min(indexOfLastItem, filteredDepts.length)}</span> sur <span className="font-medium">{filteredDepts.length}</span> résultats
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
                title="Supprimer le département"
                message="Êtes-vous sûr de vouloir supprimer ce département ? Cette action est irréversible et pourrait échouer si des données y sont liées."
                loading={deleting}
            />

            <DeptModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                formData={formData}
                setFormData={setFormData}
                editing={!!editingDept}
                saving={saving}
                chefs={chefs}
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

const DeptModal = ({ isOpen, onClose, onSave, formData, setFormData, editing, saving, chefs }: any) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className=" absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} />
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">{editing ? 'Modifier' : 'Nouveau'} Département</h2>
                    <p className="text-gray-500 mt-1 text-sm">Définissez le nom, le budget et le responsable du département</p>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Nom du département</label>
                        <input
                            type="text"
                            placeholder="ex: Informatique"
                            value={formData.nom}
                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Budget Annuel (DH)</label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="0"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all pl-10"
                            />
                            <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Chef de Département</label>
                        <select
                            value={formData.chefId || ''}
                            onChange={(e) => setFormData({ ...formData, chefId: parseInt(e.target.value) || undefined })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                        >
                            <option value="">Sélectionner un responsable</option>
                            {chefs.map((chef: any) => (
                                <option key={chef.id} value={chef.id}>{chef.nom} {chef.prenom}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-4 mt-10">
                    <button onClick={onClose} className="flex-1 px-6 py-3.5 border border-gray-200 rounded-2xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                        Annuler
                    </button>
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="flex-1 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {saving ? <Loader className="animate-spin" size={20} /> : (editing ? 'Mettre à jour' : 'Créer le département')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepartmentsPage;