import {z} from 'zod'

const acceptmessageSchema = z.object({
    acceptMessage : z.boolean()
});

export default acceptmessageSchema;