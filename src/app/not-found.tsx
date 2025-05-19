import Image from "next/image";
import Link from "next/link";

const NotFoundPage = () => {
  return (
    <div className="w-full flex items-center justify-center min-h-screen mx-auto bg-white px-4">
      <div className="text-center">
        <Image
          src="/broken.gif"
          width={200}
          height={200}
          alt="not found page"
          className="mx-auto"
        />
        <div className="py-2">
          <h1 className="text-gray-600 font-bold text-lg">
            X Page not found or the link is broken!
          </h1>
        </div>
        <Link
          href="/"
          className="inline-block mt-4  text-primary font-semibold py-2 px-4 rounded transition duration-200"
        >
          ⬅️ Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
