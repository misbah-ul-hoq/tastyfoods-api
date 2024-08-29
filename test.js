const express = require("express");
const app = express();

const port = process.env.PORT || 3000;

const persons = [
  { id: 1, name: "misbah" },
  { id: 2, name: "person2" },
  { id: 3, name: "person3" },
  {id: 4, name: "test"}
];

app.get("/", (req, res) => {
  res.send("root route");
});

app.get("/api/persons", (req, res) => {
  res.send(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const result = persons.find((person) => person.id == req.params.id);
  if (!result) {
    res.status(404).send("Person not found");
  }
  res.send(result);
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
