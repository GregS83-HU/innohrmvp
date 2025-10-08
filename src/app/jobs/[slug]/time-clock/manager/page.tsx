'use client';

import ManagerTimeClockDashboard from '../../../../../../components/timeclock/ManagerTimeClockDashboard';
import { useSession } from '@supabase/auth-helpers-react';

export default function Page() {
  const session = useSession(); // just the session object

  if (session === undefined) {
    // session is still loading
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view this page.</p>
      </div>
    );
  }

  const managerId = session.user.id;
  console.log("manager_id:", managerId)
  const managerName = session.user.user_metadata?.full_name || 'Manager';

  return <ManagerTimeClockDashboard managerId={managerId} managerName={managerName} />;
}
