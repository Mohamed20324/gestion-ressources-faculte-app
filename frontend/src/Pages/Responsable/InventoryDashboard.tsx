import { useState, useEffect } from 'react';
import { 
  Package, Truck, Wrench, 
  Monitor, Printer, Activity,
  AlertTriangle, CheckCircle, Search
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { api } from '../../services/api';

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
        recentReceptions: 8 // Simulated
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

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Tableau de Bord Inventaire</h1>
        <p className="text-gray-500 font-medium">Gestion du parc informatique et des réceptions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
            <Package size={24} />
          </div>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Ressources Totales</p>
          <h2 className="text-3xl font-black text-gray-900 mt-1">{stats.totalResources}</h2>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-4">
            <CheckCircle size={24} />
          </div>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Disponibles</p>
          <h2 className="text-3xl font-black text-gray-900 mt-1">{stats.operational}</h2>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-4">
            <AlertTriangle size={24} />
          </div>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Hors Service</p>
          <h2 className="text-3xl font-black text-gray-900 mt-1">{stats.broken}</h2>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
            <Truck size={24} />
          </div>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Dernière Réception</p>
          <h2 className="text-3xl font-black text-gray-900 mt-1">Hier</h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col items-center">
          <h3 className="text-xl font-black text-gray-900 mb-8 w-full text-left">Santé du Parc</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3 w-full mt-6">
            {statusData.map(item => (
              <div key={item.name} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-sm font-bold text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-black text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
          <h3 className="text-xl font-black text-gray-900 mb-8">Répartition par Type</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-sm">
                <Monitor size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900">Ordinateurs</p>
                <p className="text-gray-500 font-bold">142 unités</p>
              </div>
            </div>
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                <Printer size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900">Imprimantes</p>
                <p className="text-gray-500 font-bold">38 unités</p>
              </div>
            </div>
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
                <Wrench size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900">En Maintenance</p>
                <p className="text-gray-500 font-bold">{stats.underMaintenance} unités</p>
              </div>
            </div>
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900">Taux Fiabilité</p>
                <p className="text-gray-500 font-bold">94.2%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
