const showFormBtn = document.getElementById("showFormBtn");
const addNewsForm = document.getElementById("addNewsForm");
const submitNewsBtn = document.getElementById("submitNewsBtn");
const pendingNewsDiv = document.getElementById("pendingNews");
const adminSection = document.getElementById("admin");
const adminLink = document.getElementById("adminLink");

let newsArray = [];
const ADMIN_PASSWORD = "1612"; // 🔑 change this to your own password

// Show form toggle
showFormBtn.addEventListener("click", () => {
  addNewsForm.style.display = "block";
  showFormBtn.style.display = "none";
});

// Submit news
submitNewsBtn.addEventListener("click", () => {
  const title = document.getElementById("newsTitle").value;
  const content = document.getElementById("newsContent").value;
  const category = document.getElementById("newsCategory").value;

  if (title && content && category) {
    const newsItem = { title, content, category, status: "pending" };
    newsArray.push(newsItem);
    updatePendingNews();

    alert("✅ News submitted for approval!");
    document.getElementById("newsTitle").value = "";
    document.getElementById("newsContent").value = "";
    document.getElementById("newsCategory").value = "";
    addNewsForm.style.display = "none";
    showFormBtn.style.display = "inline-block";
  } else {
    alert("⚠️ Please fill in all fields!");
  }
});

// Update pending news
function updatePendingNews() {
  pendingNewsDiv.innerHTML = "";
  newsArray.forEach((item, index) => {
    if (item.status === "pending") {
      const div = document.createElement("div");
      div.className = "admin-card";
      div.innerHTML = `
        <h4>${item.title}</h4>
        <p>${item.content}</p>
        <small>Category: ${item.category}</small><br>
        <button class="approve-btn" onclick="approveNews(${index})">Approve</button>
        <button class="reject-btn" onclick="rejectNews(${index})">Reject</button>
      `;
      pendingNewsDiv.appendChild(div);
    }
  });
}

// Approve news
function approveNews(index) {
  newsArray[index].status = "approved";
  const category = newsArray[index].category;
  const section = document.getElementById(category);

  if (section) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${newsArray[index].title}</h3>
      <p>${newsArray[index].content}</p>
    `;
    section.appendChild(div);
  }
  alert("✔️ News approved and published!");
  updatePendingNews();
}

// Reject news
function rejectNews(index) {
  newsArray.splice(index, 1);
  alert("❌ News rejected and removed.");
  updatePendingNews();
}

// Protect admin panel with password
adminLink.addEventListener("click", (e) => {
  e.preventDefault();
  const password = prompt("Enter admin password:");
  if (password === ADMIN_PASSWORD) {
    adminSection.style.display = "block";
    window.location.hash = "admin"; // scrolls to admin
  } else {
    alert("❌ Wrong password. Access denied.");
  }
});