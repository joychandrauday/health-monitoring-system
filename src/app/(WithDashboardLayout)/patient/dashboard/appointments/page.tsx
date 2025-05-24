import AppointmentsHolder from "@/components/Modules/Dashboard/Patient/Appointments/AppointmentsHolder";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page = async ({ searchParams }: PageProps) => {
    const resolvedSearchParams = await searchParams;
    return (
        <div>
            <AppointmentsHolder searchParams={resolvedSearchParams} />
        </div>
    );
};

export default Page;
