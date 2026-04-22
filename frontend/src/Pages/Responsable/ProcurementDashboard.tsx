import { useState, useEffect } from 'react';
import { 
  FileText, ClipboardList, TrendingUp, 
  CheckCircle, Clock, AlertCircle, 
  Package, DollarSign, Activity
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { api } from '../../services/api';

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
        besoinsValides: besoins.filter((b: any) => b.statut === 'VALIDE').length,
        besoinsEnAttente: besoins.filter((b: any) => b.statut === 'EN_ATTENTE').length,
        totalAppelsOffres: aos.length,
        offresRecues: 24 // Simulated
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
    { name: 'Rejetés', value: stats.totalBesoins - stats.besoinsValides - stats.besoinsEnAttente, color: '#EF4444' }
  ];

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Tableau de Bord Procurement</h1>
        <p className="text-gray-500 font-medium">Suivi des besoins et des appels d'offres</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-4">
            <ClipboardList size={24} />
          </div>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Besoins Totaux</p>
          <h2 className="text-3xl font-black text-gray-900 mt-1">{stats.totalBesoins}</h2>
          <div className="flex items-center gap-1 text-green-500 text-xs font-bold mt-2">
            <TrendingUp size={14} /> +5% ce mois
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
            <FileText size={24} />
          </div>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Appels d'Offres</p>
          <h2 className="text-3xl font-black text-gray-900 mt-1">{stats.totalAppelsOffres}</h2>
          <div className="flex items-center gap-1 text-blue-500 text-xs font-bold mt-2">
            <Activity size={14} /> 3 en cours
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-4">
            <DollarSign size={24} />
          </div>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Offres Reçues</p>
          <h2 className="text-3xl font-black text-gray-900 mt-1">{stats.offresRecues}</h2>
          <div className="flex items-center gap-1 text-green-500 text-xs font-bold mt-2">
            <CheckCircle size={14} /> 12 à analyser
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
            <Clock size={24} />
          </div>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Temps Moyen AO</p>
          <h2 className="text-3xl font-black text-gray-900 mt-1">14j</h2>
          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-2">
            <AlertCircle size={14} /> Optimisation possible
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
          <h3 className="text-xl font-black text-gray-900 mb-8">Évolution des Besoins</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Informatique', val: 45 },
              { name: 'Mobilier', val: 12 },
              { name: 'Laboratoire', val: 28 },
              { name: 'Bureautique', val: 15 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontWeight: 'bold', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontWeight: 'bold', fontSize: 12}} />
              <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="val" fill="#8B5CF6" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col items-center">
          <h3 className="text-xl font-black text-gray-900 mb-8 w-full text-left">Statut des Demandes</h3>
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
      </div>
    </div>
  );
};

export default ProcurementDashboard;
