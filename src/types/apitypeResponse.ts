import { Message } from "@/model/User"

export interface apiResponse {
    success : boolean,
    message : string,
    status : number,
    ismessageAccept?: boolean,
    messages?: Array<Message>
}

export interface verifyficationType{
    email:string,
    emailType: string,
    otp:string
}

export interface apiError{
    success : boolean,
    message : string,
    status : number
}