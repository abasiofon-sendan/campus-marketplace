function renderCartItems() {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const products = JSON.parse(localStorage.getItem("products")) || []
  const list = document.getElementById("cartItemsList")

  if (cart.length === 0) {
    list.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <div class="empty-cart-text">Your cart is empty</div>
                <a href="index.html" style="color: var(--primary); text-decoration: none; font-weight: 600;">Continue Shopping</a>
            </div>
        `
    updateCartSummary()
    return
  }

  let html = ""
  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (!product) return

    const vendor = getVendor(product.vendorId)
    const itemTotal = product.price * item.quantity

    html += `
            <div class="cart-item" onclick="openProductModal(${product.id})">
                <img src="${product.images[0]}" alt="${product.name}" class="item-image">
                <div class="item-details">
                    <div>
                        <div class="item-name">${product.name}</div>
                        <div class="item-price">$${product.price}</div>
                        <div class="item-vendor">${vendor?.name || "Unknown"}</div>
                    </div>
                </div>
                <div class="item-actions">
                    <div class="quantity-control" onclick="event.stopPropagation()">
                        <!-- Allow custom quantity input for individual items -->
                        <button class="quantity-btn" onclick="updateQuantity(${product.id}, -1)">−</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" readonly>
                        <button class="quantity-btn" onclick="updateQuantity(${product.id}, 1)">+</button>
                    </div>
                    <div class="item-checkout" onclick="event.stopPropagation()">
                        <div class="item-total">$${itemTotal.toFixed(2)}</div>
                        <button class="checkout-item-btn" onclick="checkoutItem(${product.id})">Checkout Item</button>
                    </div>
                    <button class="remove-btn" onclick="event.stopPropagation(); removeFromCart(${product.id})">Remove</button>
                </div>
            </div>
        `
  })

  list.innerHTML = html
  updateCartSummary()
}

function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || []
  cart = cart.filter((item) => item.productId !== productId)
  localStorage.setItem("cart", JSON.stringify(cart))
  renderCartItems()
}

function updateQuantity(productId, change) {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const item = cart.find((item) => item.productId === productId)

  if (item) {
    item.quantity += change
    if (item.quantity <= 0) {
      removeFromCart(productId)
    } else {
      localStorage.setItem("cart", JSON.stringify(cart))
      renderCartItems()
    }
  }
}

function updateCartSummary() {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const products = JSON.parse(localStorage.getItem("products")) || []

  let subtotal = 0
  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (product) {
      subtotal += product.price * item.quantity
    }
  })

  const shipping = cart.length > 0 ? 5 : 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`
  document.getElementById("shipping").textContent = `$${shipping.toFixed(2)}`
  document.getElementById("tax").textContent = `$${tax.toFixed(2)}`
  document.getElementById("total").textContent = `$${total.toFixed(2)}`
}

function getVendor(vendorId) {
  const vendors = JSON.parse(localStorage.getItem("vendors")) || []
  return vendors.find((v) => v.id === vendorId)
}

function openProductModal(productId) {
  const products = JSON.parse(localStorage.getItem("products")) || []
  const product = products.find((p) => p.id === productId)

  if (!product) return

  const vendor = getVendor(product.vendorId)

  const html = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
                <img src="${product.images[0]}" style="width: 100%; border-radius: 8px;">
            </div>
            <div>
                <h3 style="font-size: 20px; margin-bottom: 12px;">${product.name}</h3>
                <div style="font-size: 24px; color: var(--accent); font-weight: 700; margin-bottom: 16px;">$${product.price}</div>
                <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">${product.description}</p>
                <div style="background: var(--secondary); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Color: <strong>${product.color}</strong></div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Location: <strong>${product.location}</strong></div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Available: <strong>${product.quantity}</strong></div>
                </div>
                <div style="background: var(--secondary); padding: 12px; border-radius: 8px;">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">Seller</div>
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${vendor?.name || "Unknown"}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${vendor?.email || "N/A"}</div>
                </div>
            </div>
        </div>
    `

  document.getElementById("productDetailsContainer").innerHTML = html
  document.getElementById("productModal").classList.add("active")
}

function checkoutItem(productId) {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const products = JSON.parse(localStorage.getItem("products")) || []
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users")) || []

  const cartItem = cart.find((item) => item.productId === productId)
  if (!cartItem) {
    alert("Item not found in cart")
    return
  }

  const product = products.find((p) => p.id === productId)
  if (!product) return

  const userIndex = users.findIndex((u) => u.id === currentUser.id)
  if (userIndex === -1) return

  const itemTotal = product.price * cartItem.quantity
  const balance = users[userIndex].walletBalance || 0

  if (balance < itemTotal) {
    alert(`Insufficient wallet balance. You need $${itemTotal.toFixed(2)} but have $${balance.toFixed(2)}`)
    return
  }

  // Deduct from wallet
  users[userIndex].walletBalance = balance - itemTotal
  localStorage.setItem("users", JSON.stringify(users))

  // Create transaction
  const transaction = {
    userId: currentUser.id,
    type: "debit",
    amount: itemTotal,
    description: `Checkout: ${product.name} (Qty: ${cartItem.quantity})`,
    date: new Date().toISOString(),
  }

  const transactions = JSON.parse(localStorage.getItem("transactions")) || []
  transactions.push(transaction)
  localStorage.setItem("transactions", JSON.stringify(transactions))

  // Remove from cart
  removeFromCart(productId)

  // Add notifications
  const notifications = JSON.parse(localStorage.getItem("notifications")) || []
  notifications.push({
    id: Date.now(),
    userId: product.vendorId,
    type: "payment",
    message: `Payment received for ${product.name}. Confirm product delivery.`,
    read: false,
    date: new Date().toISOString(),
  })
  localStorage.setItem("notifications", JSON.stringify(notifications))

  alert(`Payment of $${itemTotal.toFixed(2)} successful! Order placed.`)
  updateCartBadge()
  updateWalletBalance()
  renderCartItems()
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const badge = document.getElementById("cartBadge")
  if (badge) {
    badge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0)
  }
}

function updateWalletBalance() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const balanceEl = document.getElementById("walletBalance")
  if (!balanceEl) return

  if (!currentUser) {
    balanceEl.textContent = "$0"
    return
  }

  const users = JSON.parse(localStorage.getItem("users")) || []
  const user = users.find((u) => u.id === currentUser.id)
  if (user) {
    balanceEl.textContent = `$${user.walletBalance || 0}`
  }
}

document.getElementById("closeProductModal").addEventListener("click", () => {
  document.getElementById("productModal").classList.remove("active")
})

document.getElementById("productModal").addEventListener("click", function (e) {
  if (e.target === this) {
    this.classList.remove("active")
  }
})

document.getElementById("checkoutAllBtn").addEventListener("click", () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  if (cart.length === 0) {
    alert("Your cart is empty")
    return
  }

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users")) || []
  const userIndex = users.findIndex((u) => u.id === currentUser.id)

  if (userIndex !== -1) {
    const products = JSON.parse(localStorage.getItem("products")) || []
    let totalAmount = 0

    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (product) {
        totalAmount += product.price * item.quantity
      }
    })

    const balance = users[userIndex].walletBalance || 0
    if (balance < totalAmount) {
      alert("Insufficient wallet balance. Please add money to your wallet.")
      return
    }

    // Deduct from wallet
    users[userIndex].walletBalance = balance - totalAmount

    // Create transaction
    const transaction = {
      userId: currentUser.id,
      type: "debit",
      amount: totalAmount,
      description: "Checkout All Items",
      date: new Date().toISOString(),
    }

    const transactions = JSON.parse(localStorage.getItem("transactions")) || []
    transactions.push(transaction)

    localStorage.setItem("users", JSON.stringify(users))
    localStorage.setItem("transactions", JSON.stringify(transactions))

    // Add notifications for each product vendor
    const notifications = JSON.parse(localStorage.getItem("notifications")) || []
    const notifiedVendors = new Set()

    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (product && !notifiedVendors.has(product.vendorId)) {
        notifications.push({
          id: Date.now() + Math.random(),
          userId: product.vendorId,
          type: "payment",
          message: "Payment received. Confirm product delivery.",
          read: false,
          date: new Date().toISOString(),
        })
        notifiedVendors.add(product.vendorId)
      }
    })

    localStorage.setItem("notifications", JSON.stringify(notifications))
    localStorage.setItem("cart", JSON.stringify([]))

    alert("Checkout successful! All orders have been placed.")
    updateWalletBalance()
    updateCartBadge()
    renderCartItems()
  }
})

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) {
    window.location.href = "login.html"
  }
  renderCartItems()
  updateWalletBalance()
})
