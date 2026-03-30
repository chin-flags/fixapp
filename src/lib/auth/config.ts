import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { compare } from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tenants, users } from "@/lib/db/schema";

type AuthToken = JWT & {
  id?: string;
  role?: string;
  tenantId?: string;
  tenantSubdomain?: string;
  accessToken?: string;
  refreshToken?: string;
};

function normalizeSubdomain(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      tenantId: string;
      tenantSubdomain: string;
      accessToken: string;
      refreshToken: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
    tenantSubdomain: string;
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    tenantId?: string;
    tenantSubdomain?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        subdomain: { label: "Subdomain", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");
        const subdomain = normalizeSubdomain(credentials?.subdomain);

        if (!email || !password || !subdomain) {
          console.error("Login rejected: missing email, password, or subdomain", {
            emailPresent: !!email,
            passwordPresent: !!password,
            subdomain,
          });
          return null;
        }

        try {
          const tenant = await db.query.tenants.findFirst({
            where: eq(tenants.subdomain, subdomain),
          });

          if (!tenant || !tenant.isActive) {
            console.error("Login rejected: tenant missing or inactive", {
              subdomain,
              tenantFound: !!tenant,
              tenantActive: tenant?.isActive ?? null,
            });
            return null;
          }

          const user = await db.query.users.findFirst({
            where: and(
              eq(users.tenantId, tenant.id),
              eq(users.email, email.toLowerCase()),
            ),
          });

          if (!user || !user.isActive || !user.passwordHash) {
            console.error("Login rejected: user missing, inactive, or has no password hash", {
              email: email.toLowerCase(),
              tenantId: tenant.id,
              userFound: !!user,
              userActive: user?.isActive ?? null,
              hasPasswordHash: !!user?.passwordHash,
            });
            return null;
          }

          const isValidPassword = await compare(password, user.passwordHash);

          if (!isValidPassword) {
            console.error("Login rejected: invalid password", {
              email: user.email,
              tenantId: user.tenantId,
            });
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            tenantSubdomain: subdomain,
            accessToken: `frontend-session:${user.id}`,
            refreshToken: "",
          };
        } catch (error) {
          console.error("Login error during credentials authorize:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          tenantId: user.tenantId,
          tenantSubdomain: user.tenantSubdomain,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
        };
      }

      return token;
    },
    async session({ session, token }) {
      const authToken = token as AuthToken;

      if (session.user) {
        session.user.id = authToken.id || "";
        session.user.role = authToken.role || "";
        session.user.tenantId = authToken.tenantId || "";
        session.user.tenantSubdomain = authToken.tenantSubdomain || "";
        session.user.accessToken = authToken.accessToken || "";
        session.user.refreshToken = authToken.refreshToken || "";
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
    maxAge: 7 * 24 * 60 * 60,
  },
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.JWT_SECRET,
});
