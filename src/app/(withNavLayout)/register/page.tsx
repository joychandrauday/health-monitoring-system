/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { registerUser } from "@/utils/actions/registerUser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useState } from "react";
import Image from "next/image";

export type UserData = {
  name: string;
  email: string;
  password: string;
  role?: string;
  doctorRequest?: boolean;
};

const RegisterPage = () => {
  const { register, handleSubmit } = useForm<UserData>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: UserData) => {
    setLoading(true);
    try {
      const finalData = {
        ...data,
        role: "patient",
      };

      const res = await registerUser(finalData);

      if (res.success) {
        toast.success(res.message);
        router.push("/login");
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-inter relative overflow-hidden">
      <Link
        href="/"
        className="inline-block mb-4 text-[#005A8D] hover:underline text-sm absolute top-4 left-4 w-full"
      >
        ← Back to Home
      </Link >

      {/* Left Banner */}
      < div className="md:w-1/2 hidden md:flex items-center justify-center bg-[#ffffff]" >
        <Image
          src="/register_bg.gif"
          alt="Doctor Registration"
          width={500}
          height={500}
          className="object-contain"
        />
      </div >

      {/* Right Form Section */}
      < div className="flex items-center  justify-center md:w-1/2 p-8" >
        <div className="w-full max-w-md p-8 border border-gray-200 rounded-2xl relative shadow-lg">

          <h1 className="text-4xl font-bold text-center text-[#005A8D] mb-6">Create Account</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" aria-label="Register Form">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                placeholder="Your Full Name"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005A8D]"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Your Email"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005A8D]"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005A8D]"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("doctorRequest")}
                id="doctorRequest"
                className="h-4 w-4 text-green-700 border-gray-300 rounded focus:ring-green-700"
              />
              <label htmlFor="doctorRequest" className="text-gray-700 text-sm">
                Request to register as a doctor
              </label>
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
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-4 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-[#005A8D] hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div >
    </div >
  );
};

export default RegisterPage;
