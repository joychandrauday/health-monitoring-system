// src/app/(WithDashboardLayout)/doctor/dashboard/appointments/page.tsx
import AppointmentsHolderDoc from "@/components/Modules/Dashboard/Doctor/Appointments/AppointmentsHolderDoc";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page = async ({ searchParams }: PageProps) => {
    const resolvedSearchParams = await searchParams;

    return (
        <div>
            <AppointmentsHolderDoc searchParams={resolvedSearchParams} />
        </div>
    );
};

export default Page;