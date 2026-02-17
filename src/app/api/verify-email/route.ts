import dbConnect from "@/lib/dbConnection";
import UserModel from "@/model/User";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    await dbConnect();

    try {
        const { username, verifyCode } = await request.json();
        // check user exist or not 
        const user = await UserModel.findOne({ username });

        if (!user) {
            return NextResponse.json({
                message: "user not found!!",
                success: false
            }, { status: 400 })
        };

        // here we check code 
        if (
            !user.verifyCode ||
            !user.verifyCodeExpiry ||
            verifyCode !== user.verifyCode ||
            user.verifyCodeExpiry < new Date()
        ) {
            return NextResponse.json({
                message: "verification code is wrong or expire",
                success: false
            }, { status: 400 })
        };

        // here all set now verify user 
        user.isVerifyed = true;
        user.verifyCode = undefined;
        user.verifyCodeExpiry = undefined;

        // now save user 
        await user.save();

        return NextResponse.json({
            message: "user verification successfully!!",
            success: true
        },{status:200})
    }
    catch (error) {
        if(error instanceof Error){
            return NextResponse.json({
            message: error.message,
            success: false,
            },{status:500})
        }
        else{
            return NextResponse.json({
                message: "something went wrong!!",
            },{status:500})
        }
    }
}