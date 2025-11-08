function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("server");
  window.location.href = "login.html";
}
