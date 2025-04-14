import { NextAuthOptions, User, getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import prisma from "./prisma";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

export const authConfig: NextAuthOptions = {
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
        // Validate input credentials
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error("Invalid credentials");
        }

        // Find user in the database by email
        const dbUser = await prisma.user.findFirst({
          where: { email: credentials.email },
        });

        // If no user is found, throw a "User not found" error
        if (!dbUser) {
          throw new Error("User not found");
        }

        // Compare the entered password with the stored hashed password using bcrypt
        const isValidPassword = await bcrypt.compare(credentials.password, dbUser.password);
        if (!isValidPassword) {
          throw new Error("Invalid password");
        }

        // Exclude sensitive fields before returning the user object
        const { password, createdAt, user_id, ...dbUserWithoutPassword } = dbUser;
        return dbUserWithoutPassword as unknown as User;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only handle OAuth sign-ins (Google and GitHub)
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email as string },
          });

          if (!existingUser) {
            // Generate a unique user_id
            const user_id = crypto.randomBytes(5).toString("hex"); // 10-character hex string
            
            // Create new user in database
            await prisma.user.create({
              data: {
                user_id,
                email: user.email as string,
                name: user.name as string,
                password: "", // No password for OAuth users
              },
            });
          }
          
          return true;
        } catch (error) {
          console.error("Error during OAuth sign-in:", error);
          return false;
        }
      }
      
      // For credentials provider, just allow sign-in
      return true;
    },
    async session({ session, token }) {
      // Add user_id to the session if available
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email as string },
        });
        
        if (dbUser) {
          session.user.id = dbUser.user_id;
        }
      }
      
      return session;
    },
  },
};

export async function loginIsRequiredServer() {
  const session = await getServerSession(authConfig);
  if (!session) return redirect("/login");
}

export function loginIsRequiredClient() {
  if (typeof window !== "undefined") {
    const session = useSession();
    const router = useRouter();
    if (!session) router.push("/login");
  }
}
