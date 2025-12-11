let currentConversationId = null

document.addEventListener("DOMContentLoaded", () => {
  const profileBtn = document.getElementById("profileBtn")
  if (profileBtn) {
    profileBtn.addEventListener("click", () => {
      document.querySelector(".navbar-item.profile").classList.toggle("active")
    })
  }

  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()
      localStorage.removeItem("currentUser")
      window.location.href = "login.html"
    })
  }
})

function initializeDummyConversations() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const messages = JSON.parse(localStorage.getItem("messages")) || []

  // Only add dummy data if no messages exist
  if (messages.length === 0) {
    const dummyConversations = [
      {
        fromId: currentUser.id,
        toId: 101,
        text: "Hi! Is the MacBook still available?",
        date: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        fromId: 101,
        toId: currentUser.id,
        text: "Yes, it's available! Great condition, barely used.",
        date: new Date(Date.now() - 3300000).toISOString(),
      },
      {
        fromId: currentUser.id,
        toId: 101,
        text: "Perfect! When can I pick it up?",
        date: new Date(Date.now() - 3000000).toISOString(),
      },
      {
        fromId: currentUser.id,
        toId: 102,
        text: "Are all the textbooks in good condition?",
        date: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        fromId: 102,
        toId: currentUser.id,
        text: "No highlighting or damage. Like new!",
        date: new Date(Date.now() - 6900000).toISOString(),
      },
      {
        fromId: currentUser.id,
        toId: 103,
        text: "Does the jacket fit true to size?",
        date: new Date(Date.now() - 10800000).toISOString(),
      },
      {
        fromId: 103,
        toId: currentUser.id,
        text: "Yes, it's true to size. I'm medium and it fits perfectly!",
        date: new Date(Date.now() - 10500000).toISOString(),
      },
    ]
    localStorage.setItem("messages", JSON.stringify(dummyConversations))
  }
}

function initializeChat() {
  if (!localStorage.getItem("messages")) {
    localStorage.setItem("messages", JSON.stringify([]))
  }
  initializeDummyConversations()
  loadConversations()
}

function getConversations() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const messages = JSON.parse(localStorage.getItem("messages")) || []

  // Group messages by conversation
  const conversations = {}
  messages.forEach((msg) => {
    const participantId = msg.fromId === currentUser.id ? msg.toId : msg.fromId
    if (!conversations[participantId]) {
      conversations[participantId] = []
    }
    conversations[participantId].push(msg)
  })

  return conversations
}

function loadConversations() {
  const conversations = getConversations()
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const users = JSON.parse(localStorage.getItem("users")) || []
  const vendors = JSON.parse(localStorage.getItem("vendors")) || []
  const list = document.getElementById("conversationsList")

  if (Object.keys(conversations).length === 0) {
    list.innerHTML =
      '<div style="padding: 20px; text-align: center; color: var(--text-secondary); font-size: 14px;">No conversations yet</div>'
    return
  }

  let html = ""
  Object.keys(conversations).forEach((participantId) => {
    const participant =
      users.find((u) => u.id === Number.parseInt(participantId)) ||
      vendors.find((v) => v.id === Number.parseInt(participantId))
    if (!participant) return

    const msgs = conversations[participantId]
    const lastMsg = msgs[msgs.length - 1]
    const lastMsgText = lastMsg.fromId === currentUser.id ? `You: ${lastMsg.text}` : lastMsg.text

    html += `
            <div class="conversation-item" onclick="openConversation(${participantId}, '${participant.username || participant.name}')">
                <img src="${participant.profilePicture || "/placeholder.svg?height=48&width=48"}" alt="${participant.username || participant.name}" class="conversation-avatar">
                <div class="conversation-info">
                    <div class="conversation-name">${participant.username || participant.name}</div>
                    <div class="conversation-last-message">${lastMsgText.substring(0, 40)}</div>
                </div>
            </div>
        `
  })

  list.innerHTML = html
}

function openConversation(participantId, participantName) {
  currentConversationId = participantId

  // Update UI
  document.querySelectorAll(".conversation-item").forEach((el) => el.classList.remove("active"))
  event.target.closest(".conversation-item").classList.add("active")

  document.getElementById("chatEmpty").style.display = "none"
  document.getElementById("chatView").style.display = "flex"
  document.getElementById("chatUserName").textContent = participantName

  loadMessages()
}

function loadMessages() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const messages = JSON.parse(localStorage.getItem("messages")) || []
  const list = document.getElementById("messagesList")

  const conversationMessages = messages.filter((msg) => {
    return (
      (msg.fromId === currentUser.id && msg.toId === currentConversationId) ||
      (msg.fromId === currentConversationId && msg.toId === currentUser.id)
    )
  })

  let html = ""
  conversationMessages.forEach((msg) => {
    const isSent = msg.fromId === currentUser.id
    html += `
            <div class="message ${isSent ? "sent" : "received"}">
                <div class="message-bubble">${msg.text}</div>
                <div class="message-time">${new Date(msg.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
        `
  })

  list.innerHTML = html
  list.scrollTop = list.scrollHeight
}

document.getElementById("sendBtn").addEventListener("click", () => {
  const input = document.getElementById("messageInput")
  const text = input.value.trim()

  if (!text || !currentConversationId) return

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const message = {
    id: Date.now(),
    fromId: currentUser.id,
    toId: currentConversationId,
    text: text,
    date: new Date().toISOString(),
  }

  const messages = JSON.parse(localStorage.getItem("messages")) || []
  messages.push(message)
  localStorage.setItem("messages", JSON.stringify(messages))

  input.value = ""
  loadMessages()
})

document.getElementById("messageInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("sendBtn").click()
  }
})

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) {
    window.location.href = "login.html"
  }
  
  // Sidebar toggle for mobile
  const sidebarToggleBtn = document.getElementById("sidebarToggleBtn")
  const sidebar = document.querySelector(".sidebar")
  const chatContainer = document.querySelector(".chat-container")
  
  console.log("sidebarToggleBtn:", sidebarToggleBtn)
  console.log("sidebar:", sidebar)
  console.log("chatContainer:", chatContainer)
  
  const toggleSidebar = () => {
    console.log("Toggle clicked!")
    sidebar.classList.toggle("open")
    chatContainer.classList.toggle("sidebar-open")
  }
  
  if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener("click", toggleSidebar)
    console.log("Event listener added to sidebarToggleBtn")
  }
  
  // Close sidebar when clicking on a conversation
  const conversationItems = document.querySelectorAll(".conversation-item")
  conversationItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (sidebar && window.innerWidth <= 768) {
        sidebar.classList.remove("open")
        chatContainer.classList.remove("sidebar-open")
      }
    })
  })
  
  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains("open")) {
      if (!e.target.closest(".sidebar") && !e.target.closest(".sidebar-toggle-btn")) {
        sidebar.classList.remove("open")
        chatContainer.classList.remove("sidebar-open")
      }
    }
  })
  
  initializeChat()
})
