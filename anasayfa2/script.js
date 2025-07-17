const allowedEmails = [
  "yetkili1@gmail.com",
  "yetkili2@example.com"
];

function showAccessDenied() {
  console.log("🚫 Erişim reddedildi");
  document.getElementById("access-denied").style.display = "block";
  document.getElementById("profile-info").style.display = "none";
  document.querySelectorAll(".section").forEach(section => {
    section.style.display = "none";
  });
}

function showUserProfile(user) {
  console.log("✅ Yetkili kullanıcı:", user.email);
  document.getElementById("user-name").textContent = user.name;
  document.getElementById("user-email").textContent = user.email;

  document.getElementById("profile-info").style.display = "block";
  document.querySelectorAll(".section").forEach(section => {
    section.style.display = "block";
  });
}

function handleCredentialResponse(response) {
  const responsePayload = decodeJwt(response.credential);
  const userEmail = responsePayload.email;

  console.log("🔑 Oturum açıldı:", userEmail);

  if (!allowedEmails.includes(userEmail)) {
    showAccessDenied();
    return;
  }

  showUserProfile({
    name: responsePayload.name,
    email: responsePayload.email
  });
}

function decodeJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''));

  return JSON.parse(jsonPayload);
}
