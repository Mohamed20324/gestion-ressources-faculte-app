import { useState, useEffect } from 'react';
import { 
  Users, Search, Loader, Filter, 
  ExternalLink, ShieldAlert, 
  Mail, Building2, MapPin, X, Info
} from 'lucide-react';
import { api } from '../../services/api';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

const FournisseursPage = () => {
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBlacklistModal, setShowBlacklistModal] = useState({ show: false, supplierId: null as number | null });
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
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
            <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-600 shadow-sm">
              <Filter size={20} />
            </button>
          </div>
        </div>

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
            <div className="h-24 bg-slate-900 flex items-center justify-between px-8">
              <h2 className="text-xl font-bold text-white tracking-tight">Fiche Partenaire</h2>
              <button onClick={() => setSelectedProfile(null)} className="text-white/60 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8">
              <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100">
                <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <Building2 size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedProfile.nomSociete}</h3>
                  <p className="text-sm font-medium text-gray-400">{selectedProfile.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Gérant</p>
                  <p className="text-sm font-bold text-gray-800">{selectedProfile.gerant || 'Non renseigné'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Téléphone</p>
                  <p className="text-sm font-bold text-gray-800">{selectedProfile.telephone || 'Non renseigné'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Localisation</p>
                  <p className="text-sm font-bold text-gray-800">{selectedProfile.lieu || 'Non renseigné'}</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 mb-8">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5">Adresse de Livraison</p>
                <p className="text-sm text-gray-700 font-medium leading-relaxed">
                  {selectedProfile.adresse || "L'adresse détaillée n'a pas été fournie."}
                </p>
              </div>

              <button 
                onClick={() => setSelectedProfile(null)}
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md"
              >
                Fermer la fiche
              </button>
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
    </div>
  );
};

export default FournisseursPage;
