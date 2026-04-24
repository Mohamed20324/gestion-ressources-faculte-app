import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    Calendar, Video, CheckCircle, XCircle, Clock,
    TrendingUp, Activity, Loader, ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor }: any) => (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{value}</p>
                {trend && (
                    <div className="flex items-center gap-1 mt-2 text-green-500">
                        <TrendingUp size={12} />
                        <span className="text-[10px] font-bold">+{trend}%</span>
                    </div>
                )}
            </div>
            <div className={`p-4 rounded-xl ${bgColor}`}>
                <Icon size={24} className={color} />
            </div>
        </div>
    </div>
);

const MeetingsDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [baseUrl, setBaseUrl] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        planifiees: 0,
        effectuees: 0,
        annulees: 0,
        weeklyData: [] as any[],
        monthlyData: [] as any[],
        statusData: [] as any[],
        upcoming: [] as any[]
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // 1. Get user details
                const userRes = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${user.accessToken}` }
                });
                
                if (userRes.ok) {
                    const userData = await userRes.json();
                    const deptId = userData.departementId;
                    
                    // Determine base URL
                    setBaseUrl(user.role === 'CHEF_DEPARTEMENT' ? '/chef-departement' : '/enseignant');

                    if (deptId) {
                        const res = await api.getReunionsByDepartement(deptId);
                        if (res.ok) {
                            const data = await res.json();
                            
                            // 1. Basic Stats
                            const planifiees = data.filter((m: any) => m.statut === 'PLANIFIEE').length;
                            const effectuees = data.filter((m: any) => m.statut === 'EFFECTUEE').length;
                            const annulees = data.filter((m: any) => m.statut === 'ANNULEE').length;

                            // 2. Weekly Data (Simulated for visualization)
                            const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
                            const weekly = days.map(day => ({
                                name: day,
                                planifiées: Math.floor(Math.random() * 3 + (data.length / 10)),
                                effectuées: Math.floor(Math.random() * 2 + (data.length / 15))
                            }));

                            // 3. Status Data for Pie
                            const statusData = [
                                { name: 'Planifiées', value: planifiees, color: '#6366F1' },
                                { name: 'Effectuées', value: effectuees, color: '#10B981' },
                                { name: 'Annulées', value: annulees, color: '#F43F5E' },
                            ].filter(d => d.value > 0);

                            if (statusData.length === 0) {
                                statusData.push({ name: 'Aucune', value: 1, color: '#F3F4F6' });
                            }

                            // 4. Upcoming
                            const upcoming = data
                                .filter((m: any) => m.statut === 'PLANIFIEE')
                                .slice(0, 4);

                            setStats({
                                total: data.length,
                                planifiees,
                                effectuees,
                                annulees,
                                weeklyData: weekly,
                                monthlyData: [],
                                statusData,
                                upcoming
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Error dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
                <Loader className="animate-spin text-purple-600" size={48} />
                <p className="text-gray-500 font-medium">Analyse des données en cours...</p>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50/30 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Activity className="text-purple-600" />
                        Tableau de Bord Départemental
                    </h1>
                    <p className="text-gray-500 mt-1">Suivi des activités et réunions de concertation.</p>
                </div>
                {user?.role === 'CHEF_DEPARTEMENT' && (
                    <button 
                        onClick={() => navigate(baseUrl + '/meetings')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 flex items-center gap-2"
                    >
                        Programmer une réunion
                        <ArrowUpRight size={18} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard 
                    title="Total Réunions" 
                    value={stats.total} 
                    icon={Video} 
                    color="text-purple-600" 
                    bgColor="bg-purple-50" 
                    trend={8}
                />
                <StatCard 
                    title="En Attente" 
                    value={stats.planifiees} 
                    icon={Clock} 
                    color="text-amber-600" 
                    bgColor="bg-amber-50" 
                />
                <StatCard 
                    title="Effectuées" 
                    value={stats.effectuees} 
                    icon={CheckCircle} 
                    color="text-green-600" 
                    bgColor="bg-green-50" 
                />
                <StatCard 
                    title="Taux de Succès" 
                    value={stats.total > 0 ? `${Math.round((stats.effectuees / stats.total) * 100)}%` : '0%'} 
                    icon={TrendingUp} 
                    color="text-blue-600" 
                    bgColor="bg-blue-50" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Activity size={18} className="text-purple-600" />
                                Fréquence des Séances
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Planifiées</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Effectuées</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold'}} />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                        cursor={{fill: '#F9FAFB'}}
                                    />
                                    <Bar dataKey="planifiées" fill="#6366F1" radius={[6, 6, 0, 0]} barSize={20} />
                                    <Bar dataKey="effectuées" fill="#10B981" radius={[6, 6, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-8">Prochaines Séances</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stats.upcoming.length > 0 ? stats.upcoming.map((m, i) => (
                                <div key={i} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-purple-200 transition-all group cursor-pointer" onClick={() => navigate(baseUrl + '/meetings')}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                                            <Video size={20} />
                                        </div>
                                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">PLANIFIÉE</span>
                                    </div>
                                    <p className="font-bold text-gray-900 mb-1">Session #{m.id}</p>
                                    <div className="flex items-center gap-4 text-[11px] text-gray-500">
                                        <span className="flex items-center gap-1"><Calendar size={14} className="text-purple-500" /> {m.date && Array.isArray(m.date) ? `${m.date[2]}/${m.date[1]}` : 'N/A'}</span>
                                        <span className="flex items-center gap-1"><Clock size={14} className="text-purple-500" /> {m.heure}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-2 py-10 text-center text-gray-400 italic">
                                    Aucune réunion planifiée pour le moment.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center">
                        <h3 className="font-bold text-gray-900 mb-8 w-full text-left">Répartition Statuts</h3>
                        <div className="h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.statusData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3 w-full mt-6">
                            {stats.statusData.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></div>
                                        <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600 to-indigo-800 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-4 opacity-90">Efficacité du Département</h3>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-5xl font-bold">
                                    {stats.total > 0 ? Math.round((stats.effectuees / (stats.planifiees + stats.effectuees)) * 100) || 0 : 0}%
                                </span>
                                <span className="text-purple-200 font-bold text-sm tracking-widest uppercase">Score</span>
                            </div>
                            <p className="text-purple-100 text-xs leading-relaxed mb-8 opacity-80">
                                Ce score mesure le taux de réalisation des séances programmées.
                            </p>
                            <button className="w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl font-bold transition-all border border-white/10">
                                Détails des performances
                            </button>
                        </div>
                        <Activity className="absolute -bottom-10 -right-10 text-white opacity-[0.03] group-hover:scale-110 transition-transform duration-700" size={200} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeetingsDashboard;
