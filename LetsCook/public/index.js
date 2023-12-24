const searchBtn = document.getElementById("searchBtn");
const searchField = document.getElementById("searchField");
const recipeDiv = document.querySelector(".recipe-cards");


const errCallback = (err, origin) => {
  if (err.response) {
    console.log(err.response.data);
  } else {
    console.error(`Error occurred in ${origin}:`, err);
  }
};

//Search External API//

const recipeCallback = ({ results: recipes }) => displayRecipes(recipes);

const searchHandler = (e) => {
  e.preventDefault();
  let params = searchField.value;
  getRecipes(params).then(() => console.log("Recipes fetched successfully!"));
};

const getRecipes = async (params) => {
  try {
    const response = await axios.get(`/letscook/api/search`, {
      params: {
        query: params,
      },
    });
    recipeCallback(response.data);
  } catch (error) {
    errCallback(error, "getRecipes");
  }
};

const displayRecipes = (arr) => {
  const fragment = document.createDocumentFragment();

  arr.forEach((recipe) => {
    fragment.appendChild(makeRecipeCard(recipe));
  });

  recipeDiv.innerHTML = "";
  recipeDiv.appendChild(fragment);
};

const makeRecipeCard = (recipe) => {
  const recipeCard = document.createElement("div");
  recipeCard.classList.add("recipe-card");
  recipeCard.setAttribute("data-id", recipe.id);

  recipeCard.innerHTML = `
    <div class="recipe-card outline">
    <img src='${recipe.image}' alt='${recipe.title}' class="recipe-cover"/>
    <br>
    <p>${recipe.title}</p>
    <button type="button" class="btn btn-primary view-recipe-btn" data-bs-toggle="modal" data-bs-target="#exampleModal">
    View Recipe
    </button>
    </div>
    `;

  const viewRecipeBtn = recipeCard.querySelector(".view-recipe-btn");
  viewRecipeBtn.addEventListener("click", () => {
    fetchRecipeDetails(recipe.id);
  });

  return recipeCard;
};

//Recipe Details Modal//

const fetchRecipeDetails = async (recipeId) => {
  try {
    const response = await axios.get(`/letscook/api/recipe`, {
      params: {
        recipeId: recipeId,
      },
    });
    displayRecipeDetails(response.data);
  } catch (error) {
    errCallback(error, "fetchRecipeDetails");
  }
};

const displayRecipeDetails = (recipeDetails) => {
  renderRecipeInfo(recipeDetails);
  renderIngredients(recipeDetails.extendedIngredients);
  renderInstructions(recipeDetails.analyzedInstructions);
  initializePopover(recipeDetails.extendedIngredients);
  initializePopoverCloseListener();
  showModal();
};

const renderRecipeInfo = (recipeDetails) => {
  const modalContent = document.getElementById("recipeDetailsContent");
  modalContent.innerHTML = `
  <img src="${recipeDetails.image}" alt="${recipeDetails.title}" style="max-width: 100%; height: auto;" />
    <h2>${recipeDetails.title}</h2>
    <p1>Ready in ${recipeDetails.readyInMinutes} minutes</p1>
    <br>
    <p1>Servings: ${recipeDetails.servings}</p1>
    <br>
    <p1>Summary: ${recipeDetails.summary}</p1>
    <br>
    <br>
    <div id="ingredientsContainer">
      <h3>Ingredients</h3>
      <ul id="ingredientsList"></ul>
    </div>
    <div id="instructionsContainer">
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
  const ingredientsList = document.getElementById("ingredientsList");
  const fragment = document.createDocumentFragment();

  extendedIngredients.forEach((ingredient) => {
    const listItem = document.createElement("li");
    listItem.id = ingredient.id;
    listItem.innerHTML = `
        <b>${ingredient.name}</b>
        <br>
        ${ingredient.amount} - ${ingredient.unit}
    `;
    fragment.appendChild(listItem);
  });

  ingredientsList.innerHTML = "";
  ingredientsList.appendChild(fragment);
};

//Popover Ingredients List//

const initializePopover = (extendedIngredients) => {
  const newPopoverButton = createPopoverButton(extendedIngredients);
  newPopoverButton.addEventListener("click", showPopover);
  document.getElementById("ingredientsContainer").appendChild(newPopoverButton);
};

const createPopoverButton = (extendedIngredients) => {
  const newPopoverButton = document.createElement("button");
  newPopoverButton.classList.add("btn", "btn-secondary");
  newPopoverButton.setAttribute("data-bs-toggle", "popover");
  newPopoverButton.setAttribute("title", "Shopping list");
  newPopoverButton.innerHTML = "Add Ingredients";
  newPopoverButton.id = "popoverIngredients";
  newPopoverButton.setAttribute(
    "data-bs-content",
    generatePopoverContent(extendedIngredients)
  );

  return newPopoverButton;
};

const generatePopoverContent = (extendedIngredients) => {
  const popoverContainer = document.createElement("div");
  const ingredientsList = document.createElement("ul");
  const fragment = document.createDocumentFragment();
  ingredientsList.id = "ingredientShoppingList";
  popoverContainer.id = "popoverContainer";

  extendedIngredients.forEach((ingredient) => {
    const listItem = document.createElement("li");
    const label = document.createElement("label");
    const checkboxId = ingredient.id;

    listItem.id = ingredient.id;
    label.classList.add("form-check-label");
    label.innerHTML = `
    <input type="checkbox" class="form-check-input" id="${checkboxId}" name="${ingredient.name}" value="${ingredient.name}" checked>
    <b>${ingredient.name}</b> ${ingredient.amount} - ${ingredient.unit}
    `;
    listItem.appendChild(label);
    fragment.appendChild(listItem);
  });

  ingredientsList.appendChild(fragment);
  popoverContainer.appendChild(ingredientsList);

  const submitBtn = document.createElement("button");
  submitBtn.type = "button";
  submitBtn.classList.add("btn", "btn-primary", "subBtn");
  submitBtn.innerText = "Add Items";
  submitBtn.id = "subBtn";

  popoverContainer.appendChild(submitBtn);

  const handleButtonClick = () => {
    const checkedInputs = Array.from(
      document.querySelectorAll('input[type="checkbox"]:checked')
    );
    const selectedIngredients = checkedInputs.map((input) => {
      return input.id;
    });
    addIngredientsToList(extendedIngredients, selectedIngredients);
  };

  setTimeout(() => {
    const submitBtn = document.getElementById("subBtn");
    if (submitBtn) {
      console.log("Button is present in the DOM");
      submitBtn.addEventListener("click", handleButtonClick);
    } else {
      console.log("Button is NOT present in the DOM");
    }
  }, 10000);
  return popoverContainer.innerHTML;
};

const showPopover = () => {
  const popover = new bootstrap.Popover(
    document.getElementById("popoverIngredients"),
    {
      sanitize: false,
      html: true,
    }
  );
};

const initializePopoverCloseListener = () => {
  document.addEventListener("click", (event) => {
    const isInsidePopover = document
      .getElementById("popoverIngredients")
      .contains(event.target);
    const isPopoverVisible = document.querySelector(".popover");
    const isCheckboxClicked =
      event.target.classList.contains("form-check-input");

    if (!isInsidePopover && isPopoverVisible && !isCheckboxClicked) {
      const popover = bootstrap.Popover.getInstance(
        document.getElementById("popoverIngredients")
      );
      popover.hide();
    }
  });
};

const showModal = () => {
  const modalButton = document.getElementById("exampleModal");
  modalButton.addEventListener("click", () => {
    const modal = new bootstrap.Modal(document.getElementById("exampleModal"));
    modal.show();
  });
};

//Add ingredients to shopping list//

const addIngredientsToList = (extendedIngredients, selectedIngredients) => {
  const idMap = new Map();
  extendedIngredients.forEach((ingredient) => {
    idMap.set(ingredient.id, ingredient);
  });

  const selectedIngredientsId = selectedIngredients
    .map((id) => idMap.get(id))
    .filter(Boolean);

  const selectedIngredientsArray = Array.from(idMap.values());

  axios
    .post(`/letscook/api/ingredients`, selectedIngredientsArray)
    .then(() => {
      alert(`Ingredients have been added to your shopping list!`);
    });
};

searchBtn.addEventListener("click", searchHandler);
