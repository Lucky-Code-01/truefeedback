import NextAuth from "next-auth";
import { authOptions } from "./options";

//  Important: destructure handlers
export const { handlers, auth } = NextAuth(authOptions);