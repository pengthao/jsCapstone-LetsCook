require("dotenv").config();
const axios = require("axios");
const { CONNECTION_STRING, apiHost, apiKey } = process.env;
const Sequelize = require("sequelize");

const sequelize = new Sequelize(CONNECTION_STRING, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

let options = {
  method: "GET",
  url: "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch",
  params: {
    query: "",
    cuisine: "",
    excludeCuisine: "",
    diet: "",
    intolerances: "",
    equipment: "",
    includeIngredients: "",
    excludeIngredients: "",
    type: "",
    instructionsRequired: "true",
    fillIngredients: "true",
    addRecipeInformation: "false",
    tags: "",
    ignorePantry: "true",
    sort: "popularity",
    sortDirection: "asc",
    offset: "1",
    number: "20",
    limitLicense: "false",
    ranking: "2",
  },
  headers: {
    "X-RapidAPI-Key": apiKey,
    "X-RapidAPI-Host": apiHost,
  },
};

let optionsDetails = {
  method: "GET",
  url: "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/479101/information",
  headers: {
    "X-RapidAPI-Key": apiKey,
    "X-RapidAPI-Host": apiHost,
  },
};

module.exports = {
  options,
  getRecipes: async (req, res) => {
    const { query } = req.query;
    try {
      const url = options.url;
      options.params.query = query;

      const response = await axios.request(options);
      res.status(200).send(response.data);
    } catch (error) {
      console.error("Error GETTING Recipes", error);
      res.sendStatus(500);
    }
  },
  getRecipeDetails: async (req, res) => {
    try {
      const { recipeId } = req.query;
      if (recipeId !== undefined) {
        const recipeString = recipeId.toString();
        const url = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${recipeString}/information`;
        optionsDetails.url = url;

        const response = await axios.request(optionsDetails);
        res.status(200).send(response.data);
      } else {
        res.status(400).send("Query parameter is missing or undefined");
      }
    } catch (error) {
      console.error("Error GETTING Recipe Details", error);
      res.sendStatus(500);
    }
  },
  addToShoppingList: (req, res) => {
    sequelize
      .transaction((t) => {
        const selectedIngredients = req.body;

        const promises = selectedIngredients.map((ingredient) => {
          const { id, name, amount, unit, image, aisle } = ingredient;
          return sequelize
            .query(`SELECT * FROM ingredients WHERE id = ${id}`, {
              transaction: t,
            })
            .then((ingredientExists) => {
              const ingredientInfo = ingredientExists[0][0];
              if (ingredientInfo) {
                return sequelize
                  .query(
                    `SELECT * FROM user_shopping_list WHERE item_id = ${id} AND unit = '${unit}'`,
                    { transaction: t }
                  )
                  .then((dbResult) => {
                    const listItemExists = dbResult[0][0];

                    if (listItemExists) {
                      return sequelize.query(
                        ` UPDATE user_shopping_list SET quantity = user_shopping_list.quantity + ${amount} where item_id = ${id} AND unit = '${unit}'`,
                        { transaction: t }
                      );
                    } else {
                      return sequelize.query(
                        `INSERT INTO user_shopping_list(item_id, item_name, quantity, unit, item_img) VALUES (${id}, '${name}', ${amount}, '${unit}', '${image}')`,
                        { transaction: t }
                      );
                    }
                  });
              } else {
                return sequelize
                  .query(
                    `INSERT INTO ingredients (id, name, type) VALUES (${id}, '${name}', '${aisle}')`,
                    { transaction: t }
                  )
                  .then(() => {
                    return sequelize.query(
                      `INSERT INTO user_shopping_list(item_id, item_name, quantity, unit, item_img) VALUES (${id}, '${name}', ${amount}, '${unit}', '${image}')`,
                      { transaction: t }
                    );
                  });
              }
            })
            .catch((err) => {
              throw err;
            });
        });

        return Promise.all(promises);
      })
      .then(() => {
        res.sendStatus(200);
      })
      .catch((err) => {
        console.log(err, "add to shopping list");
        res.sendStatus(500);
      });
  },
  getList: (req, res) => {
      sequelize.query(`SELECT 
        item_id,
        item_name,
        quantity,
        unit
        FROM user_shopping_list
        Order by item_name asc;`)
    .then((dbResult) => {
        res.status(200).send(dbResult[0]);
    })
    .catch((err) => console.log(err));
  },
};
