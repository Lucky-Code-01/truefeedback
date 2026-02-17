import dbConnect from "@/lib/dbConnection";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schema/signupSchema";
import { NextResponse } from "next/server";
import z from "zod";

const userquerySchema = z.object({
    uniqueUser: usernameValidation
});

export async function GET(request:Request){
    try{
        await dbConnect();
        const {searchParams} = new URL(request.url);
        const queryParams = {
            uniqueUser : searchParams.get('uniqueUser')
        };
        
        // now check the zod validation
        const result = userquerySchema.safeParse(queryParams);
        if(!result.success){
            return NextResponse.json({
                message: result.error.format().uniqueUser?._errors || [],
                success: false,
            },{status :400})    
        };

        // now call and check the username using database
        const {uniqueUser} = result.data;
        const exisitngverifyUser = await UserModel.findOne({username:uniqueUser,isVerifyed: true});

        if(exisitngverifyUser){
            return NextResponse.json({
                message: "User name is already taken",
                success: false
            },{status: 200});
        };

        return NextResponse.json({
            message: "User name is unique",
            success: true
        },{status: 200});

    }
    catch(error){
        console.error('Error checking username:', error);
        return Response.json({
            success: false,
            message: 'Error checking username',
        },{ status: 500 });
    }
}