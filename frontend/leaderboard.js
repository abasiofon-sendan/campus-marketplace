function loadLeaderboard() {
  const vendors = JSON.parse(localStorage.getItem("vendors")) || []
  const users = JSON.parse(localStorage.getItem("users")) || []
  const products = JSON.parse(localStorage.getItem("products")) || []

  // Sort vendors by sales
  const sortedVendors = [...vendors].sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
  loadVendorsList(sortedVendors.slice(0, 10))

  // Sort customers by purchases
  const customersWithPurchases = users
    .filter((u) => u.role === "customer")
    .map((u) => ({
      ...u,
      purchases: Math.floor(Math.random() * 50) + 1,
    }))
    .sort((a, b) => b.purchases - a.purchases)
  loadCustomersList(customersWithPurchases.slice(0, 10))

  // Sort products by views
  const sortedProducts = [...products].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
  loadTrendingProducts(sortedProducts.slice(0, 12))

  // Load top reviews (simulated)
  loadTopReviews()
}

function loadVendorsList(vendors) {
  const list = document.getElementById("vendorsList")
  list.innerHTML = vendors
    .map((vendor, index) => {
      let rankClass = "default"
      if (index === 0) rankClass = "gold"
      else if (index === 1) rankClass = "silver"
      else if (index === 2) rankClass = "bronze"

      return `
            <div class="leaderboard-item">
                <div class="rank-badge ${rankClass}">${index + 1}</div>
                <img src="${vendor.profilePicture || "/placeholder.svg?height=48&width=48"}" alt="${vendor.name}" class="leaderboard-item-avatar">
                <div class="leaderboard-item-info">
                    <div class="leaderboard-item-name">${vendor.name}</div>
                    <div class="leaderboard-item-details">${vendor.university}</div>
                </div>
                <div class="leaderboard-item-stats">
                    <div class="stat">
                        <span class="stat-value">${vendor.totalSales || 0}</span>
                        <span class="stat-label">Sales</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${(vendor.averageRating || 0).toFixed(1)}</span>
                        <span class="stat-label">Rating</span>
                    </div>
                    ${index === 0 ? '<div class="achievement-badge">🏆 TOP</div>' : ""}
                </div>
            </div>
        `
    })
    .join("")
}

function loadCustomersList(customers) {
  const list = document.getElementById("customersList")
  list.innerHTML = customers
    .map((customer, index) => {
      let rankClass = "default"
      if (index === 0) rankClass = "gold"
      else if (index === 1) rankClass = "silver"
      else if (index === 2) rankClass = "bronze"

      return `
            <div class="leaderboard-item">
                <div class="rank-badge ${rankClass}">${index + 1}</div>
                <img src="${customer.profilePicture || "/placeholder.svg?height=48&width=48"}" alt="${customer.username}" class="leaderboard-item-avatar">
                <div class="leaderboard-item-info">
                    <div class="leaderboard-item-name">${customer.username}</div>
                    <div class="leaderboard-item-details">${customer.university}</div>
                </div>
                <div class="leaderboard-item-stats">
                    <div class="stat">
                        <span class="stat-value">${customer.purchases || 0}</span>
                        <span class="stat-label">Purchases</span>
                    </div>
                </div>
            </div>
        `
    })
    .join("")
}

function loadTrendingProducts(products) {
  const grid = document.getElementById("trendingProducts")
  grid.innerHTML = products
    .map((product) => {
      const vendor = JSON.parse(localStorage.getItem("vendors") || "[]").find((v) => v.id === product.vendorId)
      return `
            <div class="product-card" onclick="openProductModal(${product.id})">
                <img src="${product.images[0]}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">$${product.price}</div>
                    <div class="product-views">👁 ${product.viewCount || 0} views</div>
                </div>
            </div>
        `
    })
    .join("")
}

function loadTopReviews() {
  const vendors = JSON.parse(localStorage.getItem("vendors")) || []
  const products = JSON.parse(localStorage.getItem("products")) || []
  const list = document.getElementById("reviewsList")

  const reviews = vendors.slice(0, 5).map((vendor, index) => ({
    author: vendor.name,
    product: products.find((p) => p.vendorId === vendor.id)?.name || "Premium Item",
    avatar: vendor.profilePicture || "/placeholder.svg?height=40&width=40",
    rating: vendor.averageRating || 5,
    text:
      [
        "Excellent quality and fast delivery!",
        "Great seller, would buy again",
        "Perfect condition as described",
        "Highly recommended!",
        "Amazing service and products!",
      ][index] || "Great experience",
  }))

  list.innerHTML = reviews
    .map(
      (review) => `
        <div class="review-item">
            <div class="review-header">
                <img src="${review.avatar}" alt="${review.author}" class="review-avatar">
                <div class="review-meta">
                    <div class="review-author">${review.author}</div>
                    <div class="review-product">${review.product}</div>
                </div>
                <div class="review-rating">
                    ${"⭐".repeat(Math.round(review.rating))}${"☆".repeat(5 - Math.round(review.rating))}
                </div>
            </div>
            <div class="review-text">"${review.text}"</div>
        </div>
    `,
    )
    .join("")
}

function openProductModal(productId) {
  const products = JSON.parse(localStorage.getItem("products")) || []
  const product = products.find((p) => p.id === productId)

  if (!product) return

  const vendor = JSON.parse(localStorage.getItem("vendors") || "[]").find((v) => v.id === product.vendorId)

  const html = `
        <div style="padding: 32px;">
            <img src="${product.images[0]}" style="width: 100%; border-radius: 12px; margin-bottom: 16px;">
            <h2 style="font-size: 20px; margin-bottom: 8px;">${product.name}</h2>
            <div style="font-size: 24px; color: var(--accent); font-weight: 700; margin-bottom: 16px;">$${product.price}</div>
            <p style="color: var(--text-secondary); margin-bottom: 16px;">${product.description}</p>
            <div style="background: var(--secondary); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Seller: <strong>${vendor?.name || "Unknown"}</strong></div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Views: <strong>${product.viewCount || 0}</strong></div>
                <div style="font-size: 12px; color: var(--text-secondary);">Available: <strong>${product.quantity}</strong></div>
            </div>
            <div style="display: flex; gap: 8px; margin-bottom: 16px;">
              <input type="number" id="tempQuantity" min="1" value="1" max="${product.quantity}" style="width: 60px; padding: 8px; border: 1px solid var(--border); border-radius: 6px;">
              <button onclick="addLeaderboardProductToCart(${product.id})" style="flex: 1; padding: 12px; background: var(--accent); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Add to Cart</button>
            </div>
        </div>
    `

  document.getElementById("productDetailsContainer").innerHTML = html
  document.getElementById("productModal").classList.add("active")
}

function addLeaderboardProductToCart(productId) {
  const quantityInput = document.getElementById("tempQuantity")
  const quantity = Number.parseInt(quantityInput?.value || 1)

  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const existingItem = cart.find((item) => item.productId === productId)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({ productId, quantity })
  }

  localStorage.setItem("cart", JSON.stringify(cart))
  alert(`Added ${quantity} item(s) to cart!`)
  document.getElementById("productModal").classList.remove("active")
}

// Tab switching
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const tabId = this.dataset.tab
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"))
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"))
    this.classList.add("active")
    document.getElementById(tabId).classList.add("active")
  })
})

document.getElementById("closeProductModal").addEventListener("click", () => {
  document.getElementById("productModal").classList.remove("active")
})

document.getElementById("productModal").addEventListener("click", function (e) {
  if (e.target === this) this.classList.remove("active")
})

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) {
    window.location.href = "login.html"
  }
  loadLeaderboard()
})
