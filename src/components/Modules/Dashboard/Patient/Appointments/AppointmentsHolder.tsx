// src/components/Modules/Dashboard/Patient/Appointments/AppointmentsHolder.tsx
import AppointmentsTable from "./AppointmentsTable";
import { getAppointmentsByUserId } from "@/service/Appointments";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";

interface AppointmentsHolderProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

const AppointmentsHolder = async ({ searchParams }: AppointmentsHolderProps) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.accessToken) {
        return <h1 className="text-center text-2xl font-semibold text-gray-700">Log in to continue</h1>;
    }

    const page = Number(searchParams.page) || 1;
    const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
    const type = typeof searchParams.type === 'string' ? searchParams.type : undefined;
    const startDate = typeof searchParams.startDate === 'string' ? searchParams.startDate : undefined;
    const endDate = typeof searchParams.endDate === 'string' ? searchParams.endDate : undefined;

    const { appointments, meta } = await getAppointmentsByUserId({
        userId: session.user.id,
        token: session.user.accessToken,
        page,
        limit: 10,
        status,
        type,
        startDate,
        endDate,
    });

    return (
        <div className="container mx-auto p-4">
            <AppointmentsTable
                appointments={appointments}
                meta={meta}
                token={session.user.accessToken}
                userId={session.user.id}
            />
        </div>
    );
};

export default AppointmentsHolder;