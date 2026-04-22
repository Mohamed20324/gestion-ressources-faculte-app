import { useState, useEffect } from 'react';
import { 
  History, Loader, CheckCircle, 
  XCircle, FileText, Calendar, DollarSign,
  Search, ChevronRight, Package, Info
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

const DossiersTraitesPage = () => {
  const { user } = useAuth();
  const { notifications, showNotification, removeNotification } = useNotifications();
  
  const [soumissions, setSoumissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSoumission, setSelectedSoumission] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSoumissions();
  }, []);

  const fetchSoumissions = async () => {
    setLoading(true);
    try {
      const res = await api.getMyOffres(user?.id);
      if (res.ok) {
        const data = await res.json();
        // Filtrer pour ne garder que les appels d'offres TRAITES ou CLOTURES
        const traites = data.filter((s: any) => s.appelOffreStatut === 'TRAITE' || s.appelOffreStatut === 'CLOTURE');
        setSoumissions(traites);
      }
    } catch (error) {
      showNotification('error', 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const filtered = soumissions.filter(s => 
    s.appelOffreReference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen pb-24">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <History className="text-purple-600" size={40} />
            Dossiers Traités
          </h1>
          <p className="text-gray-500 font-medium mt-1">Historique des appels d'offres finalisés.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher une référence..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-bold transition-all shadow-xl shadow-gray-100/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader className="animate-spin text-purple-600 mb-4" size={48} />
          <p className="text-gray-500 font-bold">Analyse de l'historique...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl relative overflow-hidden group hover:border-purple-200 transition-all">
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                      <FileText size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-gray-900">{s.appelOffreReference}</h3>
                        <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                          AO {s.appelOffreStatut}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-bold mt-1">Résultat final pour ce marché</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Votre Offre</p>
                      <p className="text-xl font-black text-gray-900">{s.montantTotal?.toLocaleString()} <span className="text-xs text-gray-400">DH</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut Final</p>
                      <div className={`flex items-center gap-1.5 font-bold ${
                        s.statut === 'ACCEPTEE' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {s.statut === 'ACCEPTEE' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        {s.statut}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center lg:w-48 gap-3">
                  <button 
                    onClick={() => { setSelectedSoumission(s); setIsModalOpen(true); }}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-600 transition-all shadow-lg"
                  >
                    <Info size={18} />
                    Consulter
                  </button>
                  {s.statut === 'REJETEE' && s.motifRejet && (
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Motif du rejet</p>
                      <p className="text-xs font-bold text-red-700 italic">"{s.motifRejet}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
              <History className="mx-auto text-gray-200 mb-4" size={64} />
              <p className="text-gray-500 font-bold text-xl">Aucun dossier traité pour le moment.</p>
            </div>
          )}
        </div>
      )}

      {/* Reused Modal from MesSoumissionsPage */}
      {isModalOpen && selectedSoumission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <FileText className="text-purple-600" />
                  Détails du Dossier
                </h2>
                <p className="text-sm text-gray-500 font-medium">Référence AO : <span className="text-purple-600 font-bold">{selectedSoumission.appelOffreReference}</span></p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-white hover:shadow-lg rounded-2xl transition-all text-gray-400 hover:text-gray-900"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)] space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Montant</p>
                  <p className="text-xl font-black text-purple-700">{selectedSoumission.montantTotal?.toLocaleString()} DH</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Délai</p>
                  <p className="text-xl font-black text-blue-700">{selectedSoumission.delaiLivraison} Jours</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Garantie</p>
                  <p className="text-xl font-black text-amber-700">{selectedSoumission.dureeGarantie} Mois</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Package className="text-purple-600" size={20} />
                  Récapitulatif technique
                </h3>
                
                <div className="space-y-4">
                  {selectedSoumission.lignes?.map((ligne: any, idx: number) => (
                    <div key={idx} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2 py-1 bg-white text-purple-600 rounded-lg text-[10px] font-black border border-purple-100">
                            {ligne.variante}
                          </span>
                          <h4 className="font-bold text-gray-900">{ligne.marque}</h4>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-medium">
                          {ligne.variante === 'ORDINATEUR' && (
                            <>
                              <span>{ligne.cpu}</span>
                              <span>{ligne.ram}</span>
                              <span>{ligne.disqueDur}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">{ligne.prixUnitaire?.toLocaleString()} DH x {ligne.quantite}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DossiersTraitesPage;
