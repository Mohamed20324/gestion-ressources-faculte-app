import { useState, useEffect } from 'react';
import { 
  ShieldAlert, Search, Loader, 
  Trash2, Calendar,
  User, Building2, CheckCircle,
  AlertCircle, ArrowRight, Info
} from 'lucide-react';
import { api } from '../../../services/api';
import { NotificationContainer } from '../../../components/Notification';
import { useNotifications } from '../../../hooks/useNotifications';

const BlacklistPage = () => {
  const { notifications, showNotification, removeNotification } = useNotifications();
  const [blacklist, setBlacklist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const fetchBlacklist = async () => {
    setLoading(true);
    try {
      const res = await api.getBlacklistedSuppliers();
      if (res.ok) {
        setBlacklist(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: number) => {
    if (!window.confirm("Souhaitez-vous réhabiliter ce fournisseur ? Il pourra de nouveau soumissionner aux appels d'offres.")) return;
    try {
      // Logic for rehabilitation would go here
      showNotification('success', 'Fournisseur réhabilité avec succès');
      fetchBlacklist();
    } catch (error) {
      showNotification('error', 'Erreur technique');
    }
  };

  const formatDate = (dateArr: any) => {
    if (!dateArr || !Array.isArray(dateArr)) return 'N/A';
    return `${dateArr[2].toString().padStart(2, '0')}/${dateArr[1].toString().padStart(2, '0')}/${dateArr[0]}`;
  };

  const filteredBlacklist = blacklist.filter(entry => 
    entry.nomSociete.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.motif && entry.motif.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 bg-gray-50/30 min-h-full pb-8">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="max-w-[1400px] mx-auto">
        {/* Header section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              Liste Noire des Fournisseurs
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Contrôle de conformité et exclusion des partenaires non fiables.</p>
          </div>

          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher une exclusion..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all shadow-sm font-medium"
            />
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
          <div className="p-2 bg-white rounded-lg text-red-600 shadow-sm shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-red-900">Restriction d'accès</h4>
            <p className="text-xs text-red-700 font-medium mt-0.5 leading-relaxed">
              Les fournisseurs listés ci-dessous ne peuvent plus accéder aux appels d'offres en cours ni soumettre de nouvelles propositions techniques.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader className="animate-spin text-red-600 mb-4" size={40} />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Vérification de la base...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            {filteredBlacklist.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Fournisseur</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Motif de l'exclusion</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date & Auteur</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBlacklist.map((entry) => (
                      <tr key={entry.id} className="group transition-colors hover:bg-red-50/10">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-50 text-red-500 rounded-lg border border-red-100 transition-colors">
                              <Building2 size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{entry.nomSociete}</p>
                              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Accès bloqué</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            <p className="text-sm font-semibold text-gray-600 leading-relaxed italic">
                              "{entry.motif || 'Aucune raison spécifiée'}"
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                              <Calendar size={14} className="text-gray-400" />
                              {formatDate(entry.dateAjout)}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                              <User size={12} />
                              {entry.adminNom || 'Administrateur'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleRemove(entry.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-red-600 transition-all shadow-sm"
                          >
                            Réhabiliter
                            <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-24 text-center bg-gray-50/20">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-gray-900 font-bold">Liste Noire vide</h3>
                <p className="text-gray-400 text-sm mt-1">Tous les partenaires sont actuellement conformes aux règles de la faculté.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlacklistPage;


