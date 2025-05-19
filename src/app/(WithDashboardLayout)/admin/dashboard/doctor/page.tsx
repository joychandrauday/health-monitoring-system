
import DoctorTabs from "@/components/Modules/Dashboard/Admin/Doctor/DoctorTabs";
import { GetAllDocs, GetDocRequest } from "@/service/Doctor";

const DocPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) => {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const { users, meta } = await GetDocRequest(page);
    const { doctors, docMeta } = await GetAllDocs({ page })

    return (
        <div>
            <DoctorTabs requests={users} requestMeta={meta} doctors={doctors} docsMeta={docMeta} />
        </div>
    );
};

export default DocPage;
