import {z} from 'zod'

//this verification for server
const verifyCodeSchema = z.object({
    code : z.string().length(6,{error:"Verification must be 6 digits"})
});

export default verifyCodeSchema;