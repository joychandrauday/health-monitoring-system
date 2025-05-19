import Image from "next/image";

const LoadingPage = () => {
  return (
    <div className="w-[90%] mx-auto min-h-[50vh] flex items-center justify-center">
      <Image
        src="/capsule.gif"
        width={100}
        height={100}
        alt="loading"
        className="mx-auto"
      />
    </div>
  );
};

export default LoadingPage;
