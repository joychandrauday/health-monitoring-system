/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";

export type FormValues = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const router = useRouter();
  const { theme } = useTheme();

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await signIn("credentials", data);
      toast.success('log in successfully')
      // localStorage.setItem("accessToken", res.accessToken);
      router.push("/dashboard");
    } catch (error) {
      toast.error('something went wrong!')
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center ">
      <div className="w-full max-w-md mt-12 p-8 rounded-xl backdrop-blur-xl bg-white/10 dark:bg-black/30 shadow-lg border border-gray-200 dark:border-gray-700">
        <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">Login</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          <div className="mb-4">
            <label className="block text-sm text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              {...register("email", { required: true })}
              className="w-full mt-1 px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-gray-100"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              {...register("password", { required: true })}
              className="w-full mt-1 px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-gray-100"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 mt-4 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 focus:ring-2 focus:ring-teal-400"
          >
            Login
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-teal-500 hover:underline">
            Sign up
          </Link>
        </p>
        <p className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">Or continue with</p>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="flex items-center justify-center w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            <Image src="https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-webinar-optimizing-for-success-google-business-webinar-13.png" width={30} height={30} alt="Google logo" />
          </button>
          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="flex items-center justify-center w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            <Image src="https://cdn-icons-png.flaticon.com/512/25/25231.png" width={25} height={25} alt="GitHub logo" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;