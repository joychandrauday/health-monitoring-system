import Landing from "@/components/Modules/HomePage/Landing";
import { GetAllDocs } from "@/service/Doctor";

const HomeBannerElements = async () => {

  const { doctors } = await GetAllDocs({
    page: 1,
    limit: 20,
  });

  return (
    <div className="w-full">
      <Landing doctors={doctors} />
    </div>
  );
};

export default HomeBannerElements;