const express = require('express')
const mainRouter = require("./routes/index");
const cors = require('cors');

const app = express();
const port = 3000;

//! MIDDLEWARES 
app.use("/api/v1", mainRouter);
app.use(cors());
app.use(express.json()); //body-parser


app.listen(port, () => {
    console.log("App is listening in the port : " + port);
});