import { useState, useEffect } from 'react';
import { 
  Package, Truck, Wrench, 
  Monitor, Printer, Activity,
  AlertTriangle, CheckCircle, Search,
  Loader, MoreVertical, ChevronRight, Filter
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from 'recharts';
import { api } from '../../services/api';

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {trend && (
                    <div className="flex items-center gap-1 mt-2 text-red-500">
                        <AlertTriangle size={14} />
                        <span className="text-xs font-medium">{trend} alertes</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-lg ${bgColor}`}>
                <Icon size={24} className={color} />
            </div>
        </div>
    </div>
);

const InventoryDashboard = () => {
  const [stats, setStats] = useState({
    totalResources: 0,
    operational: 0,
    broken: 0,
    underMaintenance: 0,
    recentReceptions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.getAllRessources();
      const resources = await res.json();
      
      setStats({
        totalResources: resources.length,
        operational: resources.filter((r: any) => r.statut === 'FONCTIONNELLE').length,
        broken: resources.filter((r: any) => r.statut === 'EN_PANNE').length,
        underMaintenance: resources.filter((r: any) => r.statut === 'EN_MAINTENANCE').length,
        recentReceptions: 8 
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statusData = [
    { name: 'Opérationnel', value: stats.operational, color: '#10B981' },
    { name: 'En Panne', value: stats.broken, color: '#EF4444' },
    { name: 'Maintenance', value: stats.underMaintenance, color: '#3B82F6' }
  ];

  if (loading) {
      return (
          <div className="flex items-center justify-center h-screen">
              <Loader className="animate-spin text-blue-600" size={48} />
          </div>
      );
  }

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Inventaire</h1>
              <p className="text-gray-500 mt-1">Gestion du parc informatique, maintenance et réceptions.</p>
          </div>
          <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input placeholder="Rechercher une ressource..." className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <button className="p-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50">
                  <Filter size={20} className="text-gray-500" />
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
            title="Ressources Totales" 
            value={stats.totalResources} 
            icon={Package} 
            color="text-blue-600" 
            bgColor="bg-blue-50" 
        />
        <StatCard 
            title="Fonctionnelles" 
            value={stats.operational} 
            icon={CheckCircle} 
            color="text-green-600" 
            bgColor="bg-green-50" 
        />
        <StatCard 
            title="Hors Service" 
            value={stats.broken} 
            icon={AlertTriangle} 
            trend={stats.broken > 0 ? stats.broken : null}
            color="text-red-600" 
            bgColor="bg-red-50" 
        />
        <StatCard 
            title="Dernière Réception" 
            value="Hier" 
            icon={Truck} 
            color="text-orange-600" 
            bgColor="bg-orange-50" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
          <h3 className="font-bold text-gray-900 mb-8 w-full text-left">Santé Globale du Parc</h3>
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
          <div className="space-y-3 w-full mt-4">
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

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-gray-900">Répartition par Type de Matériel</h3>
              <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                  <Monitor size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Ordinateurs</p>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">142 unités</p>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
                  <Printer size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Imprimantes</p>
                  <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">38 unités</p>
                </div>
              </div>
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm">
                  <Wrench size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">En Maintenance</p>
                  <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">{stats.underMaintenance} unités</p>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Taux Fiabilité</p>
                  <p className="text-xs text-green-600 font-bold uppercase tracking-wider">94.2%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Réceptions Récentes</h3>
                <button className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1">
                    Voir les bons <ChevronRight size={16} />
                </button>
            </div>
            <div className="divide-y divide-gray-50">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center">
                      <Truck size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Bon de livraison #{4500-i}</p>
                      <p className="text-xs text-gray-500">Fournisseur: ElectroPlus • 12/04/2024</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Réceptionné</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
