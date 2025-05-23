import { getAppointmentsByUserId } from "@/service/Appointments";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";
import AppointmentsTableDoc from "./AppointmentsTableDoc";

interface AppointmentsHolderProps {
    searchParams: { [key: string]: string | undefined }; // ✅ Fixed here
}

const AppointmentsHolderDoc = async ({ searchParams }: AppointmentsHolderProps) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.accessToken) {
        return <h1 className="text-center text-2xl font-semibold text-gray-700">Log in to continue</h1>;
    }

    const page = Number(searchParams.page) || 1;
    const status = searchParams.status || undefined;
    const type = searchParams.type || undefined;
    const startDate = searchParams.startDate || undefined;
    const endDate = searchParams.endDate || undefined;

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
            <AppointmentsTableDoc
                appointments={appointments}
                meta={meta}
                token={session.user.accessToken}
                userId={session.user.id}
            />
        </div>
    );
};

export default AppointmentsHolderDoc;
