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

module.exports = {options,
    getRecipes: async (req, res) => {
        const {query} = req.query
        try {
          const url = options.url
          options.params.query = query
          
          const response = await axios.request(options)
          res.status(200).send(response.data)

        } catch(error) {
          console.error("Error GETTING Recipes", error);
          res.sendStatus(500);
        }
    }
      }

/*       const testExternalAPI = async () => {
        const searchQuery = 'pizza%20sauce'; // Replace with your search query
      
        const url = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch?query=${searchQuery}`;
        
        const options = {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': '234de7bdfemshe7f4d54fa047779p1ead16jsnfb552bc06fcc',
            'X-RapidAPI-Host': "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com"
          }
        };
      
        try {
          const response = await fetch(url, options);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          console.log(data); // Output the retrieved data
        } catch (error) {
          console.error('Error:', error);
        }
      }; */
      
      // Call the function to test the API