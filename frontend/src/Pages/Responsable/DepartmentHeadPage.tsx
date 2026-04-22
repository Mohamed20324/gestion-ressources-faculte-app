import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Crown, X, Loader, Mail, Building2, Search, ChevronLeft, ChevronRight, AlertTriangle, User, Eye, Power, ShieldCheck, ShieldAlert, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationContainer } from '../../components/Notification';

interface DepartmentHead {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    matricule?: string;
    departementId?: number;
    departementNom?: string;
    dateNomination?: string;
    actif: boolean;
    motDePasse?: string;
}

interface Departement {
    id: number;
    nom: string;
}

const DepartmentHeadPage = () => {
    const { notifications, showNotification, removeNotification } = useNotifications();
    const [heads, setHeads] = useState<DepartmentHead[]>([]);
    const [departements, setDepartements] = useState<Departement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [headToDelete, setHeadToDelete] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editingHead, setEditingHead] = useState<DepartmentHead | null>(null);
    const [viewingHead, setViewingHead] = useState<DepartmentHead | null>(null);
    const [togglingStatus, setTogglingStatus] = useState<number | null>(null);

    // Pagination & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [headsRes, deptsRes] = await Promise.allSettled([
                api.getUsersByRole('CHEF_DEPARTEMENT'),
                api.getAllDepartements()
            ]);

            if (headsRes.status === 'fulfilled' && headsRes.value.ok) {
                const data = await headsRes.value.json();
                setHeads(Array.isArray(data) ? data : []);
            }

            if (deptsRes.status === 'fulfilled' && deptsRes.value.ok) {
                const data = await deptsRes.value.json();
                setDepartements(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('error', 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (formData: any) => {
        if (!formData.nom || !formData.prenom || !formData.email) {
            showNotification('warning', 'Les champs obligatoires doivent être remplis');
            return;
        }
        try {
            setSaving(true);
            let response;
            if (editingHead) {
                const { motDePasse, ...updateData } = formData;
                // S'assurer que departementId est bien un nombre
                if (updateData.departementId) {
                    updateData.departementId = Number(updateData.departementId);
                }
                console.log('🔧 Mise à jour chef de département:', updateData);
                response = await api.updateUser(editingHead.id, updateData);
            } else {
                response = await api.createChef(formData);
            }

            if (response.ok) {
                await loadInitialData();
                setIsModalOpen(false);
                setEditingHead(null);
                showNotification('success', editingHead ? 'Responsable mis à jour avec succès' : 'Responsable nommé avec succès');
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

    const toggleAccountStatus = async (head: DepartmentHead) => {
        try {
            setTogglingStatus(head.id);
            const response = await api.updateUser(head.id, { actif: !head.actif });
            if (response.ok) {
                setHeads(heads.map(h => h.id === head.id ? { ...h, actif: !h.actif } : h));
                showNotification('success', head.actif ? 'Compte désactivé' : 'Compte activé');
            } else {
                showNotification('error', 'Erreur lors du changement de statut');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('error', 'Erreur technique');
        } finally {
            setTogglingStatus(null);
        }
    };

    const confirmDelete = async () => {
        if (!headToDelete) return;
        try {
            setDeleting(true);
            const response = await api.deleteUser(headToDelete);
            if (response.ok) {
                setHeads(heads.filter(h => h.id !== headToDelete));
                setIsDeleteModalOpen(false);
                setHeadToDelete(null);
                showNotification('success', 'Responsable supprimé avec succès');
            } else {
                const error = await response.json();
                showNotification('error', error.message || 'Impossible de supprimer ce responsable');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('error', 'Erreur technique lors de la suppression');
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setHeadToDelete(id);
        setIsDeleteModalOpen(true);
    };

    // Multi-search logic
    const filteredHeads = heads.filter(h => 
        h.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.matricule && h.matricule.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (h.departementNom && h.departementNom.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredHeads.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredHeads.length / itemsPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50/50">
                <div className="text-center">
                    <Loader className="animate-spin text-orange-500 mx-auto mb-4" size={48} />
                    <p className="text-gray-500 font-medium">Chargement des responsables...</p>
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
                        <Crown className="text-orange-500" size={32} />
                        Chefs de département
                    </h1>
                    <p className="text-gray-500 mt-1 ml-11">Gestion des hauts responsables académiques</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Rechercher..." 
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        />
                    </div>
                    <button 
                        onClick={() => { setEditingHead(null); setIsModalOpen(true); }}
                        className="fixed bottom-8 right-8 w-12 h-12 bg-orange-500 text-white rounded-full shadow-2xl hover:bg-orange-600 hover:scale-110 transition-all flex items-center justify-center z-[50] group"
                        title="Nommer un chef"
                    >
                        <Plus size={24} />
                        <span className="absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Nommer Chef
                        </span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Chef</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Matricule</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Département</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentItems.map((head) => (
                                <tr key={head.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 font-bold border border-orange-100">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{head.nom} {head.prenom}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Mail size={12} /> {head.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-mono font-bold text-gray-700">
                                        {head.matricule || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                            <Building2 size={14} className="text-gray-400" />
                                            {head.departementNom || 'Non assigné'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${head.actif ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                            {head.actif ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                            {head.actif ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button 
                                                onClick={() => setViewingHead(head)}
                                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Voir détails"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button 
                                                onClick={() => toggleAccountStatus(head)}
                                                disabled={togglingStatus === head.id}
                                                className={`p-2 rounded-lg transition-colors ${head.actif ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={head.actif ? 'Désactiver le compte' : 'Activer le compte'}
                                            >
                                                {togglingStatus === head.id ? <Loader className="animate-spin" size={18} /> : <Power size={18} />}
                                            </button>
                                            <button 
                                                onClick={() => { setEditingHead(head); setIsModalOpen(true); }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Modifier"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(head.id)}
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

                {filteredHeads.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <Crown className="mx-auto text-gray-200 mb-4" size={64} />
                        <p className="text-gray-500 text-lg font-medium">Aucun responsable trouvé.</p>
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
                                Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à <span className="font-medium">{Math.min(indexOfLastItem, filteredHeads.length)}</span> sur <span className="font-medium">{filteredHeads.length}</span> résultats
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
                                    className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${currentPage === i + 1 ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'text-gray-600 hover:bg-gray-50'}`}
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
                title="Supprimer le responsable"
                message="Êtes-vous sûr de vouloir supprimer ce chef de département ? Cette action est irréversible."
                loading={deleting}
            />

            <DepartmentHeadModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                head={editingHead} 
                saving={saving}
                departements={departements}
            />

            <HeadDetailModal 
                isOpen={!!viewingHead} 
                onClose={() => setViewingHead(null)} 
                head={viewingHead} 
            />
        </div>
    );
};

const HeadDetailModal = ({ isOpen, onClose, head }: any) => {
    if (!isOpen || !head) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-4 border border-orange-100">
                        <Crown size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{head.nom} {head.prenom}</h2>
                    <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${head.actif ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {head.actif ? 'Compte Actif' : 'Compte Inactif'}
                    </span>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Informations de compte</p>
                        <div className="flex items-center gap-3 text-gray-700 mb-2">
                            <Mail size={16} className="text-gray-400" />
                            <span className="text-sm font-medium">{head.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <ShieldCheck size={16} className="text-gray-400" />
                            <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200 break-all w-full">
                                {head.motDePasse || 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Détails de fonction</p>
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Département Géré</p>
                                <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                    <Building2 size={14} className="text-orange-500" />
                                    {head.departementNom || 'Non assigné'}
                                </p>
                            </div>
                            {head.matricule && (
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Matricule</p>
                                    <p className="text-sm font-bold text-gray-800 font-mono">{head.matricule}</p>
                                </div>
                            )}
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

const DepartmentHeadModal = ({ isOpen, onClose, onSave, head, saving, departements }: any) => {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        motDePasse: '',
        matricule: '',
        specialite: '',
        departementId: undefined as number | undefined,
        dateNomination: ''
    });

    useEffect(() => {
        if (head) {
            setFormData({
                nom: head.nom,
                prenom: head.prenom,
                email: head.email,
                motDePasse: '',
                matricule: head.matricule || '',
                specialite: head.specialite || '',
                departementId: head.departementId,
                dateNomination: head.dateNomination || ''
            });
        } else {
            const today = new Date().toISOString().split('T')[0];
            setFormData({ nom: '', prenom: '', email: '', motDePasse: '', matricule: '', specialite: '', departementId: undefined, dateNomination: today });
        }
    }, [head, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} />
                </button>
                
                <div className="mb-5">
                    <h2 className="text-xl font-bold text-gray-900">{head ? 'Modifier' : 'Nommer'} Chef de Département</h2>
                    <p className="text-gray-500 mt-0.5 text-xs">Affectez un nouveau responsable au département</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Nom</label>
                        <input type="text" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Prénom</label>
                        <input type="text" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Email professionnel</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                    </div>
                    {!head && (
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Mot de passe provisoire</label>
                            <input type="password" value={formData.motDePasse} onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                        </div>
                    )}
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Matricule</label>
                        <input type="text" value={formData.matricule} onChange={(e) => setFormData({ ...formData, matricule: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Date de nomination</label>
                        <div className="relative group">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 group-hover:text-orange-600 transition-colors pointer-events-none" size={16} />
                            <input 
                                type="date" 
                                value={formData.dateNomination} 
                                onChange={(e) => setFormData({ ...formData, dateNomination: e.target.value })} 
                                onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all cursor-pointer appearance-none" 
                            />
                        </div>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Département à diriger</label>
                        <select 
                            value={formData.departementId || ''} 
                            onChange={(e) => setFormData({ ...formData, departementId: parseInt(e.target.value) || undefined })} 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all appearance-none"
                        >
                            <option value="">Sélectionner un département</option>
                            {departements.map((dept: any) => (
                                <option key={dept.id} value={dept.id}>{dept.nom}</option>
                            ))}
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
                        className="flex-1 px-6 py-3.5 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {saving ? <Loader className="animate-spin" size={20} /> : (head ? 'Mettre à jour' : 'Nommer Chef')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepartmentHeadPage;
