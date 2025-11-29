let AllTasks = [];
let currentTab = "all";
const form = document.querySelector("form");
const regex_pattern = /^[A-Z][^0-9]*$/;
document.querySelectorAll(".tabSwitcherBtn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabText = btn.innerText.toLowerCase();
    if (tabText.includes("all")) currentTab = "all tasks";
    else if (tabText.includes("completed")) currentTab = "completed";
    else if (tabText.includes("pending")) currentTab = "pending";

    displayTasks(AllTasks);
  });
});
document
  .querySelector(".tasksList")
  .addEventListener("change", (eventForCheckbox) => {
    if (eventForCheckbox.target.type === "checkbox") {
      const id = Number(eventForCheckbox.target.id.split("_")[1]);
      const task = AllTasks.find((task) => task.id === id);
      if (task) task.completed = eventForCheckbox.target.checked;
      displayTasks(AllTasks);
    }
  });

document
  .querySelector(".tasksList")
  .addEventListener("click", (eventForDeletBtn) => {
    if (eventForDeletBtn.target.classList.contains("deleteBtn")) {
      const id = Number(eventForDeletBtn.target.dataset.id);
      deleteTask(id);
      alert("Task deleted successfully");
    }
  });

async function getTasks() {
  try {
    const response = await fetch("https://dummyjson.com/todos");
    if (response.ok) {
      const responseData = await response.json();
      return responseData.todos;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to load todos:", error);
    return [];
  }
}

function displayTasks(tasks) {
  const tasksList = document.querySelector(`.tasksList`);
  tasksList.innerHTML = "";

  // filter by  currentTab
  let filteredTasks = tasks;
  if (currentTab === "completed") {
    filteredTasks = tasks.filter((task) => task.completed);
  } else if (currentTab === "pending") {
    filteredTasks = tasks.filter((task) => !task.completed);
  }

  filteredTasks.forEach((task) => {
    const taskItem = `
    <li class = "taskItemClass">
      <input type="checkbox" id="task_${task.id}" ${
      task.completed ? "checked" : ""
    }>
      <label for="task_${task.id}" class = "${
      task.completed ? "completed" : ""
    }">
      ${task.todo}
      </label>
          <button class="deleteBtn" data-id="${task.id}">x</button>
    </li>
    `;
    tasksList.innerHTML += taskItem;
  });
}

function addTaskFromUser(text) {
  const newTask = {
    id: Date.now(),
    todo: text,
    completed: false,
  };

  AllTasks.push(newTask);
  const localTaskLoading = loadUserTasks();
  localTaskLoading.push(newTask);
  saveUserTasks(localTaskLoading);

  displayTasks(AllTasks);
}

function saveUserTasks(localTasks) {
  localStorage.setItem("userTasks", JSON.stringify(localTasks));
}

function loadUserTasks() {
  const stored = localStorage.getItem("userTasks");
  return stored ? JSON.parse(stored) : [];
}

function deleteTask(id) {
  AllTasks = AllTasks.filter((task) => task.id !== id);
  let userTasks = loadUserTasks();
  userTasks = userTasks.filter((task) => task.id !== id);

  saveUserTasks(userTasks);
  displayTasks(AllTasks);
}

// to prevent refresh for the page
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const input = document.getElementById("inputTaskField");
  if (regex_pattern.test(input.value)) {
    addTaskFromUser(input.value);
    input.value = "";
  } else {
    alert("Start with capital letter and do not use numbers ");
    return;
  }
});

async function loadTask() {
  const apiTasks = await getTasks();
  const firstFive = apiTasks.slice(0, 5);

  const userTasks = loadUserTasks();

  AllTasks = [...userTasks, ...firstFive];

  displayTasks(AllTasks);
}

loadTask();
