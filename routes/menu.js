import express from "express";

const menu = express.Router();

menu.get("/menu", async (req, res) => {
  const result = await menu.find().toArray();
  res.send(result);
});
