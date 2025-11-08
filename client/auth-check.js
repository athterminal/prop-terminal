/* eslint-env browser */
const token = localStorage.getItem("token");
if (!token) {
  if (!window.location.href.endsWith("login.html")) window.location.href = "login.html";
}
