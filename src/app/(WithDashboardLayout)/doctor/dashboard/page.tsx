'use client';
import { useSession } from 'next-auth/react';
import { FaTachometerAlt } from 'react-icons/fa';
import LoadingPage from '@/app/loading';
import NotificationBell from '@/components/Modules/Notifications/NotificationBell';
import VitalsOverview from '@/components/Modules/Dashboard/Patient/Vitals/VitalsOverview';
import AssignedPatients from '@/components/Modules/Dashboard/Patient/AssignedPatient';
import { useNotifications } from '@/hooks/useNotification';

const DoctorDashboard = () => {
  const { data: session, status } = useSession();
  const { notifications, isLoading, clearNotifications, acknowledgeNotification } = useNotifications();
  if (status === 'loading' || isLoading) {
    return <LoadingPage />;
  }

  if (!session) {
    return <div className="p-6 text-red-500">Please log in to view the dashboard.</div>;
  }

  if (session?.user?.role !== 'doctor') {
    return <div className="p-6 text-red-500">Access Denied: You are not authorized to view this dashboard.</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto relative">
        <NotificationBell
          notifications={notifications}
          clearNotifications={clearNotifications}
          acknowledgeNotification={acknowledgeNotification}
        />
        <h1 className="text-2xl font-bold text-blue-600 flex items-center mb-6">
          <FaTachometerAlt className="mr-2" /> Doctor Dashboard
        </h1>
        <VitalsOverview />
        <AssignedPatients />
      </div>
    </div>
  );
};

export default DoctorDashboard;