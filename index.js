const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 6969;
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.b6wqjn1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    // Connect to the "insertDB" database and access its "coffee" collection
    const coffeeDB = client.db("coffeeDB");
    const coffeeCollection = coffeeDB.collection("coffee");

    // get all data
    app.get("/coffee", async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get single data
    app.get("/coffee-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });

    // store data
    app.post("/add-coffee", async (req, res) => {
      const newCoffeeDetails = req.body;
      // insert the defined document into the "coffee" collection
      const result = await coffeeCollection.insertOne(newCoffeeDetails);
      res.send(result);
    });

    // update single data
    app.put("/update-coffee-details/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCoffeeData = req.body;
      console.log(updatedCoffeeData);
      const updatedCoffee = {
        $set: {
          name: updatedCoffeeData.name,
          chef: updatedCoffeeData.chef,
          supplier: updatedCoffeeData.supplier,
          taste: updatedCoffeeData.taste,
          category: updatedCoffeeData.category,
          details: updatedCoffeeData.details,
          photo: updatedCoffeeData.photo,
        },
      };
      const result = await coffeeCollection.updateOne(
        filter,
        updatedCoffee,
        options
      );
      res.send(result);
    });

    // delete data
    app.delete("/coffee/remove/:id", async (req, res) => {
      const id = req.params.id;
      /* Delete the first document in the "coffeeDB" collection that matches
      the specified query document */
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
    // console.log(
    //   "Close your deployment. You successfully terminate connection to MongoDB!"
    // );
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("COFFEE STORE ESPRESSO EMPORIUM SERVER IS RUNNING");
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
