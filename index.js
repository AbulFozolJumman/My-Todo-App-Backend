const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 2024;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0ztfqf2.mongodb.net/?retryWrites=true&w=majority`;

// MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
});

async function run() {
  try {
    // DB collections
    const todosCollection = client.db("My-Todos-DB").collection("todos");

    // Todos CRUD
    // Get all todos
    app.get("/todos", async (req, res) => {
      let query = {};
      if (req.query.priority) {
        query.priority = req.query.priority;
      }
      const allTodos = await todosCollection.find(query).toArray();
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
      console.log(id);
      const todos = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          isCompleted: todos.isCompleted,
          title: todos.title,
          description: todos.description,
          priority: todos.priority,
        },
      };
      const options = { upsert: true };
      const result = await todosCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // Delete todo by Id
    app.delete("/todos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await todosCollection.deleteOne(query);
      res.send(result);
    });

    // Sending a ping to confirm a successful connection
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
