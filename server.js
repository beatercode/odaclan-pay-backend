const express = require("express")
const mongoose = require("mongoose")
const Router = require("./routes/routes")
const cors = require('cors')
const port = 3003

const app = express();

app.use(cors())
app.use(express.json());

mongoose.connect('mongodb+srv://odaclan:ODAclan1!@odaclan.negcqcl.mongodb.net/odaclan?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("Connected successfully");
});

app.use(Router);

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});
