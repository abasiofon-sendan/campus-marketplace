// Render products
document.addEventListener('DOMContentLoaded', async () => {
  const authToken = JSON.parse(localStorage.getItem("authToken"));
  if (!authToken) return;

  try {
    const response = await fetch('http://127.0.0.1:8000/auth/users/me/',
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken.access}`
        },
      });

    if (response.ok) {

    }
    const userInfo = response.json();
    localStorage.setItem("userInfo", userInfo);
  } catch (error) {
    console.log(error);
  }
})

// function renderProducts(products = null) {
//   const allProducts = products || JSON.parse(localStorage.getItem("products")) || []
//   const grid = document.getElementById("productsGrid")

//   grid.innerHTML = allProducts
//     .map((product) => {
//       const vendor = getVendor(product.vendorId)
//       return `
//             <div class="product-card" onclick="openProductModal(${product.id})">
//                 <img src="${product.images[0]}" alt="${product.name}" class="product-image">
//                 <div class="product-card-body">
//                     <div class="product-card-name">${product.name}</div>
//                     <div class="product-card-price">$${product.price}</div>
//                     <div class="product-card-vendor">${vendor?.name || "Unknown"}</div>
//                     <div class="product-card-location">📍 ${product.location}</div>
//                 </div>
//             </div>
//         `
//     })
//     .join("")
// }

function renderProducts(product) {
  const productGrid = document.getElementById("productsGrid");

  product.forEach((item) => {
    productGrid.innerHTML += `
      <div class="product-card" onclick="${openProductModal(item.id)}">
          <img src="${item.image_url}" alt="${item.product_name}" class="product-image">
          <div class="product-card-body">
              <div class="product-card-name">${item.product_name}</div>
              <div class="product-card-price">${item.price}</div>
              <div class="product-card-vendor">${item.vendor_name}</div>
          </div>
      </div>`
  })
}

// Open product modal
async function openProductModal(productId) {
  const response = await fetch(``,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    }
  )

  const product = await response.json();

  if (!product) return

  const vendor = product.

    // Store product ID in modal for button actions
    document.getElementById("productModal").dataset.productId = productId

  // Update modal content
  document.getElementById("productName").textContent = product.product_name
  document.getElementById("productPrice").textContent = `$${product.price}`
  document.getElementById("productDescription").textContent = product.description
  // document.getElementById("productColor").textContent = product.color
  // document.getElementById("productLocation").textContent = product.location
  document.getElementById("productCategory").textContent = product.category
  document.getElementById("quantityAvailable").textContent = product.quantity
  document.getElementById("viewCount").textContent = product.view_count
  document.getElementById("reviewCount").textContent = `(${product.reviews} reviews)`
  document.getElementById("productRating").textContent =
    "★".repeat(Math.round(product.rating)) + "☆".repeat(5 - Math.round(product.rating))

  document.getElementById("likesCount").textContent = product.likes || 0

  // Set max quantity for input
  // const quantityInput = document.getElementById("cartQuantityInput")
  // if (quantityInput) {
  //   quantityInput.max = product.quantity
  //   quantityInput.value = 1
  // }

  // Update gallery
  document.getElementById("galleryMainImage").src = product.image_url[0]
  const thumbnails = document.getElementById("galleryThumbnails")
  thumbnails.innerHTML = product.image_url
    .map(
      (img, idx) => `
        <div class="gallery-thumbnail" onclick="event.stopPropagation(); document.getElementById('galleryMainImage').src='${img}'">
            <img src="${img}" alt="Image ${idx + 1}">
        </div>
    `,
    )
    .join("")

  // Update vendor section
  if (vendor) {
    document.getElementById("vendorName").textContent = vendor.name
    document.getElementById("vendorEmail").textContent = vendor.email
    document.getElementById("vendorRating").textContent =
      "★".repeat(Math.round(vendor.averageRating)) + "☆".repeat(5 - Math.round(vendor.averageRating))
  }

  const commentsList = document.getElementById("commentsList")
  if (product.comments && product.comments.length > 0) {
    commentsList.innerHTML = product.comments
      .map(
        (comment) => `
        <div class="comment-item">
          <div class="comment-header">
            <strong>${comment.user}</strong>
            <span class="comment-rating">${"★".repeat(comment.rating)}${"☆".repeat(5 - comment.rating)}</span>
          </div>
          <p class="comment-text">${comment.text}</p>
          <span class="comment-time">${comment.timestamp}</span>
        </div>
      `,
      )
      .join("")
  } else {
    commentsList.innerHTML = `<p class="no-comments">No reviews yet. Be the first to review!</p>`
  }

  document.getElementById("likeBtn").onclick = () => {
    product.likes = (product.likes || 0) + 1
    const products = JSON.parse(localStorage.getItem("products")) || []
    const index = products.findIndex((p) => p.id === productId)
    if (index !== -1) {
      products[index] = product
      localStorage.setItem("products", JSON.stringify(products))
      document.getElementById("likesCount").textContent = product.likes
      document.getElementById("likeBtn").classList.add("liked")
    }
  }

  const addToCartBtn = document.getElementById("addToCartBtn")
  if (addToCartBtn) {
    addToCartBtn.onclick = () => {
      // console.log("[v0] Add to cart clicked")
      // const quantityInput = document.getElementById("cartQuantityInput")
      // const quantity = Number.parseInt(quantityInput?.value || 1)
      // console.log("[v0] Quantity:", quantity, "ProductID:", productId)
      addToCartFromModal(productId);
    }
  }

  const contactVendorBtn = document.getElementById("contactVendorBtn")
  if (contactVendorBtn) {
    contactVendorBtn.onclick = () => {
      console.log("[v0] Contact vendor clicked, vendorId:", product.vendorId)
      window.location.href = `chat.html?vendorId=${product.vendorId}`
    }
  }

  const viewVendorBtn = document.getElementById("viewVendorBtn")
  if (viewVendorBtn) {
    viewVendorBtn.onclick = () => {
      console.log("[v0] View vendor clicked, vendorId:", product.vendorId)
      window.location.href = `vendor-profile.html?vendorId=${product.vendorId}`
    }
  }

  document.getElementById("productModal").classList.add("active")
}

// Close product modal
function closeProductModal() {
  console.log("[v0] Closing product modal")
  document.getElementById("productModal").classList.remove("active")
}

// Add to cart
function addToCart(productId) {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const existingItem = cart.find((item) => item.productId === productId)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({ productId, quantity: 1 })
  }

  localStorage.setItem("cart", JSON.stringify(cart))
  updateCartBadge()

  // Show notification
  alert("Product added to cart!")
  closeProductModal()
}

// Update cart badge
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const badge = document.getElementById("cartBadge")
  badge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0)
}

// Update wallet balance
function updateWalletBalance() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) {
    document.getElementById("walletBalance").textContent = "$0"
    return
  }

  const users = JSON.parse(localStorage.getItem("users")) || []
  const user = users.find((u) => u.id === currentUser.id)
  if (user) {
    document.getElementById("walletBalance").textContent = `$${user.walletBalance || 0}`
  }
}

// Category filter
function setupCategoryFilters() {
  // Wait a tick to ensure shared-nav is fully loaded
  setTimeout(() => {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"))
        this.classList.add("active")

        const category = this.dataset.category
        const allProducts = JSON.parse(localStorage.getItem("products")) || []
        const filtered = category === "all" ? allProducts : allProducts.filter((p) => p.category === category)
        renderProducts(filtered)
      })
    })

    // Setup sort functionality
    const sortSelect = document.getElementById("sortSelect")
    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        const products = JSON.parse(localStorage.getItem("products")) || []
        const activeCategory = document.querySelector(".filter-btn.active")?.dataset.category || "all"
        const filtered = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory)

        // Sort products
        if (this.value === "price-low") {
          filtered.sort((a, b) => a.price - b.price)
        } else if (this.value === "price-high") {
          filtered.sort((a, b) => b.price - a.price)
        } else if (this.value === "rating") {
          filtered.sort((a, b) => b.rating - a.rating)
        } else if (this.value === "newest") {
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        }

        renderProducts(filtered)
      })
    }

    // Setup shared search input to work on this page
    const sharedSearchInput = document.getElementById("sharedSearchInput")
    if (sharedSearchInput) {
      sharedSearchInput.addEventListener("input", function () {
        const query = this.value.toLowerCase()
        const products = JSON.parse(localStorage.getItem("products")) || []
        const filtered = products.filter(
          (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query),
        )
        renderProducts(filtered)
      })
    }

    // Initialize the page
    initializeAppData()
    renderProducts()
  }, 0)
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupCategoryFilters)
} else {
  setupCategoryFilters()
}

// Navbar dropdowns
document.getElementById("profileBtn").addEventListener("click", () => {
  document.querySelector(".navbar-item.profile").classList.toggle("active")
})

document.getElementById("notificationsBtn").addEventListener("click", () => {
  document.querySelector(".navbar-item.notifications").classList.toggle("active")
})

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".navbar-item")) {
    document.querySelectorAll(".navbar-item").forEach((item) => item.classList.remove("active"))
  }
})

// Logout
document.getElementById("logoutBtn").addEventListener("click", (e) => {
  e.preventDefault()
  localStorage.setItem("currentUser", JSON.stringify(null))
  window.location.href = "login.html"
})

// Update vendor-only menu
function updateVendorMenu() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const inventoryLink = document.getElementById("inventoryLink")

  if (currentUser && currentUser.role === "vendor") {
    inventoryLink.style.display = "block"
  } else {
    inventoryLink.style.display = "none"
  }
}

// Chat functionality
const chatMessages = [
  "Hi there! I'm Upstart Assistant. How can I help you?",
  "Looking for something specific? Try using the search bar!",
  "Need help with payment? Visit our wallet page.",
  "Want to sell? Create a vendor account!",
  "Check out our leaderboard for top sellers and products.",
  "Having trouble? Contact our support team.",
]

const chatIndex = 0

document.getElementById("chatBubbleBtn").addEventListener("click", () => {
  document.getElementById("chatWidget").classList.toggle("active")
})

document.getElementById("closeChatWidget").addEventListener("click", () => {
  document.getElementById("chatWidget").classList.remove("active")
})

document.getElementById("chatSendBtn").addEventListener("click", () => {
  const input = document.getElementById("chatInput")
  const message = input.value.trim()

  if (!message) return

  const chatMessages = document.getElementById("chatMessages")

  // Add user message
  const userMsg = document.createElement("div")
  userMsg.className = "message user-message"
  userMsg.innerHTML = `<p>${message}</p>`
  chatMessages.appendChild(userMsg)

  input.value = ""

  // Add bot response
  setTimeout(() => {
    const botMsg = document.createElement("div")
    botMsg.className = "message bot-message"
    const responses = [
      "Great question! I'll help with that.",
      "That's a popular item!",
      "Let me assist you with that.",
      "I understand. What else can I help with?",
      "Anything else I can help you with?",
    ]
    botMsg.innerHTML = `<p>${responses[Math.floor(Math.random() * responses.length)]}</p>`
    chatMessages.appendChild(botMsg)
    chatMessages.scrollTop = chatMessages.scrollHeight
  }, 500)

  chatMessages.scrollTop = chatMessages.scrollHeight
})

// Modal close on ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeProductModal()
  }
})

document.getElementById("productModal").addEventListener("click", function (e) {
  if (e.target === this) {
    console.log("[v0] Overlay clicked, closing modal")
    closeProductModal()
  }
})

const closeBtn = document.getElementById("closeProductModal")
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    console.log("[v0] Close button clicked")
    closeProductModal()
  })
}

// Check authentication
function checkAuth() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) {
    window.location.href = "login.html"
  }
}

// Chat helper function
function openChat(vendorId) {
  localStorage.setItem("selectedVendor", JSON.stringify(vendorId))
  window.location.href = "chat.html"
}

function addToCartFromModal(productId) {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const existingItem = cart.find((item) => item.productId == productId)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({ productId, quantity })
  }

  localStorage.setItem("cart", JSON.stringify(cart))

  // Update cart badge
  const badge = document.getElementById("cartBadge")
  if (badge) {
    badge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0)
  }

  alert(`Added ${quantity} item(s) to cart!`)
  closeProductModal()
}
