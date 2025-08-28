// Password for admin login
const ADMIN_PASSWORD = "1234"; // change this to your own

const adminBtn = document.getElementById("adminBtn");
const adminPanel = document.getElementById("adminPanel");
const loginBtn = document.getElementById("loginBtn");
const addNewsForm = document.getElementById("addNewsForm");
const addNewsBtn = document.getElementById("addNewsBtn");
const newsSection = document.getElementById("news");

adminBtn.addEventListener("click", () => {
  adminPanel.classList.toggle("hidden");
});

loginBtn.addEventListener("click", () => {
  const password = document.getElementById("adminPassword").value;
  if (password === ADMIN_PASSWORD) {
    addNewsForm.classList.remove("hidden");
    alert("Login successful!");
  } else {
    alert("Wrong password!");
  }
});

addNewsBtn.addEventListener("click", () => {
  const title = document.getElementById("newsTitle").value;
  const content = document.getElementById("newsContent").value;

  if (title && content) {
    const newArticle = document.createElement("article");
    newArticle.innerHTML = `<h2>${title}</h2><p>${content}</p>`;
    newsSection.prepend(newArticle); // show newest on top

    // Clear form
    document.getElementById("newsTitle").value = "";
    document.getElementById("newsContent").value = "";
  } else {
    alert("Please enter both title and content.");
  }
});