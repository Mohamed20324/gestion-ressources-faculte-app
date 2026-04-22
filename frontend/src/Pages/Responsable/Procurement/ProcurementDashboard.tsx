import { useState, useEffect } from 'react';
import { 
  FileText, ClipboardList, TrendingUp, TrendingDown,
  CheckCircle, Clock, AlertCircle, 
  Package, DollarSign, Activity, MoreVertical,
  Loader, Filter, ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  Legend
} from 'recharts';
import { api } from '../../../services/api';

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        {trend > 0 ? (
                            <TrendingUp size={14} className="text-green-500" />
                        ) : (
                            <TrendingDown size={14} className="text-red-500" />
                        )}
                        <span className={`text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {Math.abs(trend)}% vs mois dernier
                        </span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-lg ${bgColor}`}>
                <Icon size={24} className={color} />
            </div>
        </div>
    </div>
);

const ProcurementDashboard = () => {
  const [stats, setStats] = useState({
    totalBesoins: 0,
    besoinsValides: 0,
    besoinsEnAttente: 0,
    totalAppelsOffres: 0,
    offresRecues: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [besoinsRes, aoRes] = await Promise.all([
        api.getAllBesoins(),
        api.getAllAppelsOffres()
      ]);
      
      const besoins = await besoinsRes.json();
      const aos = await aoRes.json();

      setStats({
        totalBesoins: besoins.length,
        besoinsValides: besoins.filter((b: any) => b.statut === 'VALIDE' || b.statut === 'ENVOYE').length,
        besoinsEnAttente: besoins.filter((b: any) => b.statut === 'EN_ATTENTE').length,
        totalAppelsOffres: aos.length,
        offresRecues: 24 
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statusData = [
    { name: 'Validés', value: stats.besoinsValides, color: '#10B981' },
    { name: 'En attente', value: stats.besoinsEnAttente, color: '#F59E0B' },
    { name: 'Rejetés', value: Math.max(0, stats.totalBesoins - stats.besoinsValides - stats.besoinsEnAttente), color: '#EF4444' }
  ];

  if (loading) {
      return (
          <div className="flex items-center justify-center h-screen">
              <Loader className="animate-spin text-purple-600" size={48} />
          </div>
      );
  }

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Achats</h1>
              <p className="text-gray-500 mt-1">Suivi des besoins consolidés et des appels d'offres.</p>
          </div>
          <div className="flex items-center gap-3">
              <button className="p-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <Filter size={20} className="text-gray-500" />
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
            title="Besoins Consolidés" 
            value={stats.totalBesoins} 
            icon={ClipboardList} 
            trend={8}
            color="text-purple-600" 
            bgColor="bg-purple-50" 
        />
        <StatCard 
            title="Appels d'Offres" 
            value={stats.totalAppelsOffres} 
            icon={FileText} 
            color="text-blue-600" 
            bgColor="bg-blue-50" 
        />
        <StatCard 
            title="Offres Reçues" 
            value={stats.offresRecues} 
            icon={DollarSign} 
            trend={12}
            color="text-green-600" 
            bgColor="bg-green-50" 
        />
        <StatCard 
            title="Délai Moyen" 
            value="14j" 
            icon={Clock} 
            color="text-orange-600" 
            bgColor="bg-orange-50" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-gray-900">Répartition des Besoins par Catégorie</h3>
              <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={18} />
              </button>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Informatique', val: 45 },
                { name: 'Mobilier', val: 12 },
                { name: 'Laboratoire', val: 28 },
                { name: 'Bureautique', val: 15 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="val" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
          <h3 className="font-bold text-gray-900 mb-8 w-full text-left">Statut des Demandes</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 w-full mt-4">
            {statusData.map(item => (
              <div key={item.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-sm font-medium text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Appels d'Offres Récents</h3>
            <button className="text-sm text-purple-600 font-bold hover:underline flex items-center gap-1">
                Tout voir <ChevronRight size={16} />
            </button>
        </div>
        <div className="divide-y divide-gray-50">
            {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <Activity size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">AO #{2024-i} - Matériel Informatique</p>
                            <p className="text-xs text-gray-500">Date d'ouverture: 12/04/2024 • 8 offres reçues</p>
                        </div>
                    </div>
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Ouvert</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProcurementDashboard;


