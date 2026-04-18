import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    Users, Calendar, Loader, Video, TrendingUp, TrendingDown,
    Activity, Clock, ChevronRight
} from 'lucide-react';

// Composant Carte statistique
const StatCard = ({ title, value, icon: Icon, color, bgColor, trend }: any) => (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{value}</p>
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        {trend > 0 ? (
                            <TrendingUp size={14} className="text-green-500" />
                        ) : (
                            <TrendingDown size={14} className="text-red-500" />
                        )}
                        <span className={`text-[10px] font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {Math.abs(trend)}% vs mois dernier
                        </span>
                    </div>
                )}
            </div>
            <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center ${color} shadow-inner`}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        teacherCount: 0,
        meetingCount: 0,
        nextMeeting: null as any,
        meetingsPerMonth: [] as any[]
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                // 1. Obtenir les détails du Chef (pour son departementId)
                const userRes = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!userRes.ok) return;
                const userData = await userRes.json();
                const deptId = userData.departementId;

                if (!deptId) {
                    setLoading(false);
                    return;
                }

                // 2. Récupérer enseignants et réunions en parallèle
                const [teachersRes, meetingsRes] = await Promise.all([
                    api.getUsersByRole('ENSEIGNANT'),
                    api.getReunionsByDepartement(deptId)
                ]);

                let teacherCount = 0;
                let meetings: any[] = [];

                if (teachersRes.ok) {
                    const allTeachers = await teachersRes.json();
                    teacherCount = allTeachers.filter((t: any) => t.departementId === deptId).length;
                }

                if (meetingsRes.ok) {
                    meetings = await meetingsRes.json();
                }

                // 3. Traitement des données pour le graphique
                const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
                const grouped: any = {};

                meetings.forEach((m: any) => {
                    let date: Date;
                    if (Array.isArray(m.date)) {
                        date = new Date(m.date[0], m.date[1] - 1, m.date[2]);
                    } else {
                        date = new Date(m.date);
                    }
                    const month = months[date.getMonth()];
                    grouped[month] = (grouped[month] || 0) + 1;
                });

                const meetingsPerMonth = months.map(m => ({
                    name: m,
                    réunions: grouped[m] || 0
                }));

                // 4. Prochaine réunion
                const now = new Date();
                const next = meetings
                    .filter((m: any) => m.statut === 'PLANIFIEE')
                    .map((m: any) => ({
                        ...m,
                        dateTime: Array.isArray(m.date)
                            ? new Date(m.date[0], m.date[1] - 1, m.date[2])
                            : new Date(m.date)
                    }))
                    .filter((m: any) => m.dateTime >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
                    .sort((a: any, b: any) => a.dateTime.getTime() - b.dateTime.getTime())[0];

                setStats({
                    teacherCount,
                    meetingCount: meetings.length,
                    nextMeeting: next,
                    meetingsPerMonth
                });

            } catch (error) {
                console.error("Erreur chargement dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={40} />
                    <p className="text-gray-500 font-medium">Analyse des données de votre département...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50/30 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Départemental</h1>
                    <p className="text-gray-500 mt-1">Aperçu des effectifs et de l'activité de votre département.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                        <Activity size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Statut</p>
                        <p className="text-xs font-bold text-gray-900">Département Actif</p>
                    </div>
                </div>
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Enseignants"
                    value={stats.teacherCount}
                    icon={Users}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                    trend={5}
                />
                <StatCard
                    title="Total Réunions"
                    value={stats.meetingCount}
                    icon={Video}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                    trend={12}
                />
                <StatCard
                    title="Besoins Validés"
                    value="85%"
                    icon={Activity}
                    color="text-green-600"
                    bgColor="bg-green-50"
                    trend={2}
                />
                <StatCard
                    title="Heures Réunion"
                    value="24h"
                    icon={Clock}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                    trend={-3}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Activité des Réunions</h3>
                            <p className="text-sm text-gray-500">Nombre de sessions de validation par mois</p>
                        </div>
                        <select className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500 transition-all">
                            <option>Année 2026</option>
                            <option>Année 2025</option>
                        </select>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.meetingsPerMonth}>
                                <defs>
                                    <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                        padding: '12px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="réunions"
                                    stroke="#8B5CF6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorMeetings)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-8">
                    {/* Next Meeting Card */}
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Calendar size={120} />
                        </div>
                        <h3 className="text-xl font-bold mb-6 relative z-10">Prochaine Réunion</h3>
                        {stats.nextMeeting ? (
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Date prévue</p>
                                        <p className="text-lg font-bold">
                                            {stats.nextMeeting.dateTime.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Heure</p>
                                        <p className="text-lg font-bold">{stats.nextMeeting.heure}</p>
                                    </div>
                                </div>
                                <button className="w-full py-4 bg-white text-purple-700 rounded-2xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                                    Détails de la réunion
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-10 relative z-10">
                                <Video className="mx-auto opacity-50 mb-4" size={48} />
                                <p className="font-medium text-white/80">Aucune réunion programmée</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
