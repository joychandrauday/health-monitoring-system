/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextAuthOptions, User, DefaultSession, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";

// Type augmentation for NextAuth
declare module "next-auth" {
    interface Session {
        user?: {
            id: string;
            name: string;
            email: string;
            role: string;
            avatar: string;
            accessToken: string;
        };
    }

    interface User {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar: string;
        token: string;
    }

    interface JWT {
        id: string;
        role: string;
        avatar: string;
        accessToken: string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "user@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API}/users/login`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(credentials),
                    });

                    const user = await res.json();
                    if (!res.ok) throw new Error(user.message || "Login failed");

                    // Ensure user.token is a string
                    if (typeof user.token !== "string") {
                        throw new Error("Invalid token received from server");
                    }

                    return {
                        id: user.user._id,
                        name: user.user.name,
                        email: user.user.email,
                        role: user.user.role,
                        avatar: user.user.avatar,
                        token: user.token,
                    } as User;
                } catch (error) {
                    throw new Error((error as Error).message || "Login failed");
                }
            },
        }),
    ],

    pages: {
        signIn: "/login",
    },

    secret: process.env.NEXTAUTH_SECRET,

    session: {
        strategy: "jwt",
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.avatar = user.avatar;
                token.accessToken = user.token;
            }
            return token;
        },

        async session({ session, token }): Promise<Session | DefaultSession> {
            // Initialize session.user if not present
            if (!session.user) {
                session.user = {
                    id: "",
                    name: "",
                    email: "",
                    role: "",
                    avatar: "",
                    accessToken: "",
                };
            }
            // Check if token.accessToken is a string
            if (typeof token.accessToken !== "string") {
                throw new Error("Invalid or missing access token");
            }

            try {
                const decoded = jwt.decode(token.accessToken) as { exp: number } | null;
                const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
                if (!decoded || !decoded.exp || decoded.exp < currentTime) {
                    // Token is expired or invalid
                    throw new Error("Token expired or invalid");
                }

                // Token is valid, populate session
                session.user.id = String(token.id ?? "");
                session.user.name = session.user.name ?? "";
                session.user.email = session.user.email ?? "";
                session.user.avatar = String(token.avatar ?? "");
                session.user.role = String(token.role ?? "");
                session.user.accessToken = token.accessToken;

                return session;
            } catch (error) {
                // Handle token decoding or expiration errors
                throw new Error("Invalid or expired token");
            }
        },
    },
};