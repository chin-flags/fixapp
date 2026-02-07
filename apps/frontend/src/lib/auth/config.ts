import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Extend the session type to include our custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      tenantId: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: string;
    tenantId: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user by email
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
          with: {
            tenant: true,
          },
        });

        if (!user) {
          return null;
        }

        // Verify password
        const isValidPassword = await compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValidPassword) {
          return null;
        }

        // Check if user and tenant are active
        if (!user.isActive || !user.tenant.isActive) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});
