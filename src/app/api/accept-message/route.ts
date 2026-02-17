import dbConnect from "@/lib/dbConnection";
import UserModel from "@/model/User";
import { auth } from "../auth/[...nextauth]/auth";
import { User } from 'next-auth'
import { NextResponse } from "next/server";

// methods here

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { acceptFlag } = await request.json();

        const session = await auth();
        const user: User = session?.user;

        if (!session || !user) {
            return NextResponse.json({
                message: "Session was expired!!",
                success: false
            }, { status: 400 });
        };

        // get user 
        const userId = user._id;
        const searchUser = await UserModel.findByIdAndUpdate(userId, {
            $set: {
                isAcceptMessage: acceptFlag
            }
        }, { new: true });

        if (!searchUser) {
            return Response.json(
                {
                    success: false,
                    message: 'Unable to find user to update message acceptance status',
                },
                { status: 404 }
            );
        }


        // send final response
        return NextResponse.json({
            message: "Message acceptance status updated successfully",
            success: true,
            isAcceptenceMessage: searchUser.isAcceptMessage
        }, { status: 200 });


    }
    catch (error) {
        console.error('Error updating message acceptance status:', error);
        return Response.json(
            { success: false, message: 'Error updating message acceptance status' },
            { status: 500 }
        );
    }

};

export async function GET(request: Request) {
    await dbConnect();
    try{
        const session = await auth();
        const user: User = session?.user;

        if(!session?.user || !user){
            return NextResponse.json({
                message: "Session was expired!!",
                success: false
            }, { status: 400 });
        };

        const searchUser = await UserModel.findById(user._id);
        if(!searchUser){
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            isAcceptingMessages: searchUser.isAcceptMessage,
        },{status:200});
    }
    catch(error){
        console.error('Error retrieving message acceptance status:', error);
        return Response.json(
        { success: false, message: 'Error retrieving message acceptance status' },
        { status: 500 }
        );
    }
}