import { NextAuthOptions, User, getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    }
  }
}

export const authConfig: NextAuthOptions = {
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error("Invalid credentials");
        }

        const res = await fetch(`${BACKEND_URL}/api/auth/verify-credentials`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Invalid credentials");
        }

        const dbUser = await res.json();
        return dbUser as unknown as User;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/oauth-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
            }),
          });
          return res.ok;
        } catch (error) {
          console.error("Error during OAuth sign-in:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/user?email=${encodeURIComponent(session.user.email)}`, {
            cache: "no-store"
          });
          if (res.ok) {
            const dbUser = await res.json();
            session.user.id = dbUser.user_id;
            session.user.role = dbUser.role;
          }
        } catch (error) {
          console.error("Error updating session with user role:", error);
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export async function loginIsRequiredServer() {
  const session = await getServerSession(authConfig);
  if (!session) return redirect("/login");
}

export type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export const getUserSession = async (): Promise<SessionUser | null> => {
  const authUserSession = await getServerSession(authConfig);
  return authUserSession?.user || null;
};
