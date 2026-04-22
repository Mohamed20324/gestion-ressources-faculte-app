import { useState, useEffect } from 'react';
import { 
  ShieldAlert, Search, Loader, 
  Trash2, Calendar,
  User, Building2, CheckCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { NotificationContainer } from '../../components/Notification';
import { useNotifications } from '../../hooks/useNotifications';

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
    if (!window.confirm("Voulez-vous vraiment réhabiliter ce fournisseur ?")) return;
    try {
      // API call to remove from blacklist
      showNotification('success', 'Fournisseur réhabilité');
      fetchBlacklist();
    } catch (error) {
      showNotification('error', 'Erreur technique');
    }
  };

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-600 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-red-100">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Liste Noire</h1>
              <p className="text-gray-500 font-medium">Fournisseurs exclus des appels d'offres</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher un fournisseur exclu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[1.5rem] shadow-xl shadow-gray-100/50 outline-none focus:ring-4 focus:ring-red-50 transition-all font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader className="animate-spin text-red-600 mb-4" size={48} />
            <p className="text-gray-500 font-bold">Analyse de la liste noire...</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-red-100 overflow-hidden">
            {blacklist.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-red-50/30 border-b border-red-100">
                      <th className="px-8 py-6 text-xs font-black text-red-600 uppercase tracking-widest">Fournisseur</th>
                      <th className="px-8 py-6 text-xs font-black text-red-600 uppercase tracking-widest">Motif d'exclusion</th>
                      <th className="px-8 py-6 text-xs font-black text-red-600 uppercase tracking-widest">Date & Auteur</th>
                      <th className="px-8 py-6 text-xs font-black text-red-600 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-50">
                    {blacklist.filter(entry => 
                      entry.nomSociete.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (entry.motif && entry.motif.toLowerCase().includes(searchTerm.toLowerCase()))
                    ).map((entry) => (
                      <tr key={entry.id} className="hover:bg-red-50/10 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                              <Building2 size={24} />
                            </div>
                            <div>
                              <h3 className="font-black text-gray-900">{entry.nomSociete}</h3>
                              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Suspendu</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="max-w-md">
                            <p className="text-gray-600 font-medium italic line-clamp-2 leading-relaxed">
                              "{entry.motif || 'Aucun motif spécifié'}"
                            </p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                              <Calendar size={14} className="text-red-400" />
                              {entry.dateAjout ? (Array.isArray(entry.dateAjout) ? `${entry.dateAjout[2]}/${entry.dateAjout[1]}/${entry.dateAjout[0]}` : entry.dateAjout) : 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                              <User size={12} />
                              {entry.adminNom || 'Responsable'}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => handleRemove(entry.id)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-xs hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200 active:scale-95"
                          >
                            <Trash2 size={16} />
                            Réhabiliter
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-32 text-center">
                <CheckCircle className="mx-auto text-green-200 mb-4" size={64} />
                <p className="text-gray-500 font-bold text-xl">Bonne nouvelle ! Aucun fournisseur n'est sur la liste noire.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlacklistPage;
