const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zihtklt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function connectDb() {
  try {
    const serviceCollection = client.db("IELTS-Hub").collection("services");
    const reviewCollection = client.db("IELTS-Hub").collection("review");

    //Routes for Home page services
    app.get("/", async (req, res) => {
      results = await serviceCollection.find({}).limit(3).toArray();
      res.send(results);
    });

    app.get("/services", async (req, res) => {
      const services = await serviceCollection.find({}).toArray();
      res.send(services);
    });

    app.get("/services/:id", async (req, res) => {
      const { id } = req.params;

      const service = await serviceCollection.findOne({ _id: ObjectId(id) });
      res.send(service);
    });

    //Routes for Add service page 
    app.post("/services", async (req, res) => {
        const newService = req.body;
        const addService = await serviceCollection.insertOne(newService);
        res.send(addService)
    });

    //Reviews Routes
    app.get("/reviews/:id", async (req, res) => {
      const { id } = req.params;
      const results = await reviewCollection.find({ serviceId: id }).toArray();
      res.send(results);
    });

    app.post("/reviews/", async (req, res) => {
      const review = req.body;
      const newReview = await reviewCollection.insertOne(review);
      res.send(newReview);
    });

    app.get("/my-reviews", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { userEmail: email };
      }
      const reviews = await reviewCollection.find(query).toArray();
      res.send(reviews);
    });

    //Get single service using id for update review
    app.get("/update/:id", async (req, res) => {
      const { id } = req.params;
      const results = await reviewCollection.findOne({ _id: ObjectId(id) });
      res.send(results);
    });

    app.patch("/reviews/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) };
      const { text } = req.body;
      const update = {
        $set: { userMessage: text },
      };
      const updateReview = await reviewCollection.updateOne(query, update);
      res.send(updateReview);
    });

    app.delete("/reviews/:id", async (req, res) => {
      const { id } = req.params;
      const results = await reviewCollection.deleteOne({ _id: ObjectId(id) });
      res.send(results);
    });
  } finally {
  }
}
connectDb().catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
