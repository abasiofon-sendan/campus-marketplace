// Validation functions
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone) {
  return /^\d{10,15}$/.test(phone.replace(/\D/g, ""))
}

function validateSignup(username, phone, email, university, department, role, password, confirmPassword) {
  const errors = {}

  if (!username.trim()) {
    errors.username = "Username is required"
  } else if (username.length < 3) {
    errors.username = "Username must be at least 3 characters"
  }

  if (!phone.trim()) {
    errors.phone = "Phone number is required"
  } else if (!isValidPhone(phone)) {
    errors.phone = "Enter a valid phone number (10-15 digits)"
  }

  if (!email.trim()) {
    errors.email = "Email is required"
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address"
  }

  if (!university.trim()) {
    errors.university = "University is required"
  }

  if (!department.trim()) {
    errors.department = "Department is required"
  }

  if (!role) {
    errors.role = "Please select a role"
  }

  if (!password) {
    errors.password = "Password is required"
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters"
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match"
  }

  // Check for duplicate accounts
  const users = JSON.parse(localStorage.getItem("users")) || []
  const userExists = users.find((u) => u.email === email || u.phone === phone || u.username === username)

  if (userExists) {
    if (userExists.email === email) errors.email = "Email already registered"
    if (userExists.phone === phone) errors.phone = "Phone number already registered"
    if (userExists.username === username) errors.username = "Username already taken"
  }

  return errors
}

// Handle form submission
document.getElementById("signupForm").addEventListener("submit", (e) => {
  e.preventDefault()

  const username = document.getElementById("username").value
  const phone = document.getElementById("phone").value
  const email = document.getElementById("email").value
  const university = document.getElementById("university").value
  const department = document.getElementById("department").value
  const role = document.getElementById("role").value
  const password = document.getElementById("password").value
  const confirmPassword = document.getElementById("confirmPassword").value

  // Clear previous errors
  document.querySelectorAll(".error-message").forEach((el) => (el.textContent = ""))
  document.getElementById("signupSuccess").classList.remove("show")

  // Validate
  const errors = validateSignup(username, phone, email, university, department, role, password, confirmPassword)

  if (Object.keys(errors).length > 0) {
    Object.keys(errors).forEach((key) => {
      const errorEl = document.getElementById(key + "Error")
      if (errorEl) errorEl.textContent = errors[key]
    })
    return
  }

  // Save user
  const users = JSON.parse(localStorage.getItem("users")) || []
  const newUser = {
    id: Date.now(),
    username,
    phone,
    email,
    university,
    department,
    role,
    password,
    createdAt: new Date().toISOString(),
    profilePicture: null,
    walletBalance: role === "vendor" ? 0 : 0,
    ratings: [],
    averageRating: 0,
    viewCount: 0,
  }

  users.push(newUser)
  localStorage.setItem("users", JSON.stringify(users))

  // Show success message
  document.getElementById("signupSuccess").textContent = "Account created successfully! Redirecting to login..."
  document.getElementById("signupSuccess").classList.add("show")

  // Redirect to login
  setTimeout(() => {
    window.location.href = "login.html"
  }, 1500)
})

document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]))
  }
})
