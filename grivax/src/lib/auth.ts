import { NextAuthOptions, User, getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";

import prisma from "./prisma";

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
        const { password, createdAt, id, ...dbUserWithoutPassword } = dbUser;
        return dbUserWithoutPassword as User;
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
