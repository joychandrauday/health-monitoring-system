import AppointmentsHolderDoc from "@/components/Modules/Dashboard/Doctor/Appointments/AppointmentsHolderDoc";

interface PageProps {
    searchParams: { [key: string]: string | undefined };
}

export const Page = async ({ searchParams }: PageProps) => {
    return (
        <div>
            <AppointmentsHolderDoc searchParams={searchParams} />
        </div>
    );
};
