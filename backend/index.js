const express = require('express')
const { default: mongoose } = require('mongoose')
const cors = require('cors');

const app = express()
const rootRouter = require("./Routes/index");
const port = 3000


//* middlewares

app.use("api/v1", rootRouter);
app.use(cors());
app.use(express.json()); //body purser

//* mongo connection 
async function main() {
    await mongoose.connect("mongodb+srv://ckbtamaldipnew:v0wZ5g8j5Ee6LyEN@cluster0.pkptg4q.mongodb.net/");
    console.log("database connected");
}

//error handling 
main().catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello World!'))


app.listen(port, () => console.log(`Example app listening on port ${port}!`))