import { useState, useEffect } from 'react';
import { 
  Users, Search, Loader, Filter, 
  ExternalLink, ShieldAlert, CheckCircle, 
  Mail, Phone, Building2, MapPin
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
        showNotification('error', 'Erreur lors de la mise sur liste noire');
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
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Gestion des Fournisseurs</h1>
            <p className="text-gray-500 font-medium">Visualisez et gérez vos partenaires commerciaux</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher par société ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[1.5rem] shadow-xl shadow-gray-100/50 outline-none focus:ring-4 focus:ring-purple-100 transition-all font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader className="animate-spin text-purple-600 mb-4" size={48} />
            <p className="text-gray-500 font-bold">Chargement des partenaires...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl hover:shadow-2xl hover:border-purple-100 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-gray-900">{supplier.nomSociete || 'Société Inconnue'}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        PARTENAIRE ACTIF
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-gray-600 font-medium bg-gray-50 p-3 rounded-xl">
                      <Mail size={16} className="text-purple-500" />
                      <span className="text-sm truncate">{supplier.email}</span>
                    </div>
                    {supplier.lieu && (
                      <div className="flex items-center gap-3 text-gray-600 font-medium bg-gray-50 p-3 rounded-xl">
                        <MapPin size={16} className="text-blue-500" />
                        <span className="text-sm">{supplier.lieu}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSelectedProfile(supplier)}
                      className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={16} />
                      Profil
                    </button>
                    <button 
                      onClick={() => setShowBlacklistModal({ show: true, supplierId: supplier.id })}
                      className="w-12 h-12 flex items-center justify-center text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-all"
                      title="Ajouter à la liste noire"
                    >
                      <ShieldAlert size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl animate-in slide-in-from-bottom-10 duration-300 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-purple-600 to-blue-600 relative">
              <button 
                onClick={() => setSelectedProfile(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <Users size={20} />
              </button>
            </div>
            
            <div className="px-10 pb-10 -mt-12 relative z-10">
              <div className="w-24 h-24 bg-white p-2 rounded-[2rem] shadow-xl mb-6">
                <div className="w-full h-full bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-purple-600 border border-gray-100">
                  <Building2 size={40} />
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-900">{selectedProfile.nomSociete}</h2>
                <p className="text-gray-400 font-bold flex items-center gap-2 mt-1">
                  <Mail size={14} /> {selectedProfile.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Responsable / Gérant</p>
                  <p className="text-lg font-bold text-gray-800">{selectedProfile.gerant || 'Non renseigné'}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Téléphone</p>
                  <p className="text-lg font-bold text-gray-800">{selectedProfile.telephone || 'Non renseigné'}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Ville / Lieu</p>
                  <p className="text-lg font-bold text-gray-800">{selectedProfile.lieu || 'Non renseigné'}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Site Internet</p>
                  <p className="text-lg font-bold text-blue-600 truncate">{selectedProfile.siteInternet || 'Non renseigné'}</p>
                </div>
              </div>

              <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100 mb-8">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-3">Adresse complète</p>
                <p className="text-gray-700 font-medium leading-relaxed">
                  {selectedProfile.adresse || "L'adresse détaillée n'a pas encore été renseignée par le partenaire."}
                </p>
              </div>

              <button 
                onClick={() => setSelectedProfile(null)}
                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-gray-800 transition-all"
              >
                Fermer le profil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blacklist Modal */}
      {showBlacklistModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
              <ShieldAlert size={32} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Exclure le partenaire</h3>
            <p className="text-gray-500 font-medium mb-8">Veuillez justifier l'ajout de ce fournisseur à la liste noire.</p>
            
            <textarea 
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Motif d'exclusion (ex: Délais non respectés, Qualité médiocre...)"
              className="w-full h-32 p-6 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-red-100 font-medium transition-all mb-8 resize-none"
            />

            <div className="flex gap-4">
              <button 
                onClick={() => setShowBlacklistModal({ show: false, supplierId: null })}
                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={handleBlacklist}
                disabled={!motif}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FournisseursPage;
