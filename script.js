function showNews() {
  const newsContainer = document.getElementById("news-container");
  newsContainer.innerHTML = ""; // Clear old news

  // Example hardcoded news (later we make it dynamic)
  const news = [
    { title: "Local Sports Victory!", content: "Dordrecht High wins the regional football match." },
    { title: "Weather Update", content: "Expect sunny skies with light winds today." },
    { title: "Community Event", content: "Food Festival happening downtown this weekend!" }
  ];

  news.forEach(item => {
    const div = document.createElement("div");
    div.className = "news-item";
    div.innerHTML = `<h2>${item.title}</h2><p>${item.content}</p>`;
    newsContainer.appendChild(div);
  });
}