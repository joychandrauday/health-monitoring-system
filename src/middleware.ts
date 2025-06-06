import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Get the session token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // If user is not authenticated, redirect to login
    if (!token) {
        return NextResponse.redirect(new URL("/api/auth/signin", req.url));
    }

    // Extract the role from the URL (e.g., /patient/dashboard -> patient)
    const roleFromUrl = pathname.split("/")[1]; // Gets 'patient', 'doctor', or 'admin'
    const userRole = token.role; // Role from the session

    // Check if the user's role matches the URL role
    if (userRole !== roleFromUrl) {
        // Redirect to unauthorized page or user's own dashboard
        return NextResponse.redirect(new URL(`/${userRole}/dashboard`, req.url));
    }

    // Allow the request to proceed if roles match
    return NextResponse.next();
}

export const config = {
    matcher: ["/:role(patient|doctor|admin)/dashboard/:path*"],
};