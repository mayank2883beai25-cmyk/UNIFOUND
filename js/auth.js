const AUTH_KEY = "unifound_auth";
const USERS_KEY = "unifound_users";
const SESSION_KEY = "unifound_session";

// Initialize admin user if not exists
function initializeAdmin() {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const adminExists = users.some((u) => u.email === "admin@unifound.app");

  if (!adminExists) {
    users.push({
      id: "admin-001",
      email: "admin@unifound.app",
      password: "admin123", // In production, this should be hashed
      name: "Admin User",
      role: "admin",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

// Get current user from session
function getCurrentUser() {
  const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  if (!session) return null;

  // Check if session is expired (24 hours)
  const sessionAge = Date.now() - new Date(session.createdAt).getTime();
  if (sessionAge > 24 * 60 * 60 * 1000) {
    logout();
    return null;
  }

  return session.user;
}

// Check if user is authenticated
function isAuthenticated() {
  return getCurrentUser() !== null;
}

// Check if user is admin
function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === "admin";
}

// Login function
function login(email, password) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return { success: false, message: "Invalid email or password" };
  }

  // Create session
  const session = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { success: true, user: session.user };
}

// Signup function
function signup(name, email, password) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");

  // Check if email already exists
  if (users.some((u) => u.email === email)) {
    return { success: false, message: "Email already registered" };
  }

  // Create new user
  const newUser = {
    id: `user-${Date.now()}`,
    email,
    password, // In production, this should be hashed
    name,
    role: "user",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Auto-login after signup
  const session = {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    },
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { success: true, user: session.user };
}

// Logout function
function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "login.html";
}

// Route protection
function requireAuth(redirectTo = "login.html") {
  if (!isAuthenticated()) {
    // Store intended URL for redirect after login
    localStorage.setItem("unifound_redirect", window.location.pathname);
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

// Require admin access
function requireAdmin(redirectTo = "login.html") {
  if (!isAuthenticated()) {
    localStorage.setItem("unifound_redirect", window.location.pathname);
    window.location.href = redirectTo;
    return false;
  }

  if (!isAdmin()) {
    alert("Access denied. Admin privileges required.");
    window.location.href = "index.html";
    return false;
  }

  return true;
}

// Redirect to intended page after login
function redirectToIntended() {
  const redirect = localStorage.getItem("unifound_redirect");
  localStorage.removeItem("unifound_redirect");

  if (redirect && redirect !== "/login.html" && redirect !== "/signup.html") {
    window.location.href = redirect;
  } else {
    window.location.href = "index.html";
  }
}

// Update navbar based on auth state
function updateNavbar() {
  const user = getCurrentUser();
  const navRight = document.querySelector(".nav-right");

  if (!navRight) return;

  if (user) {
    navRight.innerHTML = `
      <span class="user-greeting">Hi, ${user.name.split(" ")[0]}</span>
      ${user.role === "admin" ? '<a href="admin.html" class="login">Admin</a>' : ""}
      <button class="signup-btn" onclick="logout()">Logout</button>
    `;
  } else {
    navRight.innerHTML = `
      <a href="login.html" class="login">Login</a>
      <a href="login.html" class="signup-btn">Sign Up</a>
    `;
  }
}

// Initialize auth on page load
document.addEventListener("DOMContentLoaded", function () {
  initializeAdmin();
  updateNavbar();
});

// Export functions for use in other scripts
window.auth = {
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  login,
  signup,
  logout,
  requireAuth,
  requireAdmin,
  redirectToIntended,
  updateNavbar,
};
