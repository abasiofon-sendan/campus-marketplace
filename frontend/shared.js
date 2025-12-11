// Shared utilities and reusable components
const SHARED_UTILS = {
  // Create universal navbar for all pages
  createNavbar(currentPage = "home") {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    const cart = JSON.parse(localStorage.getItem("cart")) || []
    const wallet = JSON.parse(localStorage.getItem("wallet")) || {}

    const navbarHTML = `
      <nav class="navbar">
        <div class="navbar-content">
          <div class="navbar-left">
            <a href="index.html" class="logo" title="Back to home">
              <span class="logo-icon">↑</span>
              <span class="logo-text">Upstart</span>
            </a>
          </div>
          ${
            currentPage !== "chat" && currentPage !== "chat-full"
              ? `
            <div class="navbar-center">
              <div class="search-bar">
                <input type="text" id="searchInput" placeholder="Search products..." class="search-input">
                <span class="search-icon">🔍</span>
              </div>
            </div>
          `
              : ""
          }
          <div class="navbar-right">
            ${
              currentPage !== "chat" && currentPage !== "chat-full"
                ? `
              <div class="navbar-item wallet-item">
                <a href="wallet.html" class="nav-link" title="Wallet">
                  💰 <span class="wallet-balance" id="walletBalance">$${wallet.balance || 0}</span>
                </a>
              </div>
              <div class="navbar-item">
                <a href="cart.html" class="nav-link" title="Cart">
                  🛒 <span class="badge" id="cartBadge">${cart.length}</span>
                </a>
              </div>
              <div class="navbar-item notifications">
                <button class="nav-button notifications-btn" id="notificationsBtn" title="Notifications">
                  🔔 <span class="badge" id="notificationsBadge">0</span>
                </button>
                <div class="notifications-dropdown" id="notificationsDropdown">
                  <div class="notifications-list" id="notificationsList">
                    <p class="empty-notifications">No notifications</p>
                  </div>
                </div>
              </div>
            `
                : ""
            }
            <div class="navbar-item profile">
              <button class="nav-button profile-btn" id="profileBtn" title="Profile">
                👤
              </button>
              <div class="profile-dropdown" id="profileDropdown">
                <a href="profile.html" class="dropdown-item">View Profile</a>
                ${
                  currentUser && currentUser.role === "vendor"
                    ? `
                  <a href="inventory.html" class="dropdown-item">My Inventory</a>
                  <a href="analytics.html" class="dropdown-item">Analytics</a>
                `
                    : ""
                }
                <a href="chat.html" class="dropdown-item">Messages</a>
                <a href="leaderboard.html" class="dropdown-item">Leaderboard</a>
                <a href="#" class="dropdown-item logout-item" id="logoutBtn">Logout</a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    `
    return navbarHTML
  },

  // Initialize shared event listeners
  initializeSharedListeners() {
    document.addEventListener("click", (e) => {
      const profileBtn = document.getElementById("profileBtn")
      const profileDropdown = document.getElementById("profileDropdown")
      const notificationsBtn = document.getElementById("notificationsBtn")
      const notificationsDropdown = document.getElementById("notificationsDropdown")

      if (profileBtn && profileBtn.contains(e.target)) {
        profileDropdown?.classList.toggle("active")
        notificationsDropdown?.classList.remove("active")
      } else if (notificationsBtn && notificationsBtn.contains(e.target)) {
        notificationsDropdown?.classList.toggle("active")
        profileDropdown?.classList.remove("active")
      } else {
        profileDropdown?.classList.remove("active")
        notificationsDropdown?.classList.remove("active")
      }
    })

    const logoutBtn = document.getElementById("logoutBtn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault()
        localStorage.removeItem("currentUser")
        window.location.href = "login.html"
      })
    }
  },
}
