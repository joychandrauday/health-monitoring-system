/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Open modal on page load
  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
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

  const handleDefaultLogin = async (role: "patient" | "doctor") => {
    setLoading(true);
    try {
      const credentials = {
        patient: { email: "ronty@user.com", password: "rrrrrr" },
        doctor: { email: "hamid@dr.com", password: "hhhhhh" },
      };

      const res = await signIn("credentials", {
        email: credentials[role].email,
        password: credentials[role].password,
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      toast.success(`Logged in as ${role} successfully!`);
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || `Failed to log in as ${role}!`);
      console.error(`Default ${role} login error:`, error);
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
          src="/login_bg.jpg"
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-[#005A8D]">Sign In</h1>
            <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
              <Dialog.Trigger asChild>
                <button
                  className="text-[#005A8D] hover:text-[#003087] focus:outline-none"
                  aria-label="View demo account instructions"
                >
                  <Info className="w-6 h-6" />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                  <Dialog.Title className="text-2xl font-bold text-[#005A8D] mb-4">
                    Demo Account Instructions
                  </Dialog.Title>
                  <Dialog.Description className="text-gray-700 text-sm mb-6">
                    To experience real-time messaging and vitals notifications, please follow these steps:
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                      <li>
                        Log in as the <strong>Demo Patient</strong> (Email: ronty@user.com, Password: rrrrrr) in one browser.
                      </li>
                      <li>
                        Log in as the <strong>Demo Doctor</strong> (Email: hamid@dr.com, Password: hhhhhh) in a different browser.
                      </li>
                      <li>
                        Use the messaging and vitals features to observe real-time interactions between the patient and doctor accounts.
                      </li>
                    </ul>
                    <p className="mt-4">
                      This setup allows you to test the full functionality of the Remote Health Monitoring System in a controlled environment.
                    </p>
                  </Dialog.Description>
                  <Dialog.Close asChild>
                    <Button
                      className="w-full bg-[#2E7D32] text-white hover:bg-[#1B5E20]"
                      aria-label="Close instructions modal"
                    >
                      Understood
                    </Button>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>

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

          {/* Default Login Buttons */}
          <div className="mt-6">
            <p className="text-center text-gray-600 text-sm mb-4">Or sign in as a demo user</p>
            <div className="flex justify-center gap-4">
              <Button
                variant={"ghost"}
                onClick={() => handleDefaultLogin("patient")}
                disabled={loading}
                className="border"
                aria-label="Sign in as Patient"
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
                {loading ? "Signing In..." : "Patient Demo"}
              </Button>
              <Button
                variant={"outline"}
                onClick={() => handleDefaultLogin("doctor")}
                disabled={loading}
                className=""
                aria-label="Sign in as Doctor"
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
                {loading ? "Signing In..." : "Doctor Demo"}
              </Button>
            </div>
          </div>

          <p className="text-center text-gray-600 mt-4 text-sm">
            Don’t have an account?{" "}
            <Link href="/register" className="text-[#005A8D] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;