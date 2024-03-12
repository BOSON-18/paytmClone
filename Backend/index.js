const express = require('express')
const cors = require('cors');

const app = express();
const port = 3000;

//! MIDDLEWARES 
app.use(cors());
app.use(express.json()); //body-parser

//!Routes 
const mainRouter = require("./routes/index");

app.use("/api/v1", mainRouter);

app.listen(port, () => {
    console.log("App is listening in the port : " + port);
});