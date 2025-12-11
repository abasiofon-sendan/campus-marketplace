// Initialize app data structure if not exists
function initializeAppData() {
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]))
  }
  if (!localStorage.getItem("currentUser")) {
    localStorage.setItem("currentUser", JSON.stringify(null))
  }
}

// Validate email format
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Validate phone format
function isValidPhone(phone) {
  return /^\d{10,15}$/.test(phone.replace(/\D/g, ""))
}

// Validate login credentials
function validateLogin(emailOrPhone, password) {
  const errors = {}

  if (!emailOrPhone.trim()) {
    errors.email = "Phone or email is required"
  } else if (!isValidEmail(emailOrPhone) && !isValidPhone(emailOrPhone)) {
    errors.email = "Enter a valid email or phone number"
  }

  if (!password) {
    errors.password = "Password is required"
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters"
  }

  return errors
}

// Handle form submission
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault()

  const emailOrPhone = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  // Clear previous errors
  document.getElementById("loginEmailError").textContent = ""
  document.getElementById("loginPasswordError").textContent = ""
  document.getElementById("loginSuccess").classList.remove("show")

  // Validate input
  const errors = validateLogin(emailOrPhone, password)

  if (Object.keys(errors).length > 0) {
    if (errors.email) {
      document.getElementById("loginEmailError").textContent = errors.email
    }
    if (errors.password) {
      document.getElementById("loginPasswordError").textContent = errors.password
    }
    return
  }

  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem("users")) || []

  // Check if user exists
  const user = users.find((u) => {
    const emailMatch = u.email === emailOrPhone
    const phoneMatch = u.phone === emailOrPhone
    return emailMatch || phoneMatch
  })

  if (!user) {
    document.getElementById("loginEmailError").textContent = "User not found"
    return
  }

  if (user.password !== password) {
    document.getElementById("loginPasswordError").textContent = "Incorrect password"
    return
  }

  // Login successful
  document.getElementById("loginSuccess").textContent = "Login successful! Redirecting..."
  document.getElementById("loginSuccess").classList.add("show")

  // Store current user
  const loggedInUser = { ...user }
  delete loggedInUser.password
  localStorage.setItem("currentUser", JSON.stringify(loggedInUser))

  // Redirect after 1 second
  setTimeout(() => {
    window.location.href = "index.html"
  }, 1000)
})

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initializeAppData()
})
