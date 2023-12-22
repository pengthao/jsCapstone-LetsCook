const searchBtn = document.getElementById("searchBtn");
const searchField = document.getElementById("searchField");
const recipeDiv = document.querySelector(".recipe-cards");
const baseURL = "http://localhost:8080";

const errCallback = (err) => console.log(err.response.data);
const recipeCallback = ({ results: recipes }) => displayRecipes(recipes);

const searchHandler = (e) => {
  e.preventDefault();
  let params = searchField.value;
  console.log(`search handler params ${params}`);
  getRecipes(params).then(() => console.log("Recipes fetched successfully!"));
};

const getRecipes = async (params) => {
  try {
    console.log("sending to axios");
    const response = await axios.get(`${baseURL}/letscook/api/search`, {
      params: {
        query: params,
      },
    });
    console.log(`the response data ${response.data}`);
    recipeCallback(response.data);
  } catch (error) {
    errCallback(error, "getRecipes");
  }
};

const displayRecipes = (arr) => {
  recipeDiv.innerHTML = ``;
  console.log(arr);
  for (let i = 0; i < arr.length; i++) {
    const restructuredRecipe = {
      id: arr[i].id,
      image: arr[i].image,
      title: arr[i].title,
    };
    makeRecipeCard(restructuredRecipe);
  }
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
    const recipeId = recipeCard.getAttribute("data-id");
    fetchRecipeDetails(recipeId);
  });
  recipeDiv.appendChild(recipeCard);
};

const fetchRecipeDetails = async (recipeId) => {
  try {
    const response = await axios.get(`${baseURL}/letscook/api/recipe`, {
      params: {
        recipeId: recipeId,
      },
    });
    console.log(response.data);
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
  
  analyzedInstructions.forEach((instructionGroup) => {
    instructionGroup.steps.forEach((step, stepIndex) => {
      const listItem = document.createElement("li");
      listItem.textContent = `Step ${stepIndex + 1}: ${step.step}`;
      instructionsList.appendChild(listItem);
    });
  });
};

const renderIngredients = (extendedIngredients) => {
  const ingredientsList = document.getElementById("ingredientsList");

  extendedIngredients.forEach((ingredient) => {
    const listItem = document.createElement("li");
    listItem.id = ingredient.id
    listItem.innerHTML = `
        <b>${ingredient.name}</b>
        <br>
        ${ingredient.amount} - ${ingredient.unit}
    `;
    ingredientsList.appendChild(listItem);
  });
};

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
  newPopoverButton.setAttribute("data-bs-content", generatePopoverContent(extendedIngredients));
  newPopoverButton.innerHTML = "Add Ingredients"
  newPopoverButton.id = "popoverIngredients"

  return newPopoverButton;
};

const generatePopoverContent = (extendedIngredients) => {
    const popoverContainer = document.createElement('div');
    const popoverForm = document.createElement('form');
    const ingredientsList = document.createElement('ul');

    extendedIngredients.forEach((ingredient) => {
      const listItem = document.createElement('li');
      const label = document.createElement('label');

      label.classList.add('form-check-label');
      label.innerHTML = `
        <input type="checkbox" class="form-check-input" value="${ingredient.name}" checked>
        <b>${ingredient.name}</b> ${ingredient.amount} - ${ingredient.unit}
      `;
      listItem.appendChild(label);
      ingredientsList.appendChild(listItem);
    });

    const submitBtn = document.createElement('button');
    submitBtn.id = "popoverSubmit";
    submitBtn.type = "submit";
    submitBtn.classList.add("btn", "btn-primary");
    submitBtn.innerText = "Add Items";

    popoverForm.appendChild(ingredientsList);
    popoverForm.appendChild(submitBtn);
    popoverContainer.appendChild(popoverForm);

    return popoverContainer.innerHTML;
};

const showPopover = () => {
  const popover = new bootstrap.Popover(document.getElementById("popoverIngredients"), {
    sanitize: false,
    html: true,
  });
};

const initializePopoverCloseListener = () => {
  document.addEventListener('click', (event) => {
    const isInsidePopover = document.getElementById('popoverIngredients').contains(event.target);
    const isPopoverVisible = document.querySelector('.popover');
    const isCheckboxClicked = event.target.classList.contains('form-check-input');
  
    if (!isInsidePopover && isPopoverVisible && !isCheckboxClicked) {
      const popover = bootstrap.Popover.getInstance(document.getElementById('popoverIngredients'));
      popover.hide();
    }
  });
};

const showModal = () => {
  const modalButton = document.getElementById("ingredModal");
  modalButton.addEventListener("click", () => {
    const modal = new bootstrap.Modal(document.getElementById("exampleModal"));
    modal.show();
  });
};

searchBtn.addEventListener("click", searchHandler);