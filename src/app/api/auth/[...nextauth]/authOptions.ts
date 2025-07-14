import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { supabase } from "../../../../utils/supabaseClient";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      if (user?.email) {
        await supabase
          .from("users")
          .upsert([
            {
              email: user.email,
              name: user.name,
              image: user.image,
            },
          ], { onConflict: "email" });
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { id?: string }).id = token.sub;
      }
      return session;
    },
  },
}; 