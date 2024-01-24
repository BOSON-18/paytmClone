const express = require('express')
const { default: mongoose } = require('mongoose')
const app = express()
const port = 3000

//* mongo connection 
async function main() {
    await mongoose.connect("mongodb+srv://ckbtamaldipnew:v0wZ5g8j5Ee6LyEN@cluster0.pkptg4q.mongodb.net/");
    console.log("database connected");
}

//error handling 
main().catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello World!'))


app.listen(port, () => console.log(`Example app listening on port ${port}!`))