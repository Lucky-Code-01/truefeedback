import mongoose, { Document, Schema } from "mongoose";

// create datatype for schema for type script
export interface Message extends Document {
    content: string,
    createdAt: Date
}

const messageSchema: Schema<Message> = new Schema({

    content: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now()
    }
});


// making another type script interface for user
export interface User extends Document {
    username: string,
    email: string,
    password: string,
    verifyCode?: string,
    verifyCodeExpiry?: Date,
    isVerifyed: boolean,
    isAcceptMessage: boolean,
    messages: Message[]
}

const userSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true, "username is required!!"],
        trim: true
    },

    email: {
        type: String,
        match: [/.+\@.+\..+/,"provided a valid email"],
        required: [true, "email is required!!"],
    },

    password: {
        type: String,
        required: true,
    },

    verifyCode: {
        type: String,
    },

    verifyCodeExpiry:{
        type: Date,
    },

    isVerifyed: {
        type: Boolean,
        default: false,
    },

    isAcceptMessage: {
        type: Boolean,
        default: true
    },

    messages : [messageSchema]

});


const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>('User',userSchema);

export default UserModel;
 