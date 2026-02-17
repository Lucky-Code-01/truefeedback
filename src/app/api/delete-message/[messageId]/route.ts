import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnection";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "../../auth/[...nextauth]/auth";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
    try {
        await dbConnect();

        // check user session
        const session = await auth();
        const user = session?.user;

        if (!session || !user) {
            return NextResponse.json({
                message: 'Not authenticated',
                success: false
            }, { status: 401 })
        }


        const { messageId } = await params; 
        const updateResult = await UserModel.updateOne(
            { _id: user._id },
            { $pull: { messages: { _id: messageId } } }
        );

        if (updateResult.modifiedCount === 0) {
            return Response.json(
                { message: 'Message not found or already deleted', success: false },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Message was delete!!",
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
};