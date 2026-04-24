import { Routes, Route } from 'react-router-dom';
import Header from '../../components/G/Header';
import Sidebar from '../../components/G/Sidebar';
import Dashboard from './Dashboard';
import EnseignantsPage from './EnseignantsPage';
import MeetingsPage from './Meetings/MeetingsPage';
import MeetingsDashboard from './Meetings/MeetingsDashboard';
import CalendarPage from './Meetings/CalendarPage';
import BesoinsPage from './BesoinsPage';
import TypesRessourcesPage from './TypesRessourcesPage';
import ChefInventoryPage from './ChefInventoryPage';
import ProfilePage from '../Common/ProfilePage';
import NotificationsPage from '../Common/NotificationsPage';
import SignalementsPage from '../Enseignant/SignalementsPage';

const AppContent = () => {
  return (
    <div className='flex flex-col h-screen'>
      <Header title="Espace Chef de Département" />
      <div className="flex flex-1 bg-white text-sm text-gray-700 font-sans overflow-hidden">
        <Sidebar role="ChefDepartement" />
        <div className="flex-1 overflow-y-auto pb-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/enseignants" element={<EnseignantsPage />} />
            <Route path="/meetings" element={<MeetingsPage />} />
            <Route path="/meetings/dashboard" element={<MeetingsDashboard />} />
            <Route path="/meetings/calendar" element={<CalendarPage />} />
            <Route path="/besoins" element={<BesoinsPage />} />
            <Route path="/signalements" element={<SignalementsPage />} />
            <Route path="/inventory" element={<ChefInventoryPage />} />
            <Route path="/inventory/resources" element={<ChefInventoryPage />} />
            <Route path="/types-ressources" element={<TypesRessourcesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const ChefDepartementApp = () => {
  return <AppContent />;
};

export default ChefDepartementApp;
