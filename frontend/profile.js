let isEditing = false

function loadUserProfile() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) {
    window.location.href = "login.html"
    return
  }

  const users = JSON.parse(localStorage.getItem("users")) || []
  const user = users.find((u) => u.id === currentUser.id)

  if (!user) return

  // Load profile data
  document.getElementById("profileName").textContent = user.username
  document.getElementById("username").value = user.username
  document.getElementById("email").value = user.email
  document.getElementById("phone").value = user.phone
  document.getElementById("university").value = user.university
  document.getElementById("department").value = user.department
  document.getElementById("profileRole").textContent = user.role === "vendor" ? "Vendor" : "Customer"

  // Load profile picture if exists
  if (user.profilePicture) {
    document.getElementById("profileImg").src = user.profilePicture
  }

  // Load vendor stats if vendor
  if (user.role === "vendor") {
    document.getElementById("vendorSection").style.display = "block"
    const products = JSON.parse(localStorage.getItem("products")) || []
    const vendorProducts = products.filter((p) => p.vendorId === user.id)
    document.getElementById("productsListed").textContent = vendorProducts.length
    document.getElementById("totalSales").textContent = user.totalSales || 0
    document.getElementById("avgRating").textContent = (user.averageRating || 0).toFixed(1)
  }

  // Load rating
  const reviews = user.ratings || []
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((a, b) => a + b, 0) / reviews.length
    document.getElementById("overallRating").textContent = avgRating.toFixed(1)
    document.getElementById("ratingStars").textContent =
      "★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating))
    document.getElementById("reviewCountText").textContent =
      `${reviews.length} review${reviews.length !== 1 ? "s" : ""}`
  }
}

// Edit profile
document.getElementById("editBtn").addEventListener("click", () => {
  isEditing = true
  document.querySelectorAll(".form-input").forEach((input) => {
    if (input.id !== "username") input.removeAttribute("readonly")
  })
  document.getElementById("editBtn").style.display = "none"
  document.getElementById("saveBtn").style.display = "block"
  document.getElementById("cancelBtn").style.display = "block"
})

// Save changes
document.getElementById("saveBtn").addEventListener("click", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users")) || []
  const userIndex = users.findIndex((u) => u.id === currentUser.id)

  if (userIndex !== -1) {
    users[userIndex].email = document.getElementById("email").value
    users[userIndex].phone = document.getElementById("phone").value
    users[userIndex].university = document.getElementById("university").value
    users[userIndex].department = document.getElementById("department").value

    localStorage.setItem("users", JSON.stringify(users))
    localStorage.setItem("currentUser", JSON.stringify(users[userIndex]))

    isEditing = false
    document.querySelectorAll(".form-input").forEach((input) => input.setAttribute("readonly", ""))
    document.getElementById("editBtn").style.display = "block"
    document.getElementById("saveBtn").style.display = "none"
    document.getElementById("cancelBtn").style.display = "none"

    alert("Profile updated successfully!")
  }
})

// Cancel edit
document.getElementById("cancelBtn").addEventListener("click", () => {
  isEditing = false
  document.querySelectorAll(".form-input").forEach((input) => input.setAttribute("readonly", ""))
  document.getElementById("editBtn").style.display = "block"
  document.getElementById("saveBtn").style.display = "none"
  document.getElementById("cancelBtn").style.display = "none"
  loadUserProfile()
})

// Change photo
document.getElementById("changePhotoBtn").addEventListener("click", () => {
  document.getElementById("photoInput").click()
})

document.getElementById("photoInput").addEventListener("change", (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target.result
      document.getElementById("profileImg").src = dataUrl

      // Save to localStorage
      const currentUser = JSON.parse(localStorage.getItem("currentUser"))
      const users = JSON.parse(localStorage.getItem("users")) || []
      const userIndex = users.findIndex((u) => u.id === currentUser.id)
      if (userIndex !== -1) {
        users[userIndex].profilePicture = dataUrl
        localStorage.setItem("users", JSON.stringify(users))
      }
    }
    reader.readAsDataURL(file)
  }
})

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.setItem("currentUser", JSON.stringify(null))
  window.location.href = "login.html"
})

// Initialize
document.addEventListener("DOMContentLoaded", loadUserProfile)
