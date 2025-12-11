function checkAuth() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) {
    window.location.href = "login.html"
    return null
  }
  if (currentUser.role !== "vendor") {
    alert("Only vendors can access analytics")
    window.location.href = "index.html"
    return null
  }
  return currentUser
}

function loadAnalytics() {
  const currentUser = checkAuth()
  if (!currentUser) return

  const products = JSON.parse(localStorage.getItem("products")) || []
  const vendors = JSON.parse(localStorage.getItem("vendors")) || []
  const vendor = vendors.find((v) => v.id === currentUser.id)

  const vendorProducts = products.filter((p) => p.vendorId === currentUser.id)

  // Calculate metrics
  const totalViews = vendorProducts.reduce((sum, p) => sum + (p.viewCount || 0), 0)
  const totalRevenue = vendorProducts.reduce((sum, p) => sum + p.price * (Math.random() * 20 + 1), 0)
  const totalSales = Math.floor(totalRevenue / 50)

  document.getElementById("totalSales").textContent = totalSales
  document.getElementById("totalRevenue").textContent = totalRevenue.toFixed(2)
  document.getElementById("totalViews").textContent = totalViews
  document.getElementById("avgRating").textContent = (vendor?.averageRating || 0).toFixed(1)
  document.getElementById("ratingStars").textContent =
    "★".repeat(Math.round(vendor?.averageRating || 0)) + "☆".repeat(5 - Math.round(vendor?.averageRating || 0))
  document.getElementById("productCount").textContent = vendorProducts.length

  // Draw charts
  drawSalesChart()
  drawCategoryChart(vendorProducts)

  // Load top products
  loadTopProducts(vendorProducts)

  // Load recent orders
  loadRecentOrders()
}

function drawSalesChart() {
  const canvas = document.getElementById("salesCanvas")
  const ctx = canvas.getContext("2d")

  // Simple bar chart
  const data = [45, 52, 48, 65, 55, 70, 80]
  const barWidth = canvas.width / data.length
  const maxValue = Math.max(...data)

  ctx.fillStyle = "#F4F6FA"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  data.forEach((value, index) => {
    const barHeight = (value / maxValue) * (canvas.height * 0.8)
    ctx.fillStyle = "#1C6EF2"
    ctx.fillRect(index * barWidth + 5, canvas.height - barHeight - 20, barWidth - 10, barHeight)
  })
}

function drawCategoryChart(products) {
  const canvas = document.getElementById("categoryCanvas")
  const ctx = canvas.getContext("2d")

  // Count products by category
  const categories = {}
  products.forEach((p) => {
    categories[p.category] = (categories[p.category] || 0) + 1
  })

  const categoryNames = Object.keys(categories)
  const categoryValues = Object.values(categories)
  const maxValue = Math.max(...categoryValues, 1)

  ctx.fillStyle = "#F4F6FA"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  categoryNames.forEach((name, index) => {
    const barHeight = (categoryValues[index] / maxValue) * (canvas.height * 0.8)
    const colors = ["#1C6EF2", "#FFB800", "#4AD77C", "#FF4D4D", "#6B7280"]
    ctx.fillStyle = colors[index % colors.length]
    ctx.fillRect(
      index * (canvas.width / categoryNames.length) + 5,
      canvas.height - barHeight - 20,
      canvas.width / categoryNames.length - 10,
      barHeight,
    )
  })
}

function loadTopProducts(products) {
  const sorted = [...products].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5)
  const tbody = document.getElementById("topProductsTable")

  tbody.innerHTML = sorted
    .map((product) => {
      const sales = Math.floor(Math.random() * 20) + 1
      const revenue = (product.price * sales).toFixed(2)
      return `
            <tr onclick="openProductModal(${product.id})">
                <td><span class="table-product-name">${product.name}</span></td>
                <td><span class="stat-number">${product.viewCount || 0}</span></td>
                <td><span class="stat-number">${sales}</span></td>
                <td><span class="revenue">$${revenue}</span></td>
            </tr>
        `
    })
    .join("")
}

function loadRecentOrders() {
  const list = document.getElementById("ordersList")
  const orders = []

  for (let i = 0; i < 5; i++) {
    orders.push({
      id: `ORD-${1001 + i}`,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      amount: (Math.random() * 500 + 100).toFixed(2),
      status: ["Completed", "Pending", "Processing"][Math.floor(Math.random() * 3)],
    })
  }

  list.innerHTML = orders
    .map(
      (order) => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <div class="order-id">${order.id}</div>
                    <div class="order-date">${order.date}</div>
                </div>
                <div>
                    <div class="order-amount">$${order.amount}</div>
                    <div class="order-status">${order.status}</div>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function openProductModal(productId) {
  const products = JSON.parse(localStorage.getItem("products")) || []
  const product = products.find((p) => p.id === productId)

  if (!product) return

  const html = `
        <div style="padding: 32px;">
            <img src="${product.images[0]}" style="width: 100%; border-radius: 12px; margin-bottom: 16px;">
            <h2 style="font-size: 20px; margin-bottom: 8px;">${product.name}</h2>
            <div style="font-size: 24px; color: var(--accent); font-weight: 700; margin-bottom: 16px;">$${product.price}</div>
            <p style="color: var(--text-secondary); margin-bottom: 16px;">${product.description}</p>
            <div style="background: var(--secondary); padding: 16px; border-radius: 8px;">
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">Views: <strong>${product.viewCount || 0}</strong></div>
                <div style="font-size: 12px; color: var(--text-secondary);">Available: <strong>${product.quantity}</strong></div>
            </div>
        </div>
    `

  document.getElementById("productDetailsContainer").innerHTML = html
  document.getElementById("productModal").classList.add("active")
}

document.getElementById("closeProductModal").addEventListener("click", () => {
  document.getElementById("productModal").classList.remove("active")
})

document.getElementById("productModal").addEventListener("click", function (e) {
  if (e.target === this) this.classList.remove("active")
})

document.addEventListener("DOMContentLoaded", loadAnalytics)
