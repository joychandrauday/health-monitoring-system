import PatientDashHolder from '@/components/Modules/Dashboard/Patient/PatientDashHolder';
import { getSingleProfile } from '@/service/Profile';
import { User } from '@/types';
import { authOptions } from '@/utils/authOptions';
import { getServerSession } from 'next-auth';

export default async function UserDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="p-4 text-center">
        <p>Failed to load user profile</p>
      </div>
    );
  }
  let user: User | null = null;

  try {
    const response = await getSingleProfile(session); // this should be server-safe
    user = response;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return (
      <div className="p-4 text-center">
        <p>Failed to load user profile</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p>User data not available</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
      <PatientDashHolder user={user} />
    </div>
  );
}
