import AppointmentsHolderDoc from "@/components/Modules/Dashboard/Doctor/Appointments/AppointmentsHolderDoc";

interface PageProps {
    searchParams: { [key: string]: string | undefined };
}

const Page = async ({ searchParams }: PageProps) => {
    return (
        <div>
            <AppointmentsHolderDoc searchParams={searchParams} />
        </div>
    );
};

export default Page;
