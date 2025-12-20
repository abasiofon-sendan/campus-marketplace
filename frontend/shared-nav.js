// Shared navigation component for all pages
 async function initializeNavigation() {
  const authToken = JSON.parse(localStorage.getItem("authToken"));
  if(!authToken) return;
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


  // Only create navbar if it doesn't exist
  if (document.querySelector(".navbar")) {
    initializeNavbarEvents()
    return
  }

  // Create navbar HTML
  const navHTML = `
    <nav class="navbar">
      <div class="navbar-content">
        <div class="navbar-left">
          <button class="mobile-menu-btn" id="mobileMenuBtn" title="Menu">
            ☰
          </button>
          <a href="index.html" class="logo" title="Home">
            <span class="logo-icon">↑</span>
            <span class="logo-text">Upstart</span>
          </a>
        </div>

        <div class="navbar-center">
          <div class="search-bar">
            <input 
              type="text" 
              id="sharedSearchInput" 
              placeholder="Search products..."
              class="search-input"
            >
            <span class="search-icon">🔍</span>
          </div>
        </div>

        <div class="navbar-right">
          <div class="navbar-item auth" id="authControls" style="display:none;">
            <!-- Auth controls (Login / Signup) will be injected here -->
          </div>
          <div class="navbar-item desktop-only">
            <a href="leaderboard.html" class="nav-link" title="Leaderboard">
              🏆 <span class="nav-text">Leaderboard</span>
            </a>
          </div>
          <div class="navbar-item desktop-only">
            <a href="analytics.html" class="nav-link vendor-only" style="display:none;" id="analyticsLink" title="Analytics">
              📊 <span class="nav-text">Analytics</span>
            </a>
          </div>
          <div class="navbar-item wallet-item">
            <a href="wallet.html" class="nav-link" title="Wallet">
              💰 <span class="wallet-balance" id="walletBalance">$0</span>
            </a>
          </div>
          <div class="navbar-item">
            <a href="cart.html" class="nav-link" title="Cart">
              🛒 <span class="badge" id="cartBadge">0</span>
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
          <div class="navbar-item profile desktop-only">
            <button class="nav-button profile-btn" id="profileBtn" title="Profile">
              👤
            </button>
            <div class="profile-dropdown" id="profileDropdown">
              <a href="profile.html" class="dropdown-item">View Profile</a>
              <a href="inventory.html" class="dropdown-item vendor-only" style="display:none;" id="inventoryLink">My Inventory</a>
              <a href="chat.html" class="dropdown-item">Messages</a>
              <a href="#" class="dropdown-item logout-item" id="logoutBtn">Logout</a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mobile Menu Dropdown -->
      <div class="mobile-menu-dropdown" id="mobileMenuDropdown">
        <a href="profile.html" class="mobile-menu-item">
          <span>👤</span>
          <span>Profile</span>
        </a>
        <a href="leaderboard.html" class="mobile-menu-item">
          <span>🏆</span>
          <span>Leaderboard</span>
        </a>
        <a href="analytics.html" class="mobile-menu-item vendor-only" style="display:none;" id="mobileAnalyticsLink">
          <span>📊</span>
          <span>Analytics</span>
        </a>
        <a href="inventory.html" class="mobile-menu-item vendor-only" style="display:none;" id="mobileInventoryLink">
          <span>📦</span>
          <span>My Inventory</span>
        </a>
        <a href="chat.html" class="mobile-menu-item">
          <span>💬</span>
          <span>Messages</span>
        </a>
        <a href="#" class="mobile-menu-item" id="mobileLogoutBtn">
          <span>🚪</span>
          <span>Logout</span>
        </a>
      </div>
    </nav>
  `

  // Insert navbar at the beginning of body
  const parser = new DOMParser()
  const navElement = parser.parseFromString(navHTML, "text/html").body.firstChild
  document.body.insertBefore(navElement, document.body.firstChild)

  // Initialize navbar functionality
  initializeNavbarEvents()
}

function initializeNavbarEvents() {
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const mobileMenuDropdown = document.getElementById("mobileMenuDropdown")
  
  if (mobileMenuBtn && mobileMenuDropdown) {
    mobileMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      mobileMenuDropdown.classList.toggle("active")
    })
  }

  // Profile dropdown
  const profileBtn = document.getElementById("profileBtn")
  if (profileBtn) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      const profileItem = document.querySelector(".navbar-item.profile")
      if (profileItem) profileItem.classList.toggle("active")
    })
  }

  // Notifications dropdown
  const notificationsBtn = document.getElementById("notificationsBtn")
  if (notificationsBtn) {
    notificationsBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      const notifItem = document.querySelector(".navbar-item.notifications")
      if (notifItem) notifItem.classList.toggle("active")
    })
  }

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".navbar-item") && !e.target.closest(".mobile-menu-btn")) {
      document.querySelectorAll(".navbar-item").forEach((item) => item.classList.remove("active"))
      if (mobileMenuDropdown) mobileMenuDropdown.classList.remove("active")
    }
  })

  // Logout (desktop)
  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()
      localStorage.setItem("authToken", JSON.stringify(null))
      window.location.href = "login.html"
    })
  }

  // Logout (mobile)
  const mobileLogoutBtn = document.getElementById("mobileLogoutBtn")
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener("click", (e) => {
      e.preventDefault()
      localStorage.setItem("authToken", JSON.stringify(null))
      window.location.href = "login.html"
    })
  }

  // Update vendor menu visibility
  updateVendorMenu()
  updateWalletBalance()
  updateCartBadge()
  updateNotifications()
  // Update auth controls (show login/signup when not logged in)
  updateAuthControls()
}

function updateAuthControls() {
  const currentUser = JSON.parse(localStorage.getItem("authToken"))

  const authControls = document.getElementById("authControls")
  const navbarItems = Array.from(document.querySelectorAll('.navbar-right > .navbar-item'))
  const mobileMenu = document.getElementById('mobileMenuDropdown')

  if (!authControls) return

  if (!currentUser) {
    // Hide desktop and mobile items except the auth container
    navbarItems.forEach((el) => {
      if (el.id !== 'authControls') el.style.display = 'none'
    })

    // Populate auth controls with Login / Signup buttons
    authControls.innerHTML = `
      <a href="login.html" class="nav-link">Login</a>
      <a href="signup.html" class="nav-link" style="margin-left:12px;">Signup</a>
    `
    authControls.style.display = 'flex'

    // Mobile menu: hide existing items and show login/signup
    if (mobileMenu) {
      Array.from(mobileMenu.querySelectorAll('.mobile-menu-item')).forEach((el) => el.style.display = 'none')
      // add mobile auth items if not already present
      if (!document.getElementById('mobileLoginItem')) {
        const loginItem = document.createElement('a')
        loginItem.className = 'mobile-menu-item'
        loginItem.id = 'mobileLoginItem'
        loginItem.href = 'login.html'
        loginItem.innerHTML = `<span>🔑</span><span>Login</span>`
        mobileMenu.insertBefore(loginItem, mobileMenu.firstChild)

        const signupItem = document.createElement('a')
        signupItem.className = 'mobile-menu-item'
        signupItem.id = 'mobileSignupItem'
        signupItem.href = 'signup.html'
        signupItem.innerHTML = `<span>✍️</span><span>Signup</span>`
        mobileMenu.insertBefore(signupItem, mobileMenu.firstChild)
      }
      // ensure mobile auth items are visible
      const mobiLogin = document.getElementById('mobileLoginItem')
      const mobiSignup = document.getElementById('mobileSignupItem')
      if (mobiLogin) mobiLogin.style.display = 'flex'
      if (mobiSignup) mobiSignup.style.display = 'flex'
    }
  } else {
    // Logged in: show regular items (clear any inline hides)
    navbarItems.forEach((el) => {
      // restore display: let CSS control layout; default to inline-flex for authControls
      el.style.display = ''
    })
    // hide auth-controls container
    authControls.style.display = 'none'

    // Mobile menu: remove mobileLogin/mobileSignup or hide them
    if (mobileMenu) {
      const mobiLogin = document.getElementById('mobileLoginItem')
      const mobiSignup = document.getElementById('mobileSignupItem')
      if (mobiLogin) mobiLogin.style.display = 'none'
      if (mobiSignup) mobiSignup.style.display = 'none'
      // ensure mobile logout is visible only if logged in
      const mobileLogout = document.getElementById('mobileLogoutBtn')
      if (mobileLogout) mobileLogout.style.display = 'flex'
    }
  }
}

function updateVendorMenu() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const inventoryLink = document.getElementById("inventoryLink")
  const analyticsLink = document.getElementById("analyticsLink")
  const mobileInventoryLink = document.getElementById("mobileInventoryLink")
  const mobileAnalyticsLink = document.getElementById("mobileAnalyticsLink")

  if (currentUser && currentUser.role === "vendor") {
    if (inventoryLink) inventoryLink.style.display = "block"
    if (analyticsLink) analyticsLink.style.display = "block"
    if (mobileInventoryLink) mobileInventoryLink.style.display = "flex"
    if (mobileAnalyticsLink) mobileAnalyticsLink.style.display = "flex"
  } else {
    if (inventoryLink) inventoryLink.style.display = "none"
    if (analyticsLink) analyticsLink.style.display = "none"
    if (mobileInventoryLink) mobileInventoryLink.style.display = "none"
    if (mobileAnalyticsLink) mobileAnalyticsLink.style.display = "none"
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

async function updateCartBadge() {
  try{
    const response = await fetch('',
      {
        method: "GET",
        headers: {
          "Content-Type":"application/json",
          "Authorization": `Bearer ${authToken.access}`,
        }
      }
    )

    const cart = await response.json();
    const badge = document.getElementById("cartBadge");
    badge.textContent = cart.length;
  }catch(error){
    console.log(error);
  }

}

function updateNotifications() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) return

  const notifications = JSON.parse(localStorage.getItem("notifications")) || []
  const userNotifications = notifications.filter((n) => n.userId === currentUser.id)
  const unreadCount = userNotifications.filter((n) => !n.read).length

  const badge = document.getElementById("notificationsBadge")
  if (badge) {
    badge.textContent = unreadCount
  }

  const list = document.getElementById("notificationsList")
  if (list) {
    if (userNotifications.length === 0) {
      list.innerHTML = '<p class="empty-notifications">No notifications</p>'
    } else {
      list.innerHTML = userNotifications
        .map(
          (notif) => `
          <div class="notification-item" onclick="handleNotificationClick(${notif.id})">
            <p>${notif.message}</p>
            <span class="notification-time">${new Date(notif.date).toLocaleDateString()}</span>
          </div>
        `,
        )
        .join("")
    }
  }
}

function handleNotificationClick(notificationId) {
  const notifications = JSON.parse(localStorage.getItem("notifications")) || []
  const notif = notifications.find((n) => n.id === notificationId)
  if (notif) {
    notif.read = true
    localStorage.setItem("notifications", JSON.stringify(notifications))
    updateNotifications()
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeNavigation)
} else {
  initializeNavigation()
}

document.head.innerHTML += `
  <style>
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border);
      z-index: 100;
      padding: 12px 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      height: 70px;
    }
  </style>
`
