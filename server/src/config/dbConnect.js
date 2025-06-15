const mongoose = require("mongoose");

const dbConnect = async () => {
    try {
        await mongoose.connect('mongodb+srv://catalinmandea:CatalinUPIT01!@catalinplanificarefinan.0rjv3.mongodb.net/?retryWrites=true&w=majority&appName=CatalinPlanificareFinanciara');
        console.log('DB connected successfully');
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
}

module.exports = dbConnect;
