const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 8080;
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

// middlewares
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5dbzkti.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const menu = client.db("tastyFoodsDb").collection("menu");
    const reviews = client.db("tastyFoodsDb").collection("reviews");
    const carts = client.db("tastyFoodsDb").collection("carts");
    const users = client.db("tastyFoodsDb").collection("users");

    // token generation
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "2h",
      });
      res.send({ token });
    });

    app.get("/menu", async (req, res) => {
      const result = await menu.find().toArray();
      res.send(result);
    });

    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const result = await carts.find(query).toArray();
      res.send(result);
    });

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carts.deleteOne(query);
      res.send(result);
    });

    app.post("/carts", async (req, res) => {
      const cart = req.body;
      const result = await carts.insertOne(cart);
      res.send(result);
    });

    // token verify middlewear function
    const verifyToken = (req, res, next) => {
      const token = req.headers.authorization;

      if (!token) {
        return res.status(401).send({ message: "Unauthorized access" });
      }

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "something went wrong" });
        }
        req.decoded = decoded;
        next();
      });
    };

    app.get("/users", verifyToken, async (req, res) => {
      // console.log(req.decoded);
      const result = await users.find().toArray();
      res.send(result);
    });

    app.get("/user", verifyToken, async (req, res) => {
      const email = req.query.email;
      console.log("inside user get function", req.decoded);
      if (email != req.decoded.email) {
        return res.status(401).send({ message: "unauthorized access" });
      }
      const query = { email };
      const result = await users.findOne(query);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const userExists = await users.findOne(query);
      if (userExists) {
        return res.status(401).send({ message: "user already exists" });
      }

      const result = users.insertOne(user);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const result = await reviews.find().toArray();
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (e) {}
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Restaurant server is running ");
});

app.listen(port, () => {
  console.log(`server started at port http://localhost:${port}`);
});
