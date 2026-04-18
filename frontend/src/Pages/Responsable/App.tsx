import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/Responsable/Sidebar';
import Header from '../../components/Responsable/Header';
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

const AppContent = () => {
  return (
    <div className='flex flex-col h-screen'>
      <Header />
      <div className="flex flex-1 bg-white text-sm text-gray-700 font-sans overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-auto pb-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/technicians" element={<TechniciansPage />} />
            <Route path="/department-heads" element={<DepartmentHeadPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/needs" element={<BesoinsGlobalPage />} />
            <Route path="/tenders" element={<AppelsOffresPage />} />
            
            {/* Routes Réunions */}
            <Route path="/meetings" element={<MeetingsPage />} />
            <Route path="/meetings/calendar" element={<MeetingCalendarPage />} />
            <Route path="/meetings/new" element={<MeetingsPage />} /> {/* Reuse for now */}
            <Route path="/meetings/archives" element={<MeetingsPage />} /> {/* Reuse for now */}
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