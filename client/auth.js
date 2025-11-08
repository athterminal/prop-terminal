/* eslint-env browser */
const API_URL = "http://192.168.1.87:5050/api/auth";

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const server = document.getElementById("server").value.trim();

  if (!username || !password || !server) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, server }),
    });
    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("server", server);
      window.location.href = "index.html";
    } else {
      alert(data.message || "Login failed");
    }
  } catch (err) {
    alert("Server error. Check connection.");
  }
}
