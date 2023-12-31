const homeBtn = document.getElementById("homeBtn");
const searchRecipeNav = document.getElementById("searchRecipeNav");
const searchBtn = document.getElementById("searchBtn");

const shoppingList = document.getElementById("shoppingList");
const welcomeHome = document.getElementById("welcomeHome");
const shoppingListBtn = document.getElementById("shoppingList-btn");
const recipeCards = document.querySelector(".recipe-card");
const recipeCardContainer = document.querySelector(".recipe-cards-container");
const homeDiv = document.querySelector(".col py-3");
let checkboxIdCounter = 0;

const baseURL = "http://localhost:8080";
const awsIP = "http://18.188.43.74:8080/";

const errCallback = (err, origin) => {
  if (err.response) {
    console.log(err.response.data);
  } else {
    console.error(`Error occurred in ${origin}:`, err);
  }
};

//Nav Functions Hide//

const hideshoppingList = () => {
  if (shoppingList) {
    shoppingList.innerHTML = "";
  }
};

const hideWelcome = () => {
  const welcomeImg  = document.querySelectorAll(".welcomeImg ");
  if (welcomeImg ) {
    welcomeImg .forEach((img) => {
      img.style.display = "none";
    });
  }
};

const hideRecipeCards = () => {
  const recipeCards = document.querySelectorAll(".recipe-card");
  if (recipeCards) {
    recipeCards.forEach((card) => {
      card.style.display = "none";
    });
  }
};

const showRecipeCards = () => {
  const recipeCards = document.querySelectorAll(".recipe-card");
  if (recipeCards.length > 0) {
    recipeCards.forEach((card) => {
      card.style.display = "block";
    });
  }
};

// Display Home //

const displayHome = async () => {
  if(welcomeHome) {
    welcomeHome.style.display = "block";
  } renderWelcome()
}

const renderWelcome = () => {
  welcomeHome.innerHTML = `<img src="https://i.ytimg.com/vi/b9pGR3O4z1M/maxresdefault.jpg" class="welcomeImg"/>`
} 

// Display Shopping List //

const renderList = async () => {
  try {
    const response = await axios.get(`${awsIP}api/letscook/list/`);
    const ingredients = response.data;
    console.log(ingredients)
    const fragment = document.createDocumentFragment();

    ingredients.forEach((ingredient) => {
      const listItem = document.createElement("li");
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      //apply properties to checkboxes for extraction later//
          checkbox.type = "checkbox";
          checkbox.classList.add("form-check-input");
          checkbox.classList.add(".bg-info");
          checkbox.classList.add("m-2");
          checkbox.id = `${ingredient.item_name}_${checkboxIdCounter++}`;
          checkbox.name = ingredient.item_name;
          checkbox.value = ingredient.item_name;
          checkbox.checked = false;

      label.classList.add("form-check-label");
      label.innerHTML = `
        <b>${ingredient.item_name}</b>
      `;
      checkbox.addEventListener("click", () => {
        deleteListItem(checkbox.value);
      });

      listItem.appendChild(checkbox);
      listItem.appendChild(label);
      fragment.appendChild(listItem);
    });

    shoppingList.innerHTML = `<h4 class="listHeader">Shopping List</h4>`;
    shoppingList.appendChild(fragment);

  } catch (error) {
    console.error("Error fetching list:", error);
  }
};


const deleteListItem = (name) => {
  const decodedName = decodeURIComponent(name);
console.log(name)
console.log(decodedName)
  axios.delete(`${awsIP}api/letscook/removeIngredient/${decodedName}`)
  .then(() => {
    alert(`Ingredient has been removed to your shopping list!`);
    renderList()
  })
  .catch((error) => {
    console.error('Error removing ingredients:', error);
  });
}



//Search External API to make recipe cards //

/*search handler is fed from a click event from the searchBtn feeding in searchField data as params*/ 

const searchHandler = async (e) => {
  e.preventDefault();
  const searchField = document.getElementById("searchField");
  const params = searchField.value;
  try {
    const response = await axios.get(`${awsIP}api/letscook/search/`, {
      params: { query: params },
    });
    renderRecipeCards(response.data.results);
    searchField.value = "";
  } catch (error) {
    errCallback(error, "getRecipes");
  }
};

/* response data is the spoonacular api's get search recipe results: an array of objects
  id: 
  title:
  image:
  imageType:
  nutrition: {}
*/

const renderRecipeCards = (recipes) => {
//page prep//  
  hideWelcome();
  hideshoppingList();

//setup//
  const fragment = document.createDocumentFragment();
  const rowDiv = document.createElement("div");
  rowDiv.classList.add("row", "row-cols-5");
//loop recipe array makeRecipeCardFunction)//
  recipes.forEach((recipe) => {
    const recipeCard = makeRecipeCard(recipe);
    rowDiv.appendChild(recipeCard);
  });
//attach to div to display//
  fragment.appendChild(rowDiv);
  recipeCardContainer.innerHTML = "";
  recipeCardContainer.appendChild(fragment);
};

const makeRecipeCard = (recipe) => {
//setup//
  const recipeCard = document.createElement("div");
  recipeCard.classList.add("recipe-card");
  recipeCard.setAttribute("data-id", recipe.id);
//extract recipe object information and insert to recipeCard//
  recipeCard.innerHTML = `
    <div class="recipe-card outline col m-1 pt-2btn btn-info view-recipe-btn .text-right" data-bs-toggle="modal" data-bs-target="#recipeModal">
    <img src='${recipe.image}' alt='${recipe.title}' class="recipe-cover mx-auto d-block recipeImg"/>
    <br>
    <p class="text-center">${recipe.title}</p>
    </div>
    `;
//apply event listener for each card specific to this recipe id//
  recipeCard.addEventListener("click", () => {
    fetchRecipeDetails(recipe.id);
  });

  return recipeCard;
};

// Modal - Recipe Details //


const fetchRecipeDetails = async (recipeId) => {
  try {
    const response = await axios.get(`${awsIP}api/letscook/recipe/`, {
      params: { recipeId: recipeId },
    });
    displayRecipeDetails(response.data);
  } catch (error) {
    errCallback(error, "fetchRecipeDetails");
  }
};

/* response data is the spoonacular api's get recipe information results: an array of objects
  id: 
  title:
  image:
  extendedIngredients: {
        id:
        aisle:
        image:
        name:
        units:

  ~additional if needed~
  }
*/

const displayRecipeDetails = (recipeDetails) => {
  renderRecipeInfo(recipeDetails);
  renderInstructions(recipeDetails.analyzedInstructions);
  renderIngredients(recipeDetails.extendedIngredients);
};

const renderRecipeInfo = (recipeDetails) => {
  const modalContent = document.getElementById("recipeDetailsContent");
  modalContent.innerHTML = `
  <div class="imageContainer bg-light">
  <img src="${recipeDetails.image}" class="rounded" alt="${recipeDetails.title}" style="max-width: 100%; height: auto;"/>

  <h2>${recipeDetails.title}</h2>

    <p>Ready in ${recipeDetails.readyInMinutes} minutes</p>

    <p>Servings: ${recipeDetails.servings}</p>

    <p>Summary: ${recipeDetails.summary}</p>


    </div>
    <div id="ingredientsContainer bg-light">
      <h3>Ingredients</h3>
      <ul id="ingredientsList"></ul>
    </div>
    <div id="instructionsContainer bg-light">
    <h2>Instructions</h2>
    <ul id="instructionsList"></ul>
    </div>


  `;
};

const renderInstructions = (analyzedInstructions) => {
  const instructionsList = document.getElementById("instructionsList");
  const fragment = document.createDocumentFragment();

  analyzedInstructions.forEach((instructionGroup) => {
    instructionGroup.steps.forEach((step, stepIndex) => {
      const listItem = document.createElement("li");
      listItem.textContent = `Step ${stepIndex + 1}: ${step.step}`;
      fragment.appendChild(listItem);
    });
  });
  instructionsList.innerHTML = "";
  instructionsList.appendChild(fragment);
};



const renderIngredients = (extendedIngredients) => {
//setup//
  const ingredientsList = document.getElementById("ingredientsList");
  const fragment = document.createDocumentFragment();

  extendedIngredients.forEach((ingredient) => {
    const listItem = document.createElement("li");
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
//apply properties to checkboxes for extraction later//
    checkbox.type = "checkbox";
    checkbox.classList.add("form-check-input");
    checkbox.classList.add(".bg-info");
    checkbox.classList.add("m-2");
    checkbox.id = `${ingredient.id}_${checkboxIdCounter++}`;
    checkbox.name = ingredient.name;
    checkbox.value = ingredient.name;
    checkbox.checked = true;

    label.classList.add("form-check-label");
    label.htmlFor = ingredient.id;
    label.innerHTML = `
      <b>${ingredient.name}</b> ${ingredient.amount} - ${ingredient.unit}
    `;

    listItem.appendChild(checkbox);
    listItem.appendChild(label);
    fragment.appendChild(listItem);
  });

  ingredientsList.innerHTML = "";
  ingredientsList.appendChild(fragment);

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.classList.add("btn", "btn-info", "subBtn");
  addBtn.innerText = "Add Items";
  addBtn.id = "subBtn";
  ingredientsList.appendChild(addBtn);
  addBtn.addEventListener("click", () => {
    handleButtonClick(extendedIngredients);
  });
};

const handleButtonClick = (extendedIngredients) => {
  const checkedInputs = Array.from(
    document.querySelectorAll('#ingredientsContainer input[type="checkbox"]:checked')
  );

  const selectedIngredients = checkedInputs
    .map((input) => {
      const parts = input.id.split("_");
      if (parts.length >= 2) {
        return parseInt(parts[0]);
      }
      return null;
    })
    .filter((id) => id !== null);

  addIngredientsToList(extendedIngredients, selectedIngredients);
};

//Add ingredients to shopping list//

const addIngredientsToList = (extendedIngredients, selectedIngredients) => {
  const selectedIngredientsNumbers = selectedIngredients.map((str) =>
    parseInt(str, 10)
  );

  const idMap = new Map();
  extendedIngredients.forEach((ingredient) => {
    idMap.set(ingredient.id, ingredient);
  });

  const selectedIngredientsId = selectedIngredientsNumbers
    .map((id) => idMap.get(id))
    .filter(Boolean);

  const selectedIngredientsArray = Array.from(selectedIngredientsId.values());

  axios
    .post(`${awsIP}api/letscook/ingredients/`, selectedIngredientsArray)
    .then(() => {
      alert(`Ingredients have been added to your shopping list!`);
    });
};

//load front page on start//
document.addEventListener("DOMContentLoaded", () => {
  displayHome();
});

//nav button listeners//
homeBtn.addEventListener("click", () => {
  hideRecipeCards();
  hideshoppingList();
  displayHome();
});
shoppingListBtn.addEventListener("click", () => {
  hideWelcome();
  hideRecipeCards();
  renderList();
});
searchRecipeNav.addEventListener("click", () => {
  hideshoppingList();
  hideWelcome();
  showRecipeCards();
});
//search button listener/
searchBtn.addEventListener("click", searchHandler);
