require("dotenv").config();
const axios = require('axios')
const {CONNECTION_STRING, apiHost, apiKey} = process.env;
const Sequelize = require("sequelize");

const sequelize = new Sequelize(CONNECTION_STRING, {
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
});

let options = {
    method: 'GET',
    url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch',
    params: {
      query: '',
      cuisine: '',
      excludeCuisine: '',
      diet: '',
      intolerances: '',
      equipment: '',
      includeIngredients: '',
      excludeIngredients: '',
      type: '',
      instructionsRequired: 'true',
      fillIngredients: 'true',
      addRecipeInformation: 'false',
      tags: '',
      ignorePantry: 'true',
      sort: 'popularity',
      sortDirection: 'asc',
      offset: '1',
      number: '20',
      limitLicense: 'false',
      ranking: '2'
    },
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': apiHost
    }
  };

let optionsDetails =   {
  method: 'GET',
  url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/479101/information',
  headers: {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': apiHost
  }
};

module.exports = {options,
    getRecipes: async (req, res) => {
        const {query} = req.query
        console.log(`$getRecipe: ${query}`)
        try {
          const url = options.url
          options.params.query = query
          
          const response = await axios.request(options)
          res.status(200).send(response.data)

        } catch(error) {
          console.error("Error GETTING Recipes", error);
          res.sendStatus(500);
        }
    },
    getRecipeDetails: async (req, res) => {
      try {
        const { recipeId } = req.query;
        console.log(`$getRecipeDetails recipe id: {recipeId}`)
        if (recipeId !== undefined) { 
          const recipeString = recipeId.toString();
          const url = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${recipeString}/information`
          console.log(url)
          optionsDetails.url = url;
    
          const response = await axios.request(optionsDetails);
          res.status(200).send(response.data);
        } else {
          res.status(400).send("Query parameter is missing or undefined");
        }
      } catch(error) {
        console.error("Error GETTING Recipe Details", error);
        res.sendStatus(500);
      }
    }
};
