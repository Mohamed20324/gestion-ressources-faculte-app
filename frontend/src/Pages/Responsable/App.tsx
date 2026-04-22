import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/Responsable/Sidebar';
import Header from '../../components/G/Header';
import DepartmentsPage from './Departement';
import TeachersPage from './TeachersPage';
import TechniciansPage from './TechniciansPage';
import DepartmentHeadPage from './DepartmentHeadPage';
import Dashboard from './Dashboard';
import ResourcesPage from './ResourcesPage';
import AppelsOffresPage from './AppelsOffresPage';
import MeetingsPage from './MeetingsPage';
import MeetingCalendarPage from './MeetingCalendarPage';
import BesoinsGlobalPage from './BesoinsGlobalPage';
import OffresGestionPage from './OffresGestionPage';
import ReceptionPage from './ReceptionPage';
import FournisseursPage from './FournisseursPage';
import BlacklistPage from './BlacklistPage';
import ProcurementDashboard from './ProcurementDashboard';
import InventoryDashboard from './InventoryDashboard';
import PartnersDashboard from './PartnersDashboard';
import ReportsPage from './ReportsPage';
import SoumissionsGestionPage from './SoumissionsGestionPage';
import MeetingsDashboard from './MeetingsDashboard';
import ProfilePage from '../Common/ProfilePage';

const AppContent = () => {
  return (
    <div className='flex flex-col h-screen'>
      <Header title="Espace Responsable" />
      <div className="flex flex-1 bg-white text-sm text-gray-700 font-sans overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto pb-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/technicians" element={<TechniciansPage />} />
            <Route path="/department-heads" element={<DepartmentHeadPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/needs" element={<BesoinsGlobalPage />} />
            <Route path="/appels-offres" element={<AppelsOffresPage />} />
            <Route path="/appels-offres/:id/offres" element={<OffresGestionPage />} />
            <Route path="/reception" element={<ReceptionPage />} />
            <Route path="/suppliers" element={<FournisseursPage />} />
            <Route path="/submissions" element={<SoumissionsGestionPage />} />
            <Route path="/blacklist" element={<BlacklistPage />} />
            <Route path="/procurement/dashboard" element={<ProcurementDashboard />} />
            <Route path="/inventory/dashboard" element={<InventoryDashboard />} />
            <Route path="/partners/dashboard" element={<PartnersDashboard />} />
            <Route path="/reports" element={<ReportsPage />} />
            
            {/* Routes Réunions */}
            <Route path="/meetings" element={<MeetingsPage />} />
            <Route path="/meetings/dashboard" element={<MeetingsDashboard />} />
            <Route path="/meetings/calendar" element={<MeetingCalendarPage />} />
            <Route path="/meetings/new" element={<MeetingsPage />} /> {/* Reuse for now */}
            <Route path="/meetings/archives" element={<MeetingsPage />} /> {/* Reuse for now */}
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const ResponsableApp = () => {
  return <AppContent />;
};

export default ResponsableApp;