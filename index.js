const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zihtklt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function connectDb(){
    try {
        const serviceCollection = client.db('IELTS-Hub').collection('services');
        const reviewCollection = client.db('IELTS-Hub').collection('review');

        app.get('/data', (req, res)  => {
            res.send('database connection successful')
        })
    }
    finally {

    }
}
connectDb().catch(err => console.log(err));


app.get('/', (req, res) => {
    res.send('IELTS Server is running')
});

app.listen(port, () =>{
    console.log(`server running on port ${port}`);
})