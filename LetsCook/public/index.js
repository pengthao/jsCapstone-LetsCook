const homeClick = document.getElementById("homeClick");
const homeList = document.getElementById("homeList");
const shoppingList = document.getElementById("shoppingList");
const recipeDiv = document.querySelector(".recipe-cards");

const searchRecipeClick = document.getElementById("recipeSearchClick");
const searchDiv = document.querySelector(".searchDiv");
const homeDiv = document.querySelector(".col py-3");
const baseURL = "http://localhost:8080";
const awsIP = "http://18.188.43.74:8080";
//add / to index.js and styles.css files
const errCallback = (err, origin) => {
  if (err.response) {
    console.log(err.response.data);
  } else {
    console.error(`Error occurred in ${origin}:`, err);
  }
};

const clearHomeList = () => homeList.innerHTML="";
const clearRecipeCard = () => recipeDiv.innerHTML="";
const clearSearchDiv = () => searchDiv.innerHTML="";

// Display SearchBar

const displaySearch = () => {
  clearHomeList()

  searchDiv.innerHTML = `
  <form class="b-flex" role="search">
  <input
    class="form-inline ds-input search-form searchBox"
    type="search"
    placeholder="Search Recipe"
    aria-label="Search"
    id="searchField"
  />
  <button
    class="btn btn-secondary"
    type="submit"
    id="searchBtn"
  >
    Search
  </button>
</form>
  `
  const searchBtn = document.getElementById("searchBtn");
  searchBtn.addEventListener("click", searchHandler);
}
// Display Home //


const displayHome = async () => {
  await renderList()
}


const renderList = async () => {

  try {
    const response = await axios.get(`${awsIP}/letscook/api/list/`);
    const ingredients = response.data; 
    const fragment = document.createDocumentFragment();
    
    ingredients.forEach((ingredient) => {
      const listItem = document.createElement("li");
      const label = document.createElement("label");

      label.classList.add("form-check-label");
      label.innerHTML = `
        <b>${ingredient.item_name}</b> ${ingredient.quantity} - ${ingredient.unit}
      `;

      listItem.appendChild(label);
      fragment.appendChild(listItem);
    });

    
    homeList.innerHTML = `<h4>Shopping List</h4>`;
    homeList.appendChild(fragment);
  } catch (error) {
    console.error("Error fetching list:", error);
  }
};


//Search External API//

const searchHandler = async (e) => {
  e.preventDefault();
  const searchField = document.getElementById("searchField");
  const params = searchField.value;
  try {
    const response = await axios.get(`${awsIP}/letscook/api/search/`, {
      params: { query: params },
    });
    renderRecipes(response.data.results);
  } catch (error) {
    errCallback(error, "getRecipes");
  }
};

const renderRecipes = (recipes) => {
  const fragment = document.createDocumentFragment();
  const rowDiv = document.createElement("div");
  rowDiv.classList.add("row", "row-cols-5");

  recipes.forEach((recipe) => {
    const recipeCard = makeRecipeCard(recipe);
    rowDiv.appendChild(recipeCard);
  });

  fragment.appendChild(rowDiv);
  recipeDiv.innerHTML = "";
  recipeDiv.appendChild(fragment);
};

const makeRecipeCard = (recipe) => {
  clearHomeList()
  const recipeCard = document.createElement("div");
  recipeCard.classList.add("recipe-card");
  recipeCard.setAttribute("data-id", recipe.id);

  recipeCard.innerHTML = `
    <div class="recipe-card outline col m-1 pt-2btn btn-info view-recipe-btn .text-right" data-bs-toggle="modal" data-bs-target="#recipeModal">
    <img src='${recipe.image}' alt='${recipe.title}' class="recipe-cover mx-auto d-block recipeImg"/>
    <br>
    <p class="text-center">${recipe.title}</p>
    </div>
    `;

  recipeCard.addEventListener("click", () => {
    fetchRecipeDetails(recipe.id);
  });

  return recipeCard;
};

//Recipe Details Modal//

const fetchRecipeDetails = async (recipeId) => {
  try {
    const response = await axios.get(`${awsIP}/letscook/api/recipe/`, {
      params: { recipeId: recipeId },
    });
    displayRecipeDetails(response.data);
  } catch (error) {
    errCallback(error, "fetchRecipeDetails");
  }
};

const displayRecipeDetails = (recipeDetails) => {
  renderRecipeInfo(recipeDetails);
  renderInstructions(recipeDetails.analyzedInstructions);
  renderIngredients(recipeDetails.extendedIngredients);
};

const renderRecipeInfo = (recipeDetails) => {
  const modalContent = document.getElementById("recipeDetailsContent");
  modalContent.innerHTML = `
  <div class=".bg-light">
  <img src="${recipeDetails.image}" class="rounded" alt="${recipeDetails.title}" style="max-width: 100%; height: auto;"/>

  <h2>${recipeDetails.title}</h2>

    <p>Ready in ${recipeDetails.readyInMinutes} minutes</p>
    <br>
    <p>Servings: ${recipeDetails.servings}</p>
    <br>
    <p>Summary: ${recipeDetails.summary}</p>
    <br>
    <br>
    </div>
    <div id="ingredientsContainer .bg-light">
      <h3>Ingredients</h3>
      <ul id="ingredientsList"></ul>
    </div>
    <div id="instructionsContainer .bg-light">
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

let checkboxIdCounter = 0;

const renderIngredients = (extendedIngredients) => {
  const ingredientsList = document.getElementById("ingredientsList");
  const fragment = document.createDocumentFragment();

  extendedIngredients.forEach((ingredient) => {
    const listItem = document.createElement("li");
    const label = document.createElement("label");
    const checkbox = document.createElement("input");

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
    document.querySelectorAll('input[type="checkbox"]:checked')
  );

  console.log(`type for extendedIngred`)
  for (const [key, value] of checkedInputs.entries()) {
    console.log(key, value, typeof value);
  }

  const selectedIngredients = checkedInputs.map((input) => {
    const parts = input.id.split('_');
    if (parts.length >= 2) {
      return parseInt(parts[0]);
    }
    return null; 
  }).filter((id) => id !== null);

  console.log(selectedIngredients)

  addIngredientsToList(extendedIngredients, selectedIngredients);

};

//Add ingredients to shopping list//

const addIngredientsToList = (extendedIngredients, selectedIngredients) => {

  const selectedIngredientsNumbers = selectedIngredients.map((str) => parseInt(str, 10));

  console.log(`type for extendedIngred`)
  for (const [key, value] of extendedIngredients.entries()) {
    console.log(key, value, typeof value);
  }
  console.log(`type for selectedIngred Id`)
  for (const [key, value] of selectedIngredients.entries()) {
    console.log(key, value, typeof value);
  }
  const idMap = new Map();
  extendedIngredients.forEach((ingredient) => {
    idMap.set(ingredient.id, ingredient);
  });
  console.log(`type for idmap Id`)
  for (const [key, value] of idMap.entries()) {
    console.log(key, value, typeof value);
  }

  const selectedIngredientsId = selectedIngredientsNumbers
    .map((id) => idMap.get(id))
    .filter(Boolean);

    console.log(`type for selectedIngredientsId`)
    for (const [key, value] of selectedIngredientsId.entries()) {
      console.log(key, value, typeof value);
    }
    
  const selectedIngredientsArray = Array.from(selectedIngredientsId.values());

  console.log(`type for selectedInselectedIngredientsArraygredientsId`)
  selectedIngredientsArray.forEach((value, index) => {
    console.log(index, value, typeof value);
  });

  axios
    .post(`${awsIP}/letscook/api/ingredients/`, selectedIngredientsArray)
    .then(() => {
      alert(`Ingredients have been added to your shopping list!`);
    });
};


homeClick.addEventListener("click",  () => {
  displayHome()
  clearRecipeCard()
  clearSearchDiv()
});
shoppingList.addEventListener("click",  () => {
  displayHome()
  clearRecipeCard()
  clearSearchDiv()
});
document.addEventListener("DOMContentLoaded", () => {
  displayHome()
});
searchRecipeClick.addEventListener("click",  () => {
  displaySearch()
  clearRecipeCard()
});