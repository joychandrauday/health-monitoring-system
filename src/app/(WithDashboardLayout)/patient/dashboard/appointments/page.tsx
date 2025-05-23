import AppointmentsHolder from "@/components/Modules/Dashboard/Patient/Appointments/AppointmentsHolder";

interface PageProps {
    searchParams: { [key: string]: string | undefined };
}

const Page = async ({ searchParams }: PageProps) => {
    return (
        <div>
            <AppointmentsHolder searchParams={searchParams} />
        </div>
    );
};

export default Page;
