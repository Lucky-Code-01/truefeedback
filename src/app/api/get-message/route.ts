import dbConnect from "@/lib/dbConnection";
import UserModel from "@/model/User";
import { auth } from "../auth/[...nextauth]/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";


export async function GET(request: Request) {
    await dbConnect();
    try {
        const session = await auth();
        const user = session?.user;

        if (!session || !user) {
            return NextResponse.json({
                message: "Session was expired!!",
                success: false
            }, { status: 400 });
        };

        // convert this id into mongodb object
        const userId = new mongoose.Types.ObjectId(user._id);
        
        // here aggregate function
        const searchUser = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: "$messages" },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: "$_id", messages: { $push: "$messages" } } }
        ]);

        if (!searchUser || searchUser.length === 0) {
            return NextResponse.json({
                message: "user not found!!",
                success: false
            }, { status: 400 })
        };

        // now finally send this data to user 
        return NextResponse.json({
            message: searchUser[0].messages,
            success: true
        }, { status: 200 })

    }
    catch (error) {
        console.error('Error fetch message :- ', error);
        return Response.json(
            { success: false, message: 'Something went wrong' },
            { status: 500 }
        );
    }
}