const API = "http://localhost:5000/api";
const token = localStorage.getItem("token");

// ---------- DOM ELEMENTS ----------
const dashboardSection = document.getElementById("dashboardSection");
const postJobSection = document.getElementById("postJobSection");
const jobsSection = document.getElementById("jobsSection");
const applicationsSection = document.getElementById("applicationsSection");
const profileSection = document.getElementById("profileSection");

const jobsList = document.getElementById("jobsList");
const applicationsList = document.getElementById("applicationsList");

// post job inputs
const title = document.getElementById("title");
const company = document.getElementById("company");
const location = document.getElementById("location");
const description = document.getElementById("description");

// profile inputs
const recName = document.getElementById("recName");
const recCompany = document.getElementById("recCompany");
const recEmail = document.getElementById("recEmail");

// ---------- UI SWITCH ----------
function hideAll() {
  [
    dashboardSection,
    postJobSection,
    jobsSection,
    applicationsSection,
    profileSection
  ].forEach(sec => sec.style.display = "none");
}

function showDashboard() {
  hideAll();
  dashboardSection.style.display = "block";
}

function showPostJob() {
  hideAll();
  postJobSection.style.display = "block";
}

function showJobs() {
  hideAll();
  jobsSection.style.display = "block";
  loadMyJobs();
}

function showApplications() {
  hideAll();
  applicationsSection.style.display = "block";
}

function showProfile() {
  hideAll();
  profileSection.style.display = "block";
  loadProfile();
}

// ---------- POST JOB ----------
async function postJob() {
  const res = await fetch(`${API}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: title.value,
      company: company.value,
      location: location.value,
      description: description.value
    })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.msg || "Job post failed");
    return;
  }

  alert("✅ Job posted successfully");

  title.value = "";
  company.value = "";
  location.value = "";
  description.value = "";

  showJobs();
}

// ---------- LOAD MY JOBS (EDIT / DELETE / VIEW APPLICANTS) ----------
async function loadMyJobs() {
  const res = await fetch(`${API}/jobs/my`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  jobsList.innerHTML = "";

  if (!data.jobs || data.jobs.length === 0) {
    jobsList.innerHTML = "<p>No jobs posted yet</p>";
    return;
  }

  data.jobs.forEach(job => {
    jobsList.innerHTML += `
      <div class="job-card">
        <h4 contenteditable="true" id="title-${job._id}">
          ${job.title}
        </h4>

        <p contenteditable="true" id="company-${job._id}">
          ${job.company} • ${job.location}
        </p>

        <p contenteditable="true" id="desc-${job._id}">
          ${job.description}
        </p>

        <button onclick="updateJob('${job._id}')">✏️ Edit</button>
        <button onclick="deleteJob('${job._id}')">🗑 Delete</button>
        <button onclick="viewApplicants('${job._id}')">👀 Applicants</button>
      </div>
    `;
  });
}
// ---------- UPDATE JOB ----------
async function updateJob(id) {
  try {
    const res = await fetch(`${API}/jobs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: document.getElementById(`title-${id}`).innerText,
        company: document.getElementById(`company-${id}`).innerText,
        description: document.getElementById(`desc-${id}`).innerText
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "Update failed ❌");
      return;
    }

    alert("✅ Job updated successfully");

  } catch (err) {
    console.error("Update error:", err);
  }
}

// ---------- DELETE JOB ----------
async function deleteJob(id) {
  if (!confirm("Are you sure you want to delete this job?")) return;

  try {
    const res = await fetch(`${API}/jobs/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "Delete failed ❌");
      return;
    }

    alert("✅ Job deleted permanently");
    loadMyJobs();

  } catch (err) {
    console.error("Delete error:", err);
    alert("Server error while deleting");
  }
}

// ---------- VIEW APPLICANTS PER JOB ----------
async function viewApplicants(jobId) {
  showApplications();

  const res = await fetch(`${API}/applications/job/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  applicationsList.innerHTML = "";

  if (data.applications.length === 0) {
    applicationsList.innerHTML = "<p>No applicants yet</p>";
    return;
  }

  data.applications.forEach(app => {
    applicationsList.innerHTML += `
      <div class="app-card">
        <h4>${app.user.name}</h4>
        <p>Email: ${app.user.email}</p>
        <p>Status: ${app.status || "Pending"}</p>
      </div>
    `;
  });
}

// ---------- PROFILE ----------
function saveProfile() {
  const profile = {
    name: recName.value,
    company: recCompany.value,
    email: recEmail.value
  };

  localStorage.setItem("recruiterProfile", JSON.stringify(profile));
  alert("Profile saved");
}

function loadProfile() {
  const p = JSON.parse(localStorage.getItem("recruiterProfile")) || {};
  recName.value = p.name || "";
  recCompany.value = p.company || "";
  recEmail.value = localStorage.getItem("email") || "";
}
