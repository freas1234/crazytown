import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import type { NextAuthOptions } from "next-auth";

const DISCORD_CLIENT_ID = "1385383028494438523";
const DISCORD_CLIENT_SECRET = "ypnoaQwvPb-fIxZioZYWcbKVbvvZIRAv";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: DISCORD_CLIENT_ID,
      clientSecret: DISCORD_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "identify email",
          redirect_uri: "https://crazytown.store/api/auth/callback/discord",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user || user.password !== credentials.password) {
            return null;
          }

          
          return {
            id: user.id,
            email: user.email,
            name: user.username,
            username: user.username,
            image: user.avatar,
            role: user.role,
            discordId: user.discordId
          };
        } catch (error) {
          console.error("Error in credentials authorize:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      
      const newToken = { ...token };
      
      if (account && user) {
        const discordId = account.provider === "discord" ? account.providerAccountId : undefined;
        
        if (account.provider === "discord") {
          try {
            const dbUser = await db.user.findUnique({
              where: { discordId: account.providerAccountId }
            });
            
            if (dbUser) {
              newToken.userId = dbUser.id;
              newToken.username = dbUser.username || "";
              newToken.role = dbUser.role || "user";
              newToken.discordId = discordId;
              newToken.accessToken = account.access_token;
              return newToken;
            }
          } catch (error) {
            console.error("Error finding Discord user in database:", error);
          }
        }
        
        newToken.userId = user.id;
        
        if (typeof user.username === 'string') {
          newToken.username = user.username;
        } else if (typeof user.name === 'string') {
          newToken.username = user.name;
        } else {
          newToken.username = "";
        }
        
        // Make sure to set the role from the user object
        newToken.role = user.role || "user";
        
        newToken.accessToken = account.access_token;
        
        if (account.provider === "discord") {
          newToken.discordId = discordId;
        }
      }

      return newToken;
    },
    async session({ session, token }) {
      
      if (session.user) {
        session.user.id = token.userId || token.sub || "";
        
        // Make sure to set the role from the token
        session.user.role = token.role || "user";
        
        if (typeof token.username === 'string') {
          session.user.username = token.username;
        } else if (typeof session.user.name === 'string') {
          session.user.username = session.user.name;
        } else {
          session.user.username = "";
        }
        
        session.user.discordId = token.discordId;
      }
      
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") {
        return true;
      }

      try {
        if (!profile) {
          return false;
        }
        
        if (account?.provider === "discord") {
          let dbUser = await db.user.findUnique({
            where: { discordId: account.providerAccountId }
          });

          if (!dbUser && user.email) {
            dbUser = await db.user.findUnique({
              where: { email: user.email }
            });
          }

          if (dbUser) {
            await db.user.update({
              where: { id: dbUser.id },
              data: {
                discordId: account.providerAccountId,
                avatar: user.image || undefined
              }
            });
          } else {
            const username = user.name || `user${account.providerAccountId.substring(0, 6)}`;
            
            const newUser = await db.user.create({
              data: {
                email: user.email || `${account.providerAccountId}@discord.user`,
                username,
                role: 'user',
                discordId: account.providerAccountId,
                avatar: user.image || undefined,
                password: ""
              }
            });
          }
        }

        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login?error=AuthError",
  },
  secret: process.env.NEXTAUTH_SECRET || "YOUR_FALLBACK_SECRET",
  debug: process.env.NODE_ENV === "development",
}; 