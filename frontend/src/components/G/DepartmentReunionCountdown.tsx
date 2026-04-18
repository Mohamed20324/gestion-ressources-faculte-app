import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const DepartmentReunionCountdown = () => {
  const { user } = useAuth();
  const [nextReunion, setNextReunion] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

  useEffect(() => {
    const fetchNextReunion = async () => {
      // Seulement pour Enseignant et Chef de Département
      if (!user || (user.role !== 'ENSEIGNANT' && user.role !== 'CHEF_DEPARTEMENT')) return;

      try {
        // 1. Récupérer l'utilisateur complet pour avoir son departementId
        // L'API est définie pour /api/utilisateurs/{id}
        const userRes = await fetch(`http://localhost:8081/api/utilisateurs/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!userRes.ok) return;
        const userData = await userRes.json();
        
        if (!userData.departementId) return;

        // 2. Récupérer les réunions du département
        const reunionsRes = await api.getReunionsByDepartement(userData.departementId);
        if (!reunionsRes.ok) return;
        const reunions = await reunionsRes.json();

        // 3. Trouver la réunion "PLANIFIEE" la plus proche
        const now = new Date();
        const upcomingReunions = reunions
          .filter((r: any) => r.statut === 'PLANIFIEE' && r.date && r.heure)
          .map((r: any) => ({
            ...r,
            // Format r.date (YYYY-MM-DD) et r.heure (HH:mm ou HH:mm:ss)
            dateTime: new Date(`${r.date}T${r.heure.length === 5 ? r.heure + ':00' : r.heure}`)
          }))
          .filter((r: any) => r.dateTime > now)
          .sort((a: any, b: any) => a.dateTime.getTime() - b.dateTime.getTime());

        if (upcomingReunions.length > 0) {
          setNextReunion(upcomingReunions[0]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la prochaine réunion", error);
      }
    };

    fetchNextReunion();
  }, [user]);

  useEffect(() => {
    if (!nextReunion) return;

    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const distance = nextReunion.dateTime.getTime() - now;

      if (distance < 0) {
        clearInterval(intervalId);
        setTimeLeft(null);
        setNextReunion(null); // La réunion est passée
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    // Initialiser immédiatement pour éviter un délai d'une seconde
    const now = new Date().getTime();
    const distance = nextReunion.dateTime.getTime() - now;
    if (distance > 0) {
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }

    return () => clearInterval(intervalId);
  }, [nextReunion]);

  if (!nextReunion || !timeLeft) return null;

  return (
    <div className="hidden lg:flex items-center gap-3 bg-indigo-50/80 border border-indigo-100/50 px-4 py-1.5 rounded-full mr-2 transition-all hover:bg-indigo-50">
      <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
        <Calendar size={14} className="text-indigo-500" />
        <span className="text-xs whitespace-nowrap">Réunion Dép. :</span>
      </div>
      <div className="flex items-center gap-1.5 text-indigo-800 font-bold font-mono text-sm bg-white px-2.5 py-0.5 rounded shadow-sm border border-indigo-50">
        <Clock size={13} className="text-indigo-400 animate-pulse" />
        <span>
          {timeLeft.days > 0 ? `${timeLeft.days}j ` : ''}
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

export default DepartmentReunionCountdown;
