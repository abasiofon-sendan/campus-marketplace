// Initialize app data and products
function initializeAppData() {
  // Initialize sample products if not exists
  if (!localStorage.getItem("products")) {
    const sampleProducts = [
      {
        id: 1,
        name: 'MacBook Pro 13"',
        price: 899,
        category: "electronics",
        description: "Barely used, excellent condition. Includes charger and box.",
        color: "Space Gray",
        location: "Library Building",
        quantity: 1,
        images: ["/macbook.jpg"],
        vendorId: 101,
        rating: 4.8,
        reviews: 12,
        viewCount: 234,
        likes: 45,
        comments: [
          { user: "Alex Chen", rating: 5, text: "Perfect condition! Fast delivery.", timestamp: "2 days ago" },
          { user: "Maria Garcia", rating: 5, text: "Great seller, highly recommended.", timestamp: "1 week ago" },
          { user: "James Wilson", rating: 4, text: "Good product, minor scratches.", timestamp: "2 weeks ago" },
        ],
        videoUrl: "data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAA",
        createdAt: "2023-10-01",
      },
      {
        id: 2,
        name: "College Textbooks Bundle",
        price: 45,
        category: "books",
        description: "Physics, Chemistry, and Math textbooks. No highlights.",
        color: "Multi-color",
        location: "Student Union",
        quantity: 5,
        images: ["/stack-of-textbooks.png"],
        vendorId: 102,
        rating: 4.5,
        reviews: 8,
        viewCount: 156,
        likes: 32,
        comments: [
          { user: "Emma Taylor", rating: 5, text: "All books in great condition!", timestamp: "3 days ago" },
          { user: "Liam Brown", rating: 4, text: "Good deal, saved me money.", timestamp: "1 week ago" },
        ],
        createdAt: "2023-09-25",
      },
      {
        id: 3,
        name: "Gaming Chair",
        price: 150,
        category: "furniture",
        description: "Comfortable ergonomic chair, perfect for studying or gaming.",
        color: "Black & Red",
        location: "Dorm Hall A",
        quantity: 1,
        images: ["/ergonomic-gaming-chair.png"],
        vendorId: 101,
        rating: 4.6,
        reviews: 15,
        viewCount: 289,
        likes: 67,
        comments: [
          { user: "Noah Davis", rating: 5, text: "Very comfortable for long study sessions.", timestamp: "5 days ago" },
          { user: "Sophia Martinez", rating: 5, text: "Best chair for the price!", timestamp: "1 week ago" },
          { user: "Oliver Johnson", rating: 4, text: "Good build quality.", timestamp: "2 weeks ago" },
        ],
        createdAt: "2023-10-02",
      },
      {
        id: 4,
        name: "Winter Jacket",
        price: 75,
        category: "clothing",
        description: "Warm, waterproof winter jacket. Size M.",
        color: "Navy Blue",
        location: "Downtown Campus",
        quantity: 2,
        images: ["/winter-jacket.png"],
        vendorId: 103,
        rating: 4.7,
        reviews: 11,
        viewCount: 178,
        likes: 38,
        comments: [
          { user: "Ava Anderson", rating: 5, text: "Perfect for winter! Very warm.", timestamp: "1 week ago" },
          { user: "Ethan Miller", rating: 4, text: "Good quality jacket.", timestamp: "2 weeks ago" },
        ],
        createdAt: "2023-09-30",
      },
      {
        id: 5,
        name: "Yoga Mat",
        price: 25,
        category: "sports",
        description: "Non-slip yoga mat, premium quality. Like new.",
        color: "Purple",
        location: "Fitness Center",
        quantity: 3,
        images: ["/rolled-yoga-mat.png"],
        vendorId: 104,
        rating: 4.4,
        reviews: 6,
        viewCount: 98,
        likes: 28,
        comments: [
          { user: "Isabella Rodriguez", rating: 5, text: "Great mat, very durable.", timestamp: "3 days ago" },
        ],
        createdAt: "2023-10-03",
      },
      {
        id: 6,
        name: "Wireless Headphones",
        price: 120,
        category: "electronics",
        description: "Noise-cancelling, 30-hour battery life.",
        color: "Black",
        location: "Tech Hub",
        quantity: 2,
        images: ["/wireless-headphones.png"],
        vendorId: 105,
        rating: 4.9,
        reviews: 23,
        viewCount: 412,
        likes: 89,
        comments: [
          { user: "Mason Taylor", rating: 5, text: "Excellent sound quality!", timestamp: "4 days ago" },
          { user: "Harper Lee", rating: 5, text: "Battery lasts forever.", timestamp: "1 week ago" },
          { user: "Lucas White", rating: 5, text: "Best purchase ever.", timestamp: "2 weeks ago" },
        ],
        createdAt: "2023-09-28",
      },
      {
        id: 7,
        name: "Desk Lamp LED",
        price: 35,
        category: "furniture",
        description: "Adjustable brightness, USB charging port included.",
        color: "White",
        location: "Library Building",
        quantity: 4,
        images: ["/modern-desk-lamp.png"],
        vendorId: 106,
        rating: 4.3,
        reviews: 7,
        viewCount: 124,
        likes: 19,
        comments: [{ user: "Amelia Clark", rating: 4, text: "Good lamp for studying.", timestamp: "1 week ago" }],
        createdAt: "2023-09-27",
      },
      {
        id: 8,
        name: "Coffee Maker",
        price: 55,
        category: "furniture",
        description: "Compact single-serve coffee maker. Perfect for dorms.",
        color: "Stainless Steel",
        location: "Campus Coffee Shop",
        quantity: 1,
        images: ["/modern-coffee-maker.png"],
        vendorId: 102,
        rating: 4.6,
        reviews: 9,
        viewCount: 167,
        likes: 34,
        comments: [{ user: "Charlotte Harris", rating: 5, text: "Makes perfect coffee!", timestamp: "5 days ago" }],
        createdAt: "2023-10-04",
      },
      {
        id: 9,
        name: "Running Shoes",
        price: 95,
        category: "sports",
        description: "Brand new, never worn. Size 10. Comfort fit.",
        color: "White & Blue",
        location: "Sports Complex",
        quantity: 1,
        images: ["/running-shoes.jpg"],
        vendorId: 107,
        rating: 4.7,
        reviews: 14,
        viewCount: 201,
        likes: 41,
        comments: [{ user: "Benjamin Young", rating: 5, text: "Very comfortable shoes.", timestamp: "3 days ago" }],
        createdAt: "2023-09-26",
      },
      {
        id: 10,
        name: "Laptop Stand",
        price: 40,
        category: "furniture",
        description: "Adjustable aluminum laptop stand. Lightweight.",
        color: "Silver",
        location: "Student Center",
        quantity: 5,
        images: ["/laptop-stand.png"],
        vendorId: 108,
        rating: 4.5,
        reviews: 5,
        viewCount: 87,
        likes: 22,
        comments: [{ user: "Daniel King", rating: 4, text: "Good stand for the price.", timestamp: "1 week ago" }],
        createdAt: "2023-10-05",
      },
      {
        id: 11,
        name: "Organic Chemistry Book",
        price: 65,
        category: "books",
        description: "Latest edition, used for one semester only.",
        color: "White & Green",
        location: "Science Building",
        quantity: 1,
        images: ["/chemistry-book.png"],
        vendorId: 109,
        rating: 4.4,
        reviews: 4,
        viewCount: 76,
        likes: 15,
        comments: [
          { user: "Grace Scott", rating: 5, text: "Textbook in excellent condition.", timestamp: "2 weeks ago" },
        ],
        createdAt: "2023-09-29",
      },
      {
        id: 12,
        name: "Portable Charger",
        price: 35,
        category: "electronics",
        description: "20000mAh, fast charging, dual ports.",
        color: "Black",
        location: "Tech Store",
        quantity: 8,
        images: ["/portable-charger-lifestyle.png"],
        vendorId: 110,
        rating: 4.8,
        reviews: 18,
        viewCount: 298,
        likes: 52,
        comments: [
          { user: "Victoria Adams", rating: 5, text: "Charges my phone multiple times!", timestamp: "4 days ago" },
          { user: "Jackson Hall", rating: 5, text: "Fast charging is amazing.", timestamp: "1 week ago" },
        ],
        createdAt: "2023-10-06",
      },
      {
        id: 13,
        name: "Hoodie",
        price: 45,
        category: "clothing",
        description: "University official hoodie. Size L. Gently used.",
        color: "Red & White",
        location: "Campus Store",
        quantity: 3,
        images: ["/cozy-hoodie.png"],
        vendorId: 111,
        rating: 4.6,
        reviews: 10,
        viewCount: 145,
        likes: 36,
        comments: [
          { user: "Evelyn Mitchell", rating: 5, text: "Love the university hoodie!", timestamp: "3 days ago" },
        ],
        createdAt: "2023-10-07",
      },
      {
        id: 14,
        name: "Basketball",
        price: 50,
        category: "sports",
        description: "Official size 7 basketball. Excellent condition.",
        color: "Orange",
        location: "Sports Court",
        quantity: 2,
        images: ["/basketball-action.png"],
        vendorId: 112,
        rating: 4.5,
        reviews: 8,
        viewCount: 112,
        likes: 24,
        comments: [{ user: "Megan Blake", rating: 5, text: "Great basketball!", timestamp: "1 week ago" }],
        createdAt: "2023-10-08",
      },
      {
        id: 15,
        name: 'Monitor 24"',
        price: 200,
        category: "electronics",
        description: "1080p, IPS display, minimal dead pixels.",
        color: "Black",
        location: "Tech Building",
        quantity: 1,
        images: ["/computer-monitor.png"],
        vendorId: 113,
        rating: 4.7,
        reviews: 13,
        viewCount: 267,
        likes: 47,
        comments: [
          { user: "Leo Turner", rating: 5, text: "Beautiful monitor!", timestamp: "5 days ago" },
          { user: "Scarlett Green", rating: 5, text: "Perfect for work and gaming.", timestamp: "1 week ago" },
        ],
        createdAt: "2023-10-09",
      },
    ]

    localStorage.setItem("products", JSON.stringify(sampleProducts))
  }

  // Initialize sample vendors
  if (!localStorage.getItem("vendors")) {
    const sampleVendors = [
      {
        id: 101,
        name: "TechSmart",
        email: "tech@upstart.com",
        phone: "5551234567",
        university: "State University",
        department: "Computer Science",
        role: "vendor",
        profilePicture: null,
        averageRating: 4.7,
        totalSales: 25,
        reviews: 50,
      },
      {
        id: 102,
        name: "Book Exchange",
        email: "books@upstart.com",
        phone: "5552345678",
        university: "State University",
        department: "Literature",
        role: "vendor",
        profilePicture: null,
        averageRating: 4.5,
        totalSales: 18,
        reviews: 32,
      },
      {
        id: 103,
        name: "Fashion Hub",
        email: "fashion@upstart.com",
        phone: "5553456789",
        university: "Tech College",
        department: "Business",
        role: "vendor",
        profilePicture: null,
        averageRating: 4.6,
        totalSales: 22,
        reviews: 38,
      },
      {
        id: 104,
        name: "Wellness Store",
        email: "wellness@upstart.com",
        phone: "5554567890",
        university: "Health University",
        department: "Physical Education",
        role: "vendor",
        profilePicture: null,
        averageRating: 4.4,
        totalSales: 15,
        reviews: 28,
      },
      {
        id: 105,
        name: "Audio Pro",
        email: "audio@upstart.com",
        phone: "5555678901",
        university: "Tech Institute",
        department: "Engineering",
        role: "vendor",
        profilePicture: null,
        averageRating: 4.9,
        totalSales: 30,
        reviews: 65,
      },
      {
        id: 106,
        name: "Study Gear",
        email: "gear@upstart.com",
        phone: "5556789012",
        university: "State University",
        department: "General Studies",
        role: "vendor",
        profilePicture: null,
        averageRating: 4.3,
        totalSales: 12,
        reviews: 20,
      },
      {
        id: 107,
        name: "Sport Central",
        email: "sports@upstart.com",
        phone: "5557890123",
        university: "Athletic College",
        department: "Sports Management",
        role: "vendor",
        profilePicture: null,
        averageRating: 4.7,
        totalSales: 28,
        reviews: 48,
      },
      {
        id: 108,
        name: "Setup Solutions",
        email: "setup@upstart.com",
        phone: "5558901234",
        university: "Tech Institute",
        department: "IT",
        role: "vendor",
        profilePicture: null,
        averageRating: 4.5,
        totalSales: 16,
        reviews: 24,
      },
      {
        id: 109,
        name: "Academic Plus",
        email: "academic@upstart.com",
        phone: "5559012345",
        university: "Science University",
        department: "Chemistry",
        role: "vendor",
        profilePicture: null,
        averageRating: 4.4,
        totalSales: 11,
        reviews: 18,
      },
      {
        id: 110,
        name: "Mobile Mart",
        email: "mobile@upstart.com",
        phone: "5550123456",
        university: "Tech College",
        department: "Electronics",
        role: "vendor",
        profilePicture: null,
        averageRating: 4.8,
        totalSales: 35,
        reviews: 72,
      },
      {
        id: 111,
        name: "Campus Apparel",
        email: "apparel@upstart.com",
        phone: "5551112223",
        university: "State University",
        department: "Marketing",
        role: "vendor",
        profilePicture: null,
        averageRating: 4.6,
        totalSales: 19,
        reviews: 35,
      },
      {
        id: 112,
        name: "Game Zone",
        email: "games@upstart.com",
        phone: "5552223334",
        university: "Tech Institute",
        department: "Recreation",
        role: "vendor",
        profilePicture: null,
        averageRating: 4.5,
        totalSales: 14,
        reviews: 26,
      },
      {
        id: 113,
        name: "Electronics Expo",
        email: "expo@upstart.com",
        phone: "5553334445",
        university: "Tech College",
        department: "Engineering",
        role: "vendor",
        profilePicture: null,
        averageRating: 4.7,
        totalSales: 32,
        reviews: 58,
      },
    ]

    localStorage.setItem("vendors", JSON.stringify(sampleVendors))
  }

  // Initialize cart if not exists
  if (!localStorage.getItem("cart")) {
    localStorage.setItem("cart", JSON.stringify([]))
  }

  // Initialize current user if not exists
  if (!localStorage.getItem("currentUser")) {
    localStorage.setItem("currentUser", JSON.stringify(null))
  }

  // Initialize transactions
  if (!localStorage.getItem("transactions")) {
    localStorage.setItem("transactions", JSON.stringify([]))
  }

  // Initialize notifications
  if (!localStorage.getItem("notifications")) {
    localStorage.setItem("notifications", JSON.stringify([]))
  }

  // Initialize messages
  if (!localStorage.getItem("messages")) {
    localStorage.setItem("messages", JSON.stringify([]))
  }

  // Initialize users if not exists
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]))
  }
}

// Get vendor info
function getVendor(vendorId) {
  const vendors = JSON.parse(localStorage.getItem("vendors")) || []
  return vendors.find((v) => v.id === vendorId)
}

// Render products
function renderProducts(products = null) {
  const allProducts = products || JSON.parse(localStorage.getItem("products")) || []
  const grid = document.getElementById("productsGrid")

  grid.innerHTML = allProducts
    .map((product) => {
      const vendor = getVendor(product.vendorId)
      return `
            <div class="product-card" onclick="openProductModal(${product.id})">
                <img src="${product.images[0]}" alt="${product.name}" class="product-image">
                <div class="product-card-body">
                    <div class="product-card-name">${product.name}</div>
                    <div class="product-card-price">$${product.price}</div>
                    <div class="product-card-vendor">${vendor?.name || "Unknown"}</div>
                    <div class="product-card-location">📍 ${product.location}</div>
                </div>
            </div>
        `
    })
    .join("")
}

// Open product modal
function openProductModal(productId) {
  const products = JSON.parse(localStorage.getItem("products")) || []
  const product = products.find((p) => p.id === productId)

  if (!product) return

  const vendor = getVendor(product.vendorId)

  // Store product ID in modal for button actions
  document.getElementById("productModal").dataset.productId = productId

  // Update modal content
  document.getElementById("productName").textContent = product.name
  document.getElementById("productPrice").textContent = `$${product.price}`
  document.getElementById("productDescription").textContent = product.description
  document.getElementById("productColor").textContent = product.color
  document.getElementById("productLocation").textContent = product.location
  document.getElementById("productCategory").textContent = product.category
  document.getElementById("quantityAvailable").textContent = product.quantity
  document.getElementById("viewCount").textContent = product.viewCount
  document.getElementById("reviewCount").textContent = `(${product.reviews} reviews)`
  document.getElementById("productRating").textContent =
    "★".repeat(Math.round(product.rating)) + "☆".repeat(5 - Math.round(product.rating))

  document.getElementById("likesCount").textContent = product.likes || 0

  // Set max quantity for input
  const quantityInput = document.getElementById("cartQuantityInput")
  if (quantityInput) {
    quantityInput.max = product.quantity
    quantityInput.value = 1
  }

  // Update gallery
  document.getElementById("galleryMainImage").src = product.images[0]
  const thumbnails = document.getElementById("galleryThumbnails")
  thumbnails.innerHTML = product.images
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
      console.log("[v0] Add to cart clicked")
      const quantityInput = document.getElementById("cartQuantityInput")
      const quantity = Number.parseInt(quantityInput?.value || 1)
      console.log("[v0] Quantity:", quantity, "ProductID:", productId)
      addToCartFromModal(productId, quantity)
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

function addToCartFromModal(productId, quantity) {
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
