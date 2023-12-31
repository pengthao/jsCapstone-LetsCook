require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { SERVER_PORT, rollBarAccessToken } = process.env;
const path = require("path");
let options = require("../server/controller");
const awsIP = "http://18.188.43.74:8080";

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "..", "public")));

const {
  getRecipes,
  getRecipeDetails,
  addToShoppingList,
  getList,
  removeFromShoppingList,
  removeFromShoppingList2,
} = require("./controller");

var Rollbar = require("rollbar");
var rollbar = new Rollbar({
  accessToken: rollBarAccessToken,
  captureUncaught: true,
  captureUnhandledRejections: true,
});
rollbar.log("Hello world!");

app.get("/", (req, res) => {
  // Send the index.html file located in the 'public' directory
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get(`/api/letscook/search/`, getRecipes);
app.get(`/api/letscook/recipe/`, getRecipeDetails);
app.get(`/api/letscook/list/`, getList);
app.post(`/api/letscook/ingredients/`, addToShoppingList);
app.delete(`/api/letscook/removeIngredient/:name`,removeFromShoppingList2);

app.listen(SERVER_PORT, () => console.log(`Order up on ${SERVER_PORT}`));
