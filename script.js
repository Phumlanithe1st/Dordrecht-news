const showFormBtn = document.getElementById("showFormBtn");
const addNewsForm = document.getElementById("addNewsForm");
const cancelBtn = document.getElementById("cancelBtn");
const submitNewsBtn = document.getElementById("submitNewsBtn");
const adminPanel = document.getElementById("adminPanel");
const pendingNewsDiv = document.getElementById("pendingNews");

let newsArray = [];

// Show form
showFormBtn.addEventListener("click", () => {
  addNewsForm.style.display = "block";
  showFormBtn.style.display = "none";
});

// Cancel form
cancelBtn.addEventListener("click", () => {
  addNewsForm.style.display = "none";
  showFormBtn.style.display = "inline-block";
});

// Submit news
submitNewsBtn.addEventListener("click", () => {
  const title = document.getElementById("newsTitle").value;
  const content = document.getElementById("newsContent").value;

  if (title && content) {
    const newsItem = { title, content, status: "pending" };
    newsArray.push(newsItem);
    updatePendingNews();

    alert("✅ News submitted for approval!");
    
    // Reset form
    document.getElementById("newsTitle").value = "";
    document.getElementById("newsContent").value = "";
    addNewsForm.style.display = "none";
    showFormBtn.style.display = "inline-block";
  } else {
    alert("⚠️ Please fill in all fields!");
  }
});

// Update pending news in admin panel
function updatePendingNews() {
  pendingNewsDiv.innerHTML = "";
  newsArray.forEach((item, index) => {
    if (item.status === "pending") {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.content}</p>
        <button onclick="approveNews(${index})">✅ Approve</button>
        <button onclick="rejectNews(${index})">❌ Reject</button>
      `;
      pendingNewsDiv.appendChild(div);
    }
  });
  adminPanel.style.display = pendingNewsDiv.innerHTML ? "block" : "none";
}

function approveNews(index) {
  newsArray[index].status = "approved";
  alert("✔️ News approved and published!");
  updatePendingNews();
}

function rejectNews(index) {
  newsArray[index].status = "rejected";
  alert("❌ News rejected!");
  updatePendingNews();
}