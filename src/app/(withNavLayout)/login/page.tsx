/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useState } from "react";

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
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false, // Prevent automatic redirect to handle manually
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      toast.success("Logged in successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong!");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-inter relative overflow-hidden">
      {/* Back to Home Link */}
      <Link
        href="/"
        className="inline-block mb-4 text-[#005A8D] hover:underline text-sm absolute top-4 left-4 w-full"
        aria-label="Back to Home"
      >
        ← Back to Home
      </Link>

      {/* Left Banner */}
      <div className="md:w-1/2 hidden md:flex items-center justify-center bg-[#ffffff]">
        <Image
          src="/login_bg.jpg" // Replace with a suitable login-themed image
          alt="Login Illustration"
          width={500}
          height={500}
          className="object-contain"
          priority
        />
      </div>

      {/* Right Form Section */}
      <div className="flex items-center justify-center md:w-1/2 p-8">
        <div className="w-full max-w-md p-8 border border-gray-200 rounded-2xl relative shadow-lg">
          <h1 className="text-4xl font-bold text-center text-[#005A8D] mb-6">Sign In</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" aria-label="Login Form">
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email", { required: "Email is required" })}
                placeholder="Your Email"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005A8D]"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
                required
              />
              {errors.email && (
                <p id="email-error" className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password", { required: "Password is required" })}
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005A8D]"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
                required
              />
              {errors.password && (
                <p id="password-error" className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center bg-[#2E7D32] text-white font-semibold py-2 rounded-md shadow-md transition duration-300 hover:bg-[#1B5E20] disabled:opacity-60"
              aria-busy={loading}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              ) : null}
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-4 text-sm">
            Don’t have an account?{" "}
            <Link href="/register" className="text-[#005A8D] hover:underline">
              Register
            </Link>
          </p>

          <p className="text-center text-gray-600 mt-4 text-sm">Or continue with</p>
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full shadow-md hover:bg-gray-300 transition duration-300"
              aria-label="Sign in with Google"
            >
              <Image
                src="https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-webinar-optimizing-for-success-google-business-webinar-13.png"
                width={30}
                height={30}
                alt="Google logo"
              />
            </button>
            <button
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full shadow-md hover:bg-gray-300 transition duration-300"
              aria-label="Sign in with GitHub"
            >
              <Image
                src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
                width={25}
                height={25}
                alt="GitHub logo"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;