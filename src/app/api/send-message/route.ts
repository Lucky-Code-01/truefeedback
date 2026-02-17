import dbConnect from "@/lib/dbConnection";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import { Message } from "@/model/User";

export async function POST(request:Request){
    try{
        await dbConnect();
        const {content,username} = await request.json();
        
        // find user 
        const searchUser = await UserModel.findOne({username});
        if(!searchUser){
            return NextResponse.json({
                message: "User not found!!",
                success: false
            },{status: 400})
        };

        // check user accept message or not
        if(!searchUser.isAcceptMessage){
            return NextResponse.json({
                message: "User not accept message yet!!",
                success: false,
            },{status: 400});
        }


        const messageObj = {content,createdAt: new Date()};
        searchUser.messages.push(messageObj as Message);
        await searchUser.save();

        return NextResponse.json({
            message: 'Message send successfully',
            sucess: true
        },{status:200});

    }
    catch(error){
        console.log(`Error to send message :- ${error}`);
        return NextResponse.json({
            message: 'Message send successfully',
            sucess: true
        },{status:200});
    }
}