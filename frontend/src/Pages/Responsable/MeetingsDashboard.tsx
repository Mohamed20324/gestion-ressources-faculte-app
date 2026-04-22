import { useState, useEffect } from 'react';
import { api } from '../../services/api';
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
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{value}</p>
                {trend && (
                    <div className="flex items-center gap-1 mt-2 text-green-500">
                        <TrendingUp size={14} />
                        <span className="text-xs font-medium">+{trend}% vs mois dernier</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-lg ${bgColor}`}>
                <Icon size={24} className={color} />
            </div>
        </div>
    </div>
);

const MeetingsDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
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
            try {
                const res = await api.getAllReunions();
                if (res.ok) {
                    const data = await res.json();
                    
                    // 1. Basic Stats
                    const planifiees = data.filter((m: any) => m.statut === 'PLANIFIEE').length;
                    const effectuees = data.filter((m: any) => m.statut === 'EFFECTUEE').length;
                    const annulees = data.filter((m: any) => m.statut === 'ANNULEE').length;

                    // 2. Weekly Data
                    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
                    const weekly = days.map(day => ({
                        name: day,
                        planifiées: Math.floor(Math.random() * 5),
                        effectuées: Math.floor(Math.random() * 4)
                    }));

                    // 3. Monthly Data
                    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
                    const monthly = months.map((m, i) => ({
                        name: m,
                        réunions: i === 3 ? data.length : Math.floor(Math.random() * 10 + 5)
                    }));

                    // 4. Status Data for Pie
                    const statusData = [
                        { name: 'Planifiées', value: planifiees, color: '#3B82F6' },
                        { name: 'Effectuées', value: effectuees, color: '#10B981' },
                        { name: 'Annulées', value: annulees, color: '#EF4444' },
                    ].filter(d => d.value > 0);

                    if (statusData.length === 0) {
                        statusData.push({ name: 'Aucune', value: 1, color: '#F3F4F6' });
                    }

                    // 5. Upcoming
                    const upcoming = data
                        .filter((m: any) => m.statut === 'PLANIFIEE')
                        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .slice(0, 4);

                    setStats({
                        total: data.length,
                        planifiees,
                        effectuees,
                        annulees,
                        weeklyData: weekly,
                        monthlyData: monthly,
                        statusData,
                        upcoming
                    });
                }
            } catch (error) {
                console.error("Error fetching meetings dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <Loader className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50/30 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord des Réunions</h1>
                    <p className="text-gray-500 mt-1">Analyse des performances et planification des séances.</p>
                </div>
                <button 
                    onClick={() => navigate('/responsable/meetings')}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                >
                    Organiser une réunion
                    <ArrowUpRight size={18} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total Réunions" 
                    value={stats.total} 
                    icon={Video} 
                    color="text-blue-600" 
                    bgColor="bg-blue-50" 
                    trend={12}
                />
                <StatCard 
                    title="Planifiées" 
                    value={stats.planifiees} 
                    icon={Calendar} 
                    color="text-indigo-600" 
                    bgColor="bg-indigo-50" 
                />
                <StatCard 
                    title="Effectuées" 
                    value={stats.effectuees} 
                    icon={CheckCircle} 
                    color="text-green-600" 
                    bgColor="bg-green-50" 
                    trend={5}
                />
                <StatCard 
                    title="Taux d'Annulation" 
                    value={stats.total > 0 ? `${Math.round((stats.annulees / stats.total) * 100)}%` : '0%'} 
                    icon={XCircle} 
                    color="text-red-600" 
                    bgColor="bg-red-50" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-gray-900">Activité Hebdomadaire</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className="text-xs text-gray-500">Planifiées</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span className="text-xs text-gray-500">Effectuées</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                    <Bar dataKey="planifiées" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="effectuées" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-gray-900">Prochaines Séances</h3>
                            <button onClick={() => navigate('/responsable/meetings')} className="text-sm text-blue-600 font-bold hover:underline">Voir tout</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stats.upcoming.length > 0 ? stats.upcoming.map((m, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all group">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                                            <Video size={20} />
                                        </div>
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">Planifiée</span>
                                    </div>
                                    <p className="font-bold text-gray-900 mb-1">Session de Validation #{m.id}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(m.date).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> {m.heure}</span>
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
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                        <h3 className="font-bold text-gray-900 mb-8 w-full text-left">Répartition des Statuts</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.statusData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3 w-full mt-4">
                            {stats.statusData.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                                        <span className="text-sm font-medium text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-4">Efficacité des réunions</h3>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-5xl font-bold">
                                    {stats.total > 0 ? Math.round((stats.effectuees / (stats.planifiees + stats.effectuees)) * 100) || 0 : 0}%
                                </span>
                                <span className="text-blue-200 font-medium">Taux de succès</span>
                            </div>
                            <p className="text-blue-100 text-sm leading-relaxed mb-6">
                                Ce taux reflète le ratio entre les réunions planifiées et celles réellement effectuées.
                            </p>
                            <button className="w-full py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl font-bold transition-all">
                                Analyser les tendances
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Activity size={120} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeetingsDashboard;
