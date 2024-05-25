const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0ztfqf2.mongodb.net/?retryWrites=true&w=majority`;

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
    // DB collections
    const todosCollection = client.db("My-Todos-DB").collection("todos");

    // Todos CRUD
    // Get all todos
    app.get("/todos", async (req, res) => {
      const allTodos = await todosCollection.find().toArray();
      res.send(allTodos);
    });

    // Get todo by ID
    app.get("/todos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const todo = await todosCollection.findOne(query);
      res.send(todo);
    });

    // Add a todo
    app.post("/todos", async (req, res) => {
      const addedTodo = req.body;
      const result = await todosCollection.insertOne(addedTodo);
      res.send(result);
    });

    // Update todo by Id
    app.put("/todos/:id", async (req, res) => {
      const id = req.params.id;
      const updatedTodo = req.body;
      const query = { _id: new ObjectId(id) };

      try {
        const result = await todosCollection.updateOne(query, {
          $set: updatedTodo,
        });
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Todo not found" });
        }
        res.json(result);
      } catch (error) {
        console.error("Error updating todo:", error);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    // Delete todo by Id
    app.delete("/todos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await todosCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("My Todo app backend is running...");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
