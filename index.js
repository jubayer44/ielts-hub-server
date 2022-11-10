const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

function jwtVerify(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function connectDb() {
  try {
    const serviceCollection = client.db("IELTS-Hub").collection("services");
    const reviewCollection = client.db("IELTS-Hub").collection("review");

    //JWT routes
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    //Limit Routes for Home page services
    app.get("/", async (req, res) => {
      results = await serviceCollection
        .find({})
        .limit(3)
        .sort({ addTime: -1 })
        .toArray();
      res.send(results);
      console.log(results);
    });

    //All services routes
    app.get("/services", async (req, res) => {
      const services = await serviceCollection
        .find({})
        .sort({ addTime: -1 })
        .toArray();
      res.send(services);
    });

    //find single service
    app.get("/services/:id", async (req, res) => {
      const { id } = req.params;

      const service = await serviceCollection.findOne({ _id: ObjectId(id) });
      res.send(service);
    });

    //Routes for Add service page
    app.post("/services", jwtVerify, async (req, res) => {
      const newService = req.body;
      const addService = await serviceCollection.insertOne(newService);
      res.send(addService);
    });

    //Reviews Routes
    app.get("/reviews/:id", async (req, res) => {
      const { id } = req.params;
      const results = await reviewCollection
        .find({ serviceId: id })
        .sort({ addTime: -1 })
        .toArray();
      res.send(results);
      console.log(results);
    });

    //Add review routes
    app.post("/reviews/", jwtVerify, async (req, res) => {
      const review = req.body;
      const newReview = await reviewCollection.insertOne(review);
      res.send(newReview);
    });

    //My review routes
    app.get("/my-reviews", jwtVerify, async (req, res) => {
      const email = req.query.email;
      const decoded = req.decoded;

      if (decoded.email !== email) {
        return res.status(403).send({ message: "Forbidden access" });
      }
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

    //Update review routes
    app.patch("/reviews/:id", jwtVerify, async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) };
      const { text } = req.body;
      const update = {
        $set: { userMessage: text },
      };
      const updateReview = await reviewCollection.updateOne(query, update);
      res.send(updateReview);
    });

    //Delete review routes
    app.delete("/reviews/:id", jwtVerify, async (req, res) => {
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
