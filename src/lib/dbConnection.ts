import mongoose from "mongoose";


// define type for object in typescript
type ConnectionObject = {
    isConnected? : number
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
    if(connection.isConnected){
        console.log("Already conneted to database")
        return;
    }

    try{
        const db = await mongoose.connect((`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.towglxj.mongodb.net/${process.env.MONGODB_DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`));
        connection.isConnected = db.connections[0].readyState;
        console.log('Database connected successfully!!');
    }   
    catch(err){
        console.log('db connection failed :- ', err);
        process.exit() // exit when db connection failed
    }
}

export default dbConnect;