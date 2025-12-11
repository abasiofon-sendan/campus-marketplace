const params = new URLSearchParams(window.location.search)
const vendorId = Number.parseInt(params.get("vendorId"))

function loadVendorProfile() {
  const vendors = JSON.parse(localStorage.getItem("vendors")) || []
  const vendor = vendors.find((v) => v.id === vendorId)

  if (!vendor) {
    alert("Vendor not found")
    window.location.href = "index.html"
    return
  }

  document.getElementById("vendorName").textContent = vendor.name
  document.getElementById("vendorUniversity").textContent = vendor.university
  document.getElementById("vendorDepartment").textContent = vendor.department
  document.getElementById("vendorImage").src = vendor.profilePicture || "/placeholder.svg?height=120&width=120"
  document.getElementById("totalSales").textContent = vendor.totalSales || 0
  document.getElementById("avgRating").textContent = (vendor.averageRating || 0).toFixed(1)
  document.getElementById("vendorRating").textContent =
    "★".repeat(Math.round(vendor.averageRating || 0)) + "☆".repeat(5 - Math.round(vendor.averageRating || 0))
  document.getElementById("reviewCount").textContent = `(${vendor.reviews || 0} reviews)`

  loadVendorProducts()
  loadVendorVideos()
}

function loadVendorProducts() {
  const products = JSON.parse(localStorage.getItem("products")) || []
  const vendorProducts = products.filter((p) => p.vendorId === vendorId)

  document.getElementById("productCount").textContent = vendorProducts.length

  const grid = document.getElementById("productsGrid")

  if (vendorProducts.length === 0) {
    grid.innerHTML =
      '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">No products listed yet</p>'
    return
  }

  grid.innerHTML = vendorProducts
    .map(
      (product) => `
        <div class="product-card" onclick="openProductModal(${product.id})">
            <img src="${product.images[0]}" alt="${product.name}" class="product-image">
            <div class="product-card-body">
                <div class="product-card-name">${product.name}</div>
                <div class="product-card-price">$${product.price}</div>
            </div>
        </div>
    `,
    )
    .join("")
}

function loadVendorVideos() {
  const products = JSON.parse(localStorage.getItem("products")) || []
  const vendorProducts = products.filter((p) => p.vendorId === vendorId && p.videoUrl)

  const videosSection = document.getElementById("videosSection")
  const videosGrid = document.getElementById("videosGrid")

  if (vendorProducts.length === 0) {
    videosSection.style.display = "none"
    return
  }

  videosSection.style.display = "block"

  videosGrid.innerHTML = vendorProducts
    .map(
      (product, index) => `
        <div class="video-card" data-video-index="${index}">
            <div class="video-container">
                <video src="${product.videoUrl}" class="video-player-preview"></video>
                <div class="video-overlay">
                    <span class="video-play-icon">▶️</span>
                    <span class="video-title">${product.name}</span>
                </div>
            </div>
            <div class="video-stats">
                <div class="video-stat">
                    <span class="stat-icon">❤️</span>
                    <span>${product.likes || 0} Likes</span>
                </div>
                <div class="video-stat">
                    <span class="stat-icon">👁️</span>
                    <span>${product.viewCount || 0} Views</span>
                </div>
                <div class="video-stat">
                    <span class="stat-icon">💬</span>
                    <span>${product.comments ? product.comments.length : 0} Comments</span>
                </div>
            </div>
        </div>
    `,
    )
    .join("")

  // Add event listeners to video cards
  document.querySelectorAll(".video-card").forEach((card) => {
    card.addEventListener("click", () => {
      const index = parseInt(card.dataset.videoIndex)
      initVideoViewer(vendorProducts, index)
    })
  })
}

function openProductModal(productId) {
  const products = JSON.parse(localStorage.getItem("products")) || []
  const product = products.find((p) => p.id === productId)

  if (!product) return

  document.getElementById("productName").textContent = product.name
  document.getElementById("productPrice").textContent = `$${product.price}`
  document.getElementById("productDescription").textContent = product.description
  document.getElementById("productColor").textContent = product.color
  document.getElementById("productLocation").textContent = product.location
  document.getElementById("quantityAvailable").textContent = product.quantity
  document.getElementById("galleryMainImage").src = product.images[0]

  document.getElementById("addToCartBtn").onclick = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || []
    const existingItem = cart.find((item) => item.productId === productId)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({ productId, quantity: 1 })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    alert("Product added to cart!")
    closeProductModal()
  }

  document.getElementById("productModal").classList.add("active")
}

function closeProductModal() {
  document.getElementById("productModal").classList.remove("active")
}

document.addEventListener("DOMContentLoaded", () => {
  loadVendorProfile()
  
  document.getElementById("closeProductModal").addEventListener("click", closeProductModal)
  document.getElementById("productModal").addEventListener("click", function (e) {
    if (e.target === this) closeProductModal()
  })

  document.getElementById("contactBtn").addEventListener("click", () => {
    const vendors = JSON.parse(localStorage.getItem("vendors")) || []
    const vendor = vendors.find((v) => v.id === vendorId)
    if (vendor) {
      localStorage.setItem("selectedVendor", JSON.stringify(vendor.id))
      window.location.href = "chat.html"
    }
  })
})
