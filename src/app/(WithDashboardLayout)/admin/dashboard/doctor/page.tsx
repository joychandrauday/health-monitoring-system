
import DoctorTabs from "@/components/Modules/Dashboard/Admin/Doctor/DoctorTabs";
import { GetAllDocs, GetDocRequest } from "@/service/Doctor";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";

const DocPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) => {
    const session = await getServerSession(authOptions)
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const { users, meta } = await GetDocRequest(page);
    const { doctors, docMeta } = await GetAllDocs({
        page,
        token: session?.user?.accessToken as string
    })

    return (
        <div>
            <DoctorTabs requests={users} requestMeta={meta} doctors={doctors} docsMeta={docMeta} />
        </div>
    );
};

export default DocPage;
