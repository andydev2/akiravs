import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL || '',
].filter(Boolean);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-client-secret",
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    })
  ],
  pages: {
    signIn: '/',
    error: '/'
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      if (account?.provider === "google") {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            email: user.email,
            isVerified: true,
            provider: 'google',
            role: ADMIN_EMAILS.includes(user.email) ? 'admin' : 'user'
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        (session.user as any).role = ADMIN_EMAILS.includes(token.email) ? 'admin' : 'user';
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "mock-secret-para-desarrollo",
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
