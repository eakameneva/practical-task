const input = document.querySelector("input");
const container = document.querySelector(".container");
let savedIds = [];
const resultsList = document.createElement("ul");
resultsList.classList.add("resultsList");
container.append(resultsList);
const savedResultsList = document.createElement("ul");
savedResultsList.classList.add("savedResultsList");
container.append(savedResultsList);

function searchRepositories(value) {
  const trimmedValue = value.trim();
  if (trimmedValue === "") {
    resultsList.textContent = "";
    return;
  }
  fetch(
    `https://api.github.com/search/repositories?q=${trimmedValue}&per_page=5`
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else throw new Error("The response was not ok");
    })
    .then((result) => {
      if (result.total_count === 0) {
        const nothingFound = document.createElement("div");
        nothingFound.textContent = "No results";
        resultsList.textContent = "";
        resultsList.append(nothingFound);
        return;
      }
      //here we have an array 'items' that consists of 5 obj
      resultsList.textContent = "";
      result.items.forEach(function (obj) {
        const option = document.createElement("li");
        option.textContent = obj.name;
        option.dataset.owner = obj.owner.login;
        option.dataset.stars = obj.stargazers_count;
        option.dataset.name = obj.name;
        option.dataset.id = obj.id;
        if (savedIds.includes(option.dataset.id)) {
          option.classList.add("disabled-option");
          option.style.opacity = "0.5";
        }
        resultsList.append(option);
      });
    })
    .catch((err) => {
      console.error("There was a problem:", err);
    });
}

function addResult(option) {
  if (savedIds.length > 2) {
    savedResultsList.removeChild(savedResultsList.firstChild);
    savedIds.shift();
  }
  input.value = "";
  resultsList.textContent = "";
  const addedOption = document.createElement("ul");
  addedOption.classList.add("addedOption");
  const nameFeature = document.createElement("li");
  nameFeature.textContent = `Name: ${option.dataset.name}`;
  const ownerFeature = document.createElement("li");
  ownerFeature.textContent = `Owner: ${option.dataset.owner}`;
  const starFeature = document.createElement("li");
  starFeature.textContent = `Stars: ${option.dataset.stars}`;
  addedOption.dataset.id = option.dataset.id;
  addedOption.append(nameFeature);
  addedOption.append(ownerFeature);
  addedOption.append(starFeature);
  savedResultsList.append(addedOption);
  const close = document.createElement("div");
  close.classList.add("close");
  addedOption.append(close);
  savedIds.push(option.dataset.id);

  close.addEventListener("click", function (e) {
    e.target.parentElement.remove();
    console.log(e.target.parentElement);
    savedIds = savedIds.filter(
      (id) => id !== e.target.parentElement.dataset.id
    );
  });
}

const debounce = (fn, debounceTime) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, debounceTime);
  };
};

const debouncedSearchRepositories = debounce(searchRepositories, 400);

input.addEventListener("keyup", function (event) {
  debouncedSearchRepositories(event.target.value);
});

resultsList.addEventListener("click", function (event) {
  if (event.target.tagName !== "LI") {
    return;
  }
  addResult(event.target);
});
