import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/Responsable/Sidebar';
import Header from '../../components/G/Header';

// General
import Dashboard from './General/Dashboard';
import ReportsPage from './General/ReportsPage';

// Users
import DepartmentsPage from './Users/DepartmentsPage';
import TeachersPage from './Users/TeachersPage';
import TechniciansPage from './Users/TechniciansPage';
import DepartmentHeadPage from './Users/DepartmentHeadsPage';

// Inventory
import InventoryDashboard from './Inventory/InventoryDashboard';
import ResourcesPage from './Inventory/ResourcesPage';
import ReceptionPage from './Inventory/ReceptionPage';
import MaintenancePage from './Inventory/MaintenancePage';

// Procurement
import ProcurementDashboard from './Procurement/ProcurementDashboard';
import NeedsPage from './Procurement/NeedsPage';
import AppelsOffresPage from './Procurement/AppelsOffresPage';
import OffresPage from './Procurement/OffresPage';


// Partners
import PartnersDashboard from './Partners/PartnersDashboard';
import SuppliersPage from './Partners/SuppliersPage';
import BlacklistPage from './Partners/BlacklistPage';

// Meetings

import CalendarPage from '../ChefDepartement/Meetings/CalendarPage';

// Common
import ProfilePage from '../Common/ProfilePage';
import NotificationsPage from '../Common/NotificationsPage';

const AppContent = () => {
  return (
    <div className='flex flex-col h-screen'>
      <Header title="Espace Responsable" />
      <div className="flex flex-1 bg-white text-sm text-gray-700 font-sans overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto pb-20">
          <Routes>
            {/* General */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reports" element={<ReportsPage />} />

            {/* Users */}
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/technicians" element={<TechniciansPage />} />
            <Route path="/department-heads" element={<DepartmentHeadPage />} />

            {/* Inventory */}
            <Route path="/inventory/dashboard" element={<InventoryDashboard />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/reception" element={<ReceptionPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />

            {/* Procurement */}
            <Route path="/procurement/dashboard" element={<ProcurementDashboard />} />
            <Route path="/needs" element={<NeedsPage />} />
            <Route path="/appels-offres" element={<AppelsOffresPage />} />
            <Route path="/appels-offres/:id/offres" element={<OffresPage />} />


            {/* Partners */}
            <Route path="/partners/dashboard" element={<PartnersDashboard />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/blacklist" element={<BlacklistPage />} />

            {/* Meetings */}

            <Route path="/meetings/calendar" element={<CalendarPage />} />

            {/* Profile & Notifications */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
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