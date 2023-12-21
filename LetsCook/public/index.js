
const searchBtn = document.getElementById('searchBtn')
const searchField = document.getElementById('searchField');
const recipeDiv = document.querySelector('.recipe-cards')
const baseURL = 'http://localhost:8080'

const errCallback = err => console.log(err.response.data)
const recipeCallback = ({ results: recipes }) => {
    console.log('Restructured Array:', recipes);
    displayRecipes(recipes);
  };
/*const getRecipes = (params) => {console.log('sending to axios') 
    return axios.get(`/letscook/api/search/${params}`).then(recipeCallback).catch(errCallback)}; 
*/
const getRecipes = async (params) => {
    try {
      console.log('sending to axios');
      const response = await axios.get(`${baseURL}/letscook/api/search`, {
        params: {
          query: params
        }
      });
      console.log(response.data)
      recipeCallback(response.data);
    } catch (error) {
      errCallback(error);
    }
  };

  const searchHandler = (e) => {
    e.preventDefault()
    let params = encodeURIComponent(searchField.value)
    console.log(`/letscook/api/search/${params}`);
    getRecipes(params).then(() => 
    console.log('Recipes fetched successfully!'));
}

const makeRecipeCard = (recipe) => {

    const recipeCard = document.createElement('div')
    recipeCard.classList.add('recipe-card') 
    recipeCard.setAttribute('data-id', recipe.id);
    
    recipeCard.innerHTML = 
    `
    <div class="recipe-card outline">
    <img src='${recipe.image}' alt='${recipe.title}' class="recipe-cover"/>
    <h3>${recipe.title}</h3>
    <button class="recipe-view-btn">View Recipe</button>
    </div>
    `;

    recipeDiv.appendChild(recipeCard);
};


function displayRecipes(arr) {
    recipeDiv.innerHTML = ``
    console.log(arr)
    for (let i = 0; i < arr.length; i++) {
        const restructuredRecipe = {
            id: arr[i].id,
            image: arr[i].image,
            title: arr[i].title
          };
          makeRecipeCard(restructuredRecipe);
    }
}
searchBtn.addEventListener('click', searchHandler)

