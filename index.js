import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  password: "chukwuemeligo1",
  port: 5432,
  database: "permalist"
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async (req, res) => {
  const listTitle = req.query.listTitle || "Today"; // Default to "Today"
  
  try {
    // Fetch items for the selected category
    const result = await db.query(
      "SELECT id, title, TO_CHAR(created_at, 'HH24:MI:SS') AS created_at FROM items WHERE category = $1 ORDER BY id ASC",
      [listTitle]
    );

    res.render("index.ejs", {
      listTitle: listTitle,
      listItems: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving items");
  }
});


app.post("/add", async (req, res) => {
  const { newItem, category } = req.body;

  try {
    await db.query(
      "INSERT INTO items (title, category, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)",
      [newItem, category]
    );
    res.redirect(`/?listTitle=${category}`); // Redirect back to the selected category
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding item");
  }
});



app.post("/edit", async (req, res) => {
  const { updatedItemId, updatedItemTitle } = req.body;

  try {
    await db.query(
      "UPDATE items SET title = $1 WHERE id = $2",
      [updatedItemTitle, updatedItemId]
    );
    res.redirect("/"); // Redirect to the current category (handled via `listTitle` query)
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating item");
  }
});


app.post("/delete", async (req, res) => {
  const { deleteItemId } = req.body;

  try {
    await db.query(
      "DELETE FROM items WHERE id = $1",
      [deleteItemId]
    );
    res.redirect("/"); // Redirect to the current category (handled via `listTitle` query)
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting item");
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
