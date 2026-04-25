import { useState, useEffect } from 'react';
import { 
  Users, Search, Loader, Filter, 
  ExternalLink, ShieldAlert, CheckCircle, 
  Mail, Phone, Building2, MapPin, X, Info, Plus, User, Loader as LoaderIcon
} from 'lucide-react';
import { api } from '../../../services/api';
import { NotificationContainer } from '../../../components/Notification';
import { useNotifications } from '../../../hooks/useNotifications';

const FournisseursPage = () => {
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBlacklistModal, setShowBlacklistModal] = useState({ show: false, supplierId: null as number | null });
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ nomSociete: '', email: '', telephone: '', gerant: '', lieu: '', adresse: '', motDePasse: 'pass123' });
  const [saving, setSaving] = useState(false);
  const [motif, setMotif] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsersByRole('FOURNISSEUR');
      if (res.ok) {
        setSuppliers(await res.json());
      }
    } catch (error) {
      showNotification('error', 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSupplier = async () => {
    if (!newSupplier.email || !newSupplier.nomSociete) {
      showNotification('warning', 'Nom et Email obligatoires');
      return;
    }
    setSaving(true);
    try {
      const res = await api.createFournisseur(newSupplier);
      if (res.ok) {
        showNotification('success', 'Fournisseur enregistré avec succès');
        setIsAddModalOpen(false);
        setNewSupplier({ nomSociete: '', email: '', telephone: '', gerant: '', lieu: '', adresse: '', motDePasse: 'pass123' });
        fetchSuppliers();
      } else {
        showNotification('error', 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    } finally {
      setSaving(false);
    }
  };

  const handleBlacklist = async () => {
    if (!motif || !showBlacklistModal.supplierId) return;
    try {
      const res = await api.blacklistSupplier(showBlacklistModal.supplierId, motif);
      if (res.ok) {
        showNotification('success', 'Fournisseur ajouté à la liste noire');
        setShowBlacklistModal({ show: false, supplierId: null });
        setMotif('');
        fetchSuppliers();
      } else {
        showNotification('error', 'Erreur technique');
      }
    } catch (error) {
      showNotification('error', 'Erreur technique');
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    !s.estListeNoire && (
      s.nomSociete?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-8 bg-gray-50/30 min-h-full pb-8">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="max-w-[1400px] mx-auto">
        {/* Header section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              Annuaire Fournisseurs
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Répertoire centralisé des partenaires commerciaux et prestataires de services.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher une société..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all shadow-sm font-medium"
              />
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="p-3 bg-blue-600 text-white border border-blue-700 rounded-xl hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 font-bold text-sm"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Nouveau Partenaire</span>
            </button>
            <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-600 shadow-sm">
              <Filter size={20} />
            </button>
          </div>
        </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-10 right-10 z-[100] group flex items-center justify-center"
      >
        <div className="absolute right-full mr-4 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl">
          Ajouter un Fournisseur
        </div>
        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all duration-300 animate-in zoom-in slide-in-from-bottom-10">
          <Plus size={32} />
        </div>
        <div className="absolute inset-0 w-16 h-16 bg-blue-600 rounded-full animate-ping opacity-20 -z-10 group-hover:hidden" />
      </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Chargement de l'annuaire...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all group relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                    <Building2 size={24} />
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-gray-900 truncate">{supplier.nomSociete || 'Société'}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actif</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2.5 text-gray-600 font-medium bg-gray-50/50 p-2.5 rounded-lg border border-gray-50">
                    <Mail size={14} className="text-gray-400" />
                    <span className="text-xs truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-600 font-medium bg-gray-50/50 p-2.5 rounded-lg border border-gray-50">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-xs">{supplier.lieu || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedProfile(supplier)}
                    className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ExternalLink size={14} />
                    Voir Profil
                  </button>
                  <button 
                    onClick={() => setShowBlacklistModal({ show: true, supplierId: supplier.id })}
                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-gray-100 transition-all"
                    title="Exclure"
                  >
                    <ShieldAlert size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            {filteredSuppliers.length === 0 && (
              <div className="col-span-full py-24 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <Info className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-500 font-bold">Aucun partenaire ne correspond à votre recherche.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-200 overflow-hidden border border-gray-100">
            <div className="flex flex-col md:flex-row min-h-[400px]">
              {/* Left Section: Company Brand */}
              <div className="w-full md:w-[320px] bg-gray-50/50 p-10 border-r border-gray-100 flex flex-col items-center text-center justify-center">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-blue-600 mb-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                  <Building2 size={48} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                  {selectedProfile.nomSociete}
                </h2>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                  Fournisseur Agrée
                </span>
                
                <div className="mt-10 w-full space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 text-gray-500">
                    <Mail size={16} className="text-blue-500" />
                    <span className="text-xs font-bold truncate">{selectedProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 text-gray-500">
                    <Phone size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold">{selectedProfile.telephone || 'Non renseigné'}</span>
                  </div>
                </div>
              </div>

              {/* Right Section: Details & Address */}
              <div className="flex-1 p-10 relative flex flex-col">
                <button 
                  onClick={() => setSelectedProfile(null)} 
                  className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X size={24} />
                </button>

                <div className="flex-1">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8">Informations de l'entreprise</h3>
                  
                  <div className="grid grid-cols-2 gap-10 mb-10">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Responsable Gérant</p>
                      <p className="text-lg font-bold text-gray-900">{selectedProfile.gerant || 'Directeur Général'}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Zone d'intervention</p>
                      <p className="text-lg font-bold text-gray-900">{selectedProfile.lieu || 'Nationale'}</p>
                    </div>
                  </div>

                  <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin size={20} className="text-blue-600" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Siège Social & Livraison</p>
                    </div>
                    <p className="text-sm font-medium text-gray-700 leading-relaxed">
                      {selectedProfile.adresse || "L'adresse détaillée n'a pas été renseignée dans le profil du partenaire."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-6 border-t border-gray-50">
                  <button 
                    onClick={() => setSelectedProfile(null)}
                    className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                  >
                    Fermer la fiche
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blacklist Modal */}
      {showBlacklistModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={36} />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Mise en Liste Noire</h3>
            <p className="text-sm text-gray-500 text-center mb-8 font-medium">Justifiez l'exclusion définitive de ce partenaire.</p>
            
            <textarea 
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Saisissez le motif de l'exclusion..."
              className="w-full h-28 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 font-medium transition-all mb-6 text-sm resize-none"
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setShowBlacklistModal({ show: false, supplierId: null })}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm"
              >
                Annuler
              </button>
              <button 
                onClick={handleBlacklist}
                disabled={!motif}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md disabled:opacity-50 text-sm"
              >
                Exclure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      <AddSupplierModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveSupplier}
        formData={newSupplier}
        setFormData={setNewSupplier}
        saving={saving}
      />
    </div>
  );
};

const AddSupplierModal = ({ isOpen, onClose, onSave, formData, setFormData, saving }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Nouveau Partenaire</h2>
            <p className="text-gray-500 text-sm font-medium">Enregistrez un nouveau fournisseur dans le système</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom de la Société</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
              <input 
                required
                value={formData.nomSociete}
                onChange={e => setFormData({...formData, nomSociete: e.target.value})}
                placeholder="ex: Tech Solutions SARL"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Professionnel</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                required
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="contact@societe.com"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                value={formData.telephone}
                onChange={e => setFormData({...formData, telephone: e.target.value})}
                placeholder="06..."
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gérant / Contact</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                value={formData.gerant}
                onChange={e => setFormData({...formData, gerant: e.target.value})}
                placeholder="Nom du responsable"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ville</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                value={formData.lieu}
                onChange={e => setFormData({...formData, lieu: e.target.value})}
                placeholder="ex: Casablanca"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
              />
            </div>
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Adresse Siège</label>
            <textarea 
              value={formData.adresse}
              onChange={e => setFormData({...formData, adresse: e.target.value})}
              placeholder="Adresse complète..."
              className="w-full h-24 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all"
          >
            Annuler
          </button>
          <button 
            onClick={onSave}
            disabled={saving}
            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2"
          >
            {saving ? <LoaderIcon className="animate-spin" /> : 'Créer le Partenaire'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FournisseursPage;


