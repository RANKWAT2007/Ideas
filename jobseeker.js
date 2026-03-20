const jobsList = document.getElementById("jobsList");
const appliedJobs = document.getElementById("appliedJobs");

// Load jobs
fetch(`${API_URL}/jobs`)
  .then(res => res.json())
  .then(data => {
    data.forEach(job => {
      const div = document.createElement("div");
      div.className = "job-card";
      div.innerHTML = `
        <h3>${job.title}</h3>
        <p>${job.company} - ${job.location}</p>
        <button onclick="applyJob('${job._id}')">Apply</button>
      `;
      jobsList.appendChild(div);
    });
  });

// Apply job
function applyJob(jobId) {
  fetch(`${API_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ jobId })
  })
  .then(res => res.json())
  .then(data => {
    alert("✅ Applied successfully");
  });
}
