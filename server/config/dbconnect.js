const mongoose = require("mongoose");
require("dotenv").config();

const dbConnect = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
        });

        // connect.connection.readyState => trang thai ket noi cua mongodb
        // 0 = disconnected
        // 1 = connected
        // 2 = connecting
        // 3 = disconnecting
        if (connect.connection.readyState === 1)
            console.log("DB connection is successfully!");
        else console.log("DB connecting");
    } catch (error) {
        console.log("DB connect is failed with error: " + error);
    }
};

module.exports = dbConnect;
