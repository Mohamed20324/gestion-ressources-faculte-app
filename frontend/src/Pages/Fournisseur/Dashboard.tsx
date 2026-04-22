import { useState, useEffect } from 'react';
import { 
  Package, FileText, CheckCircle, 
  XCircle, Clock, ArrowRight,
  TrendingUp, BarChart3, ChevronRight, Activity
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeAO: 0,
    totalSoumissions: 0,
    acceptees: 0,
    rejetees: 0
  });
  const [recentSoumissions, setRecentSoumissions] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    fetchDashboardData();
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      const [aoRes, offresRes] = await Promise.all([
        api.getAllAppelsOffresOuverts(),
        api.getMyOffres(user!.id)
      ]);

      if (aoRes.ok && offresRes.ok) {
        const aos = await aoRes.json();
        const offres = await offresRes.json();
        
        setStats({
          activeAO: aos.length,
          totalSoumissions: offres.length,
          acceptees: offres.filter((o: any) => o.statut === 'ACCEPTEE').length,
          rejetees: offres.filter((o: any) => o.statut === 'REJETEE' || o.statut === 'ELIMINEE').length
        });

        // Get 4 most recent submissions
        const sorted = offres.sort((a: any, b: any) => {
          const dateA = Array.isArray(a.dateSoumission) 
            ? new Date(a.dateSoumission[0], a.dateSoumission[1] - 1, a.dateSoumission[2]).getTime()
            : new Date(a.dateSoumission).getTime();
          const dateB = Array.isArray(b.dateSoumission)
            ? new Date(b.dateSoumission[0], b.dateSoumission[1] - 1, b.dateSoumission[2]).getTime()
            : new Date(b.dateSoumission).getTime();
          return dateB - dateA;
        });
        setRecentSoumissions(sorted.slice(0, 4));
      }
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: any) => {
    if (!d) return '—';
    if (Array.isArray(d)) return `${String(d[2]).padStart(2,'0')}/${String(d[1]).padStart(2,'0')}/${d[0]}`;
    return new Date(d).toLocaleDateString('fr-FR');
  };

  const StatCard = ({ title, value, icon: Icon, color, bgIcon }: any) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between group">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</p>
        <h3 className="text-3xl font-black text-gray-900">{value}</h3>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgIcon} ${color} transition-transform group-hover:scale-110`}>
        <Icon size={24} />
      </div>
    </div>
  );

  const getStatusDisplay = (statut: string) => {
    switch (statut) {
      case 'ACCEPTEE': return { label: 'Acceptée', color: 'text-green-700 bg-green-50 border-green-200' };
      case 'REJETEE': 
      case 'ELIMINEE': return { label: 'Refusée', color: 'text-red-700 bg-red-50 border-red-200' };
      default: return { label: 'En attente', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    }
  };

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Espace Fournisseur</h1>
            <p className="text-sm text-gray-500">Bienvenue <span className="font-semibold text-gray-700">{user?.nom} {user?.prenom}</span>. Voici le résumé de vos activités.</p>
          </div>
          <button 
            onClick={() => navigate('/fournisseur/appels-offres')}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
          >
            <Package size={16} />
            Voir les appels d'offres
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard 
            title="Appels d'Offres Ouverts" 
            value={stats.activeAO} 
            icon={BarChart3} 
            color="text-purple-600"
            bgIcon="bg-purple-50"
          />
          <StatCard 
            title="Soumissions Totales" 
            value={stats.totalSoumissions} 
            icon={FileText} 
            color="text-blue-600"
            bgIcon="bg-blue-50"
          />
          <StatCard 
            title="Dossiers Acceptés" 
            value={stats.acceptees} 
            icon={CheckCircle} 
            color="text-green-600"
            bgIcon="bg-green-50"
          />
          <StatCard 
            title="Dossiers Refusés" 
            value={stats.rejetees} 
            icon={XCircle} 
            color="text-red-600"
            bgIcon="bg-red-50"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Submissions */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Activity size={18} className="text-purple-600" />
                Dernières soumissions
              </h2>
              <button 
                onClick={() => navigate('/fournisseur/mes-soumissions')}
                className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors flex items-center"
              >
                Tout voir <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex-1 p-2">
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : recentSoumissions.length > 0 ? (
                <div className="space-y-1">
                  {recentSoumissions.map((s, idx) => {
                    const status = getStatusDisplay(s.statut);
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 shrink-0 group-hover:border-purple-200 group-hover:text-purple-600 transition-colors">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                              AO : {s.appelOffreReference ?? `#${s.appelOffreId}`}
                            </p>
                            <p className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                              <span>Soumis le {formatDate(s.dateSoumission)}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              <span className="font-medium text-gray-700">{s.prixTotal?.toLocaleString()} MAD</span>
                            </p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-48 text-gray-400">
                  <FileText size={32} className="text-gray-200 mb-2" />
                  <p className="text-sm">Aucune soumission récente</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Tips */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">Augmentez vos chances</h3>
                <p className="text-sm text-purple-100 leading-relaxed mb-5">
                  Consultez régulièrement les nouveaux appels d'offres et proposez des garanties étendues pour vous démarquer.
                </p>
                <button 
                  onClick={() => navigate('/fournisseur/appels-offres')}
                  className="w-full py-2.5 bg-white text-purple-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Voir les opportunités
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                Raccourcis
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/fournisseur/mes-soumissions')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-all group"
                >
                  <span className="text-sm font-semibold">Suivre mes dossiers</span>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-purple-500 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
