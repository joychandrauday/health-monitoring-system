'use client';

import { useSession } from 'next-auth/react';
import { FaTachometerAlt } from 'react-icons/fa';
import LoadingPage from '@/app/loading';
import NotificationBell from '@/components/Modules/Notifications/NotificationBell';
import VitalsOverview from '@/components/Modules/Dashboard/Patient/Vitals/VitalsOverview';
import AssignedPatients from '@/components/Modules/Dashboard/Patient/AssignedPatient';
import NotificationList from '@/components/Modules/Notifications/NotificationList';
import { useNotifications } from '@/hooks/useNotification';
// import { getNotifications } from '@/service/notification/Notification';
// import { useEffect, useState } from 'react';
// import { IMedicalNotification } from '@/types';

const DoctorDashboard = () => {
  const { data: session, status } = useSession();
  const { notifications, isLoading, clearNotifications, acknowledgeNotification } = useNotifications();
  // const [notifications, setNotifications] = useState<IMedicalNotification[]>([]);
  // useEffect(() => {
  //   const fetchNotif = async () => {
  //     const notifications = await getNotifications({
  //       userId: session?.user?.id as string,
  //       token: session?.user?.accessToken as string
  //     })
  //     console.log(session?.user?.id);
  //     setNotifications(notifications)
  //   }
  //   fetchNotif()
  // }, [])
  console.log(notifications);
  if (status === 'loading' || isLoading) {
    return <LoadingPage />;
  }

  if (!session) {
    return <div className="p-6 text-red-500">Please log in to view the dashboard.</div>;
  }

  if (session?.user?.role !== 'doctor') {
    return <div className="p-6 text-red-500">Access Denied: You are not authorized to view this dashboard.</div>;
  }

  const unacknowledgedNotifications = notifications.filter((n) => !n.acknowledged);

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
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>
          {unacknowledgedNotifications.length === 0 ? (
            <p className="text-gray-500">No notifications received yet.</p>
          ) : (
            <NotificationList
              notifications={unacknowledgedNotifications}
              acknowledgeNotification={acknowledgeNotification}
            />
          )}
        </div>
        <VitalsOverview />
        <AssignedPatients />
      </div>
    </div>
  );
};

export default DoctorDashboard;