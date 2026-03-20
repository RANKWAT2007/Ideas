const API_URL = "http://localhost:5000/api";

fetch(`${API_URL}/jobs`)
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("jobs");
    if (!container) return;

    container.innerHTML = "";

    if (!data.jobs || data.jobs.length === 0) {
      container.innerHTML = "<p>No jobs available</p>";
      return;
    }

    data.jobs.forEach(job => {
      container.innerHTML += `
        <div class="job-card">
          <h3>${job.title}</h3>
          <p>${job.company}</p>
          <p>${job.location}</p>
          <p>${job.description}</p>
        </div>
      `;
    });
  })
  .catch(err => {
    console.error("Error loading jobs:", err);
  });