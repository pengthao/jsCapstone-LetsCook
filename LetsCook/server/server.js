require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { SERVER_PORT } = process.env;
const path = require("path");

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "..", "public")));

const {
  getRecipes,
  getRecipeDetails,
  addToShoppingList,
  getList,
  removeFromShoppingList,
} = require("./controller");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get(`/api/letscook/search/`, getRecipes);
app.get(`/api/letscook/recipe/`, getRecipeDetails);
app.get(`/api/letscook/list/`, getList);
app.post(`/api/letscook/ingredients/`, addToShoppingList);
app.delete(`/api/letscook/removeIngredient/:name`,removeFromShoppingList);

app.listen(SERVER_PORT, () => console.log(`Order up on ${SERVER_PORT}`));
