import { useState, useEffect } from 'react';
import { 
  Package, Loader, Clock, CheckCircle, 
  XCircle, FileText, Calendar, DollarSign,
  Search, Filter, ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

const MesSoumissionsPage = () => {
  const { user } = useAuth();
  const { notifications, showNotification, removeNotification } = useNotifications();
  
  const [soumissions, setSoumissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
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
        setSoumissions(await res.json());
      }
    } catch (error) {
      showNotification('error', 'Erreur de chargement des soumissions');
    } finally {
      setLoading(false);
    }
  };

  const filteredSoumissions = soumissions.filter(s => {
    const matchesSearch = s.appelOffreReference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (statut: string) => {
    switch (statut) {
      case 'ACCEPTEE': return 'bg-green-50 text-green-700 border-green-100';
      case 'REJETEE': return 'bg-red-50 text-red-700 border-red-100';
      case 'SOUMISE': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'ELIMINEE': return 'bg-gray-900 text-white border-gray-900';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'ACCEPTEE': return <CheckCircle size={14} />;
      case 'REJETEE': return <XCircle size={14} />;
      case 'SOUMISE': return <Clock size={14} />;
      case 'ELIMINEE': return <XCircle size={14} />;
      default: return null;
    }
  };

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen pb-24">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <Package className="text-purple-600" size={40} />
            Mes Soumissions
          </h1>
          <p className="text-gray-500 font-medium mt-1">Suivez l'état de vos propositions commerciales.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Référence AO..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-purple-100 font-bold transition-all shadow-xl shadow-gray-100/50"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-6 py-4 bg-white border border-gray-100 rounded-3xl font-bold text-gray-700 outline-none shadow-xl shadow-gray-100/50"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="SOUMISE">En attente</option>
            <option value="ACCEPTEE">Acceptées</option>
            <option value="REJETEE">Refusées</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader className="animate-spin text-purple-600 mb-4" size={48} />
          <p className="text-gray-500 font-bold">Récupération de vos dossiers...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredSoumissions.map((s) => (
            <div key={s.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl group hover:shadow-2xl transition-all relative overflow-hidden">
              {/* Status Indicator Bar */}
              <div className={`absolute top-0 left-0 w-2 h-full ${
                s.statut === 'ACCEPTEE' ? 'bg-green-500' : 
                s.statut === 'REJETEE' ? 'bg-red-500' : 
                s.statut === 'SOUMISE' ? 'bg-blue-500' : 'bg-gray-400'
              }`} />

              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100">
                      <FileText size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-gray-900">{s.appelOffreReference || 'AO-#' + s.appelOffreId}</h3>
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border ${getStatusStyle(s.statut)}`}>
                          {getStatusIcon(s.statut)}
                          {s.statut}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-bold mt-1">ID Soumission : #{s.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <DollarSign size={12} className="text-green-500" /> Montant Total
                      </p>
                      <p className="text-xl font-black text-gray-900">{s.montantTotal?.toLocaleString()} <span className="text-xs text-gray-400">DH</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar size={12} className="text-purple-400" /> Date Soumission
                      </p>
                      <p className="font-bold text-gray-700">{Array.isArray(s.dateSoumission) ? `${s.dateSoumission[2]}/${s.dateSoumission[1]}/${s.dateSoumission[0]}` : s.dateSoumission}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={12} className="text-blue-400" /> Délai Livraison
                      </p>
                      <p className="font-bold text-gray-700">{s.delaiLivraison} jours</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center lg:w-48 gap-3">
                  <button 
                    onClick={() => { setSelectedSoumission(s); setIsModalOpen(true); }}
                    className="w-full py-3 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-600 transition-all shadow-lg"
                  >
                    <FileText size={18} />
                    Détails
                  </button>

                  {s.statut === 'REJETEE' && s.motifRejet && (
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Motif du refus</p>
                      <p className="text-xs font-bold text-red-700 italic">"{s.motifRejet}"</p>
                    </div>
                  )}
                  {s.statut === 'ACCEPTEE' && (
                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-center">
                      <CheckCircle className="mx-auto text-green-500 mb-1" size={24} />
                      <p className="text-xs font-bold text-green-700 text-[10px]">Acceptée ! Préparez la livraison.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredSoumissions.length === 0 && (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
              <FileText className="mx-auto text-gray-200 mb-4" size={64} />
              <p className="text-gray-500 font-bold text-xl">Aucune soumission trouvée.</p>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {isModalOpen && selectedSoumission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <FileText className="text-purple-600" />
                  Détails de la Soumission
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
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Total</p>
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
                  Articles proposés
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
                              <span className="flex items-center gap-1"><ChevronRight size={12} /> {ligne.cpu}</span>
                              <span className="flex items-center gap-1"><ChevronRight size={12} /> {ligne.ram}</span>
                              <span className="flex items-center gap-1"><ChevronRight size={12} /> {ligne.disqueDur}</span>
                              <span className="flex items-center gap-1"><ChevronRight size={12} /> {ligne.ecran}</span>
                            </>
                          )}
                          {ligne.variante === 'IMPRIMANTE' && (
                            <>
                              <span className="flex items-center gap-1"><ChevronRight size={12} /> {ligne.vitesseImpression} ppm</span>
                              <span className="flex items-center gap-1"><ChevronRight size={12} /> {ligne.resolution}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end gap-2 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
                        <div className="text-left md:text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prix U.</p>
                          <p className="font-bold text-gray-900">{ligne.prixUnitaire?.toLocaleString()} DH</p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantité</p>
                          <p className="font-bold text-purple-600">x{ligne.quantite}</p>
                        </div>
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

export default MesSoumissionsPage;
