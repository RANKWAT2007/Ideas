document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("⚠️ Please enter email and password");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    // ❌ Login failed
    if (!res.ok) {
      alert("❌ " + (data.msg || "Login failed"));
      return;
    }

    // ✅ Login success
    alert("✅ Login successful");

    // 🔐 SAVE AUTH DATA (🔥 FIXED)
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("email", data.email);

    // 🔥 VERY IMPORTANT (MISSING THA)
    localStorage.setItem("userId", data.userId || data.id || data._id);

    console.log("Saved userId:", localStorage.getItem("userId"));

    // 🔥 ROLE BASED REDIRECT
    setTimeout(() => {
      if (data.role === "recruiter") {
        window.location.href = "/html/dashboard/recruiter.html";
      } else if (data.role === "jobseeker") {
        window.location.href = "/html/dashboard/jobseeker.html";
      } else {
        window.location.href = "/html/index.html";
      }
    }, 500);

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    alert("❌ Server error. Please try again.");
  }
});