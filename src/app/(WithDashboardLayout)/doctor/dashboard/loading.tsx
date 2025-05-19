'use client';

import Image from 'next/image';
const LoadingPage: React.FC = () => {
  return (
    <div className="w-[90%] mx-auto min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <Image
          src="/capsule.gif"
          alt="Loading"
          width={48}
          height={48}
          priority
          className="mx-auto"
        />
      </div>
    </div>
  );
};

export default LoadingPage;