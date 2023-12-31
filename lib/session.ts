import { getServerSession } from "next-auth/next";
import { NextAuthOptions, User } from "next-auth";

import { AdapterUser } from "next-auth/adapters";

import GoogleProvider from "next-auth/providers/google";

import jsonwebtoken from "jsonwebtoken";

import { JWT } from "next-auth/jwt";
import { log } from "console";
import { SessionInterface, UserProfile } from "@/common.types";
import { createUser, getUser } from "./actions";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // jwt:{
  //     encode:({secret,token})=>{

  //     },
  //     decode: async ({secret, token}) => {

  //     }
  // },
  theme: {
    colorScheme: "light",
    logo: "/logo.svg",
  },
  callbacks: {
    async session({ session }) {
        const email=session?.user?.email as string;

        try{
       const data =await getUser(email) as { user?: UserProfile}

       const newSession ={
         ...session,
         user:{
            ...session.user,
            ...data?.user
         }
       }
      return newSession;

        }catch(error){
        console.log('Error retrieving user data',error);
         return session;
        }
    },
    async signIn({ user }: { user: AdapterUser | User }) {
      try {
        //  get the user if they exist
        const userExists = (await getUser(user?.email as string)) as {
          user?: UserProfile;
        };
        //  if user not exist create them

        if (!userExists.user) {
          await createUser(
            user.name as string,
            user.email as string,
            user.image as string
          );
        }
        return true;
      } catch (error: any) {
        console.log(error);
        return false;
      }
    },
  },
};

export async function getCurrentUser() {
  const session = (await getServerSession(authOptions)) as SessionInterface;

  return session;
}
