import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import dbConnection from '@/lib/dbConnection';
import UserModel from '@/model/User';
import type { NextAuthConfig } from "next-auth";

export const authOptions:NextAuthConfig = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "Enter your email" },
                password: { label: "Password", type: "text", placeholder: "Enter your password" }
            },

            // here authorize is a function that perform actual login 
            // auth does not login automaticall its use authorize function
            async authorize(credentials: any): Promise<any> {

                // first connect db
                await dbConnection();

                try {
                    const email = credentials.email;
                    const password = credentials.password;
                    
                    // here find user first
                    const user = await UserModel.findOne({ email: email });

                    if (!user) {
                        throw new Error("No user found with this email!!");
                    };

                    if (!user.isVerifyed) {
                        throw new Error("Please verify your account first before login!!");
                    }

                    const passwordCorrect = await bcrypt.compare(password, user.password);

                    if (passwordCorrect) {
                        return user; // this return user send into authOptions
                    }
                    else {
                        throw new Error("Password incorrect try again!!");
                    }


                }
                catch (err) {
                    console.log(err);
                }

            }
        })
    ],

    callbacks: {
        async jwt({ token, user }) {
            if(user){
                token._id = user._id?.toString()
                token.isVerifyed = user.isVerified
                token.isAcceptingMessages = user.isAcceptingMessages
                token.username = user.username
            }
            return token;
        },
        async session({ session, token }) {
            if(token){
                session.user._id = token._id
                session.user.isVerifyed = token.isVerifyed
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username
            }
            return session
        }
    },

    pages: {
        signIn: '/sign-in',
    },

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60
    },

    secret: process.env.NEXTAUTH_SECRET


}
