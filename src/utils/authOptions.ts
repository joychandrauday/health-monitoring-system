import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

// Type augmentation for NextAuth
declare module "next-auth" {
    export interface Session {
        user?: {
            id: string;
            name: string;
            email: string;
            role: string;
            accessToken: string;
        };
    }

    interface User {
        id: string;
        name: string;
        email: string;
        role: string;
        token: string;
    }

    interface JWT {
        id: string;
        role: string;
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

                    return {
                        id: user.user._id,
                        name: user.user.name,
                        email: user.user.email,
                        role: user.user.role,
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
                token.accessToken = user.token;
            }
            return token;
        },

        async session({ session, token }) {
            if (!session.user) {
                session.user = {
                    id: "",
                    name: "",
                    email: "",
                    role: "",
                    accessToken: "",
                };
            }

            session.user.id = String(token.id ?? "");
            session.user.name = session.user.name ?? "";
            session.user.email = session.user.email ?? "";
            session.user.role = String(token.role ?? "");
            session.user.accessToken = String(token.accessToken ?? "");

            return session;
        },
    },
};
