import { useState, useEffect } from 'react';
import { 
  Package, FileText, CheckCircle, 
  XCircle, Clock, ArrowRight,
  TrendingUp, BarChart3, Bell
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeAO: 0,
    totalSoumissions: 0,
    acceptees: 0,
    rejetees: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [aoRes, offresRes] = await Promise.all([
        api.getAllAppelsOffresOuverts(),
        api.getMyOffres(user?.id)
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
      }
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl transition-all group overflow-hidden relative">
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-[0.03] group-hover:scale-110 transition-transform ${color}`} />
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-4xl font-black text-gray-900">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-green-500">
              <TrendingUp size={12} />
              <span>+{trend}% ce mois</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${color}`}>
          <Icon size={28} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Bonjour, {user?.nom} !</h1>
            <p className="text-gray-500 font-medium italic">Gérez vos propositions et suivez les opportunités du marché.</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-gray-600 uppercase">Système Opérationnel</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            title="Appels d'Offres Actifs" 
            value={stats.activeAO} 
            icon={BarChart3} 
            color="bg-purple-50 text-purple-600 border-purple-100"
          />
          <StatCard 
            title="Total Soumissions" 
            value={stats.totalSoumissions} 
            icon={FileText} 
            color="bg-blue-50 text-blue-600 border-blue-100"
          />
          <StatCard 
            title="Offres Acceptées" 
            value={stats.acceptees} 
            icon={CheckCircle} 
            color="bg-green-50 text-green-600 border-green-100"
          />
          <StatCard 
            title="Offres Rejetées" 
            value={stats.rejetees} 
            icon={XCircle} 
            color="bg-red-50 text-red-600 border-red-100"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 -mr-20 -mt-20 rounded-full blur-3xl" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 bg-purple-100 rounded-[2.5rem] flex items-center justify-center text-purple-600 shrink-0 shadow-inner">
                  <Package size={64} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-black text-gray-900 mb-2">Nouvelles Opportunités</h2>
                  <p className="text-gray-500 font-medium mb-6">Il y a actuellement {stats.activeAO} appels d'offres ouverts qui pourraient vous intéresser.</p>
                  <button 
                    onClick={() => navigate('/fournisseur/appels-offres')}
                    className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-black text-lg hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 flex items-center justify-center md:inline-flex gap-3"
                  >
                    Consulter les AO
                    <ArrowRight size={22} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 -mr-32 -mb-32 rounded-full blur-3xl" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 bg-white/10 rounded-[2.5rem] flex items-center justify-center text-white shrink-0 backdrop-blur-md">
                  <BarChart3 size={64} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-black mb-2">Mes Soumissions</h2>
                  <p className="text-gray-400 font-medium mb-6">Suivez en temps réel l'avancement de vos {stats.totalSoumissions} dossiers déposés.</p>
                  <button 
                    onClick={() => navigate('/fournisseur/mes-soumissions')}
                    className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-black text-lg hover:bg-gray-100 transition-all shadow-xl flex items-center justify-center md:inline-flex gap-3"
                  >
                    Voir mes dossiers
                    <ArrowRight size={22} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Side Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl">
              <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Bell className="text-purple-600" size={24} />
                Derniers Résultats
              </h4>
              <div className="space-y-4">
                {stats.acceptees > 0 ? (
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Offre Acceptée</p>
                      <p className="text-[10px] text-green-700 font-medium">Félicitations pour votre marché.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4 grayscale opacity-50">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                      <CheckCircle size={20} />
                    </div>
                    <p className="text-xs font-bold text-gray-400">En attente de résultats...</p>
                  </div>
                )}

                <div className="p-6 bg-purple-50 rounded-[2rem] border border-purple-100 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-purple-600 mx-auto mb-4 shadow-sm">
                    <TrendingUp size={32} />
                  </div>
                  <h5 className="font-black text-gray-900 mb-1">Boostez vos chances</h5>
                  <p className="text-[10px] text-purple-600 font-bold leading-relaxed">
                    Proposez des prix compétitifs et des délais de livraison courts pour gagner plus d'appels d'offres.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

