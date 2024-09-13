import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connetion = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Database connection Successful: ${connetion.connection.host}`)
    } catch(error) {
        console.error(`Error! Connection to Database failed: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;