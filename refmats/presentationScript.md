
Hello, my name is Peng. I will be presenting my web application project currently titled: Let's Cook.

The primary purpose of this application is to search for recipes and save ingredients to a shopping list.

This application is hosted on AWS on the EC2 services using PM2 to serve up Node.JS for the app.

The code base for this project is written in html, css and javascript.

I created this app using axios and express to handle communications between my front end and my server. I use axios to connect my server to the external api, rapidApi's spoonacular for their recipes database

I also used PostgreS to sequelize information to and from my database. 

So here's how it works. You can submit a search for food like pizza for example. That query is passed to the server where it is configured properly and sent to the external api to return an array of recipe objects. That array of objects are rendered as these cards.

When you click the card it submits a request to the server, passing along the recipe id where it is configured and passed to the external api to return a single object with more details for that specific recipe.

So I used bootstrap framework for styling and liked this modal pop up card and animation. This however proved to be some of the most challenging aspects of this project. It was tough manipulating the data to slot in properly to the popover elements so I ended up pivoting to applying my functions to the modal element instead.

The recipe's title, duration to cook, servings, summary, ingredients and instructions are all rendered to this modal popup. 

In the ingredients section, we create checkboxes to select ingredients that you want to add to your shopping list. When you click the add items button, it collects the ids of the checked boxes and sends them to the server to sequelize those ingredients to our user_shopping_list table in our database.

When you go to the shopping list in navigation we call to the server to select all ingredients from our user_shopping_list table to display here alongside checkboxes. When you are ready, you can click the checkbox and it calls a delete function to remove these items from our database.

Thank you for taking a look at my application.


