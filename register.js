document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const role = document.getElementById("role").value.toLowerCase(); // 🔥 IMPORTANT

  // 🔐 Frontend validation
  if (!name || !email || !password || !role) {
    alert("❌ All fields are required");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();

    if (!res.ok) {
      alert("❌ " + (data.msg || "Registration failed"));
      return;
    }

    alert("✅ " + data.msg + ". Please login now.");
    showLogin();
    document.getElementById("registerForm").reset();

  } catch (err) {
    console.error("REGISTER FETCH ERROR:", err);
    alert("❌ Server error. Try again.");
  }
});
