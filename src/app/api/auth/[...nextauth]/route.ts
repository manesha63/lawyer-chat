import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

// Simple authentication for RJLF employees only
const ALLOWED_EMAIL_DOMAIN = "@reichmanjorgensen.com";

// Temporary demo user - Remove this when implementing secure authentication
const DEMO_USER = {
  id: "1",
  email: "demo@reichmanjorgensen.com",
  name: "Demo User",
  // Password: "demo123" (hashed)
  password: "$2a$10$VDGJ27X6oPUxgDf4kkazdeK/P6UR6Y4cYbg/DnujUlAFav8cWJ9n6"
};

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check if email is from RJLF domain
        if (!credentials.email.endsWith(ALLOWED_EMAIL_DOMAIN)) {
          throw new Error("Only Reichman Jorgensen employees can sign in");
        }

        // For now, only check demo user
        if (credentials.email === DEMO_USER.email) {
          const isValidPassword = await compare(credentials.password, DEMO_USER.password);
          
          if (isValidPassword) {
            return {
              id: DEMO_USER.id,
              email: DEMO_USER.email,
              name: DEMO_USER.name,
            };
          }
        }

        return null;
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-this",
  session: { 
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user && token) {
        // Add user ID to session
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };