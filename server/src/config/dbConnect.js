const mongoose = require("mongoose");

const dbConnect = async () => {
    try {
        // Use the environment variable or fallback to a test connection
        const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/financial-planning";
        
        await mongoose.connect(mongoUri);
        console.log('DB connected successfully');
    } catch (error) {
        console.log(`Database connection error: ${error.message}`);
        console.log('Please make sure MongoDB is running or update your MONGODB_URI in .env file');
        // Don't exit the process, let it continue with potential connection issues
    }
}

module.exports = dbConnect;
