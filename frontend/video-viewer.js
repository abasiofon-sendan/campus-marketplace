let currentVideoIndex = 0
let allVideos = []

function initVideoViewer(videos, startIndex = 0) {
  allVideos = videos
  currentVideoIndex = startIndex
  openVideoViewer()
}

function openVideoViewer() {
  const modal = document.getElementById("videoViewerModal")
  if (!modal) createVideoViewerModal()

  const videoModal = document.getElementById("videoViewerModal")
  videoModal.classList.add("active")
  displayCurrentVideo()
}

function createVideoViewerModal() {
  const modal = document.createElement("div")
  modal.id = "videoViewerModal"
  modal.className = "video-viewer-modal"
  modal.innerHTML = `
    <div class="video-viewer-container">
      <!-- Video Player -->
      <div class="video-player-area">
        <video id="mainVideoPlayer" class="video-player" controls autoplay>
          <source src="/placeholder.svg" type="video/mp4">
        </video>
        <button class="video-nav-btn prev-btn" onclick="previousVideo()">❮</button>
        <button class="video-nav-btn next-btn" onclick="nextVideo()">❯</button>
        <button class="video-close-btn" onclick="closeVideoViewer()">✕</button>
      </div>

      <!-- Right Sidebar - Engagement -->
      <div class="video-sidebar">
        <div class="video-header">
          <h3 id="videoProductName"></h3>
        </div>

        <!-- Like Button -->
        <button class="video-action-btn" id="likeVideoBtn" onclick="toggleLikeVideo()">
          <span class="action-icon">❤️</span>
          <span class="action-count" id="videoLikeCount">0</span>
        </button>

        <!-- Comment Section -->
        <div class="comments-area">
          <h4>Comments</h4>
          <div class="comments-list" id="videoCommentsList">
            <!-- Comments will be loaded here -->
          </div>
        </div>

        <!-- Add Comment -->
        <div class="comment-input-area">
          <input type="text" id="videoCommentInput" placeholder="Add a comment..." class="video-comment-input">
          <button class="comment-submit-btn" onclick="submitVideoComment()">Post</button>
        </div>

        <!-- Video Stats -->
        <div class="video-stats-sidebar">
          <div class="stat-row">
            <span>Views:</span>
            <span id="videoViewCount">0</span>
          </div>
          <div class="stat-row">
            <span>Price:</span>
            <span id="videoPrice">$0</span>
          </div>
          <div class="stat-row">
            <span>Available:</span>
            <span id="videoQuantity">0</span>
          </div>
        </div>

        <!-- Add to Cart from Video -->
        <button class="video-add-to-cart-btn" onclick="addToCartFromVideo()">Add to Cart</button>
      </div>

      <!-- Video Counter -->
      <div class="video-counter">
        <span id="videoCounter">1 / 1</span>
      </div>
    </div>
  `
  document.body.appendChild(modal)
}

function displayCurrentVideo() {
  if (allVideos.length === 0) return

  const video = allVideos[currentVideoIndex]
  const player = document.getElementById("mainVideoPlayer")

  player.src = video.videoUrl
  document.getElementById("videoProductName").textContent = video.name
  document.getElementById("videoLikeCount").textContent = video.likes || 0
  document.getElementById("videoViewCount").textContent = video.viewCount || 0
  document.getElementById("videoPrice").textContent = `$${video.price}`
  document.getElementById("videoQuantity").textContent = video.quantity || 0
  document.getElementById("videoCounter").textContent = `${currentVideoIndex + 1} / ${allVideos.length}`

  // Update like button state
  const likeBtn = document.getElementById("likeVideoBtn")
  const userLikes = JSON.parse(localStorage.getItem("userVideoLikes")) || {}
  if (userLikes[video.id]) {
    likeBtn.classList.add("liked")
  } else {
    likeBtn.classList.remove("liked")
  }

  // Load comments
  loadVideoComments(video.id)

  // Increment view count
  video.viewCount = (video.viewCount || 0) + 1
  updateProductInStorage(video)
}

function loadVideoComments(productId) {
  const products = JSON.parse(localStorage.getItem("products")) || []
  const product = products.find((p) => p.id === productId)
  const commentsList = document.getElementById("videoCommentsList")

  if (!product || !product.comments || product.comments.length === 0) {
    commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first!</p>'
    return
  }

  commentsList.innerHTML = product.comments
    .map(
      (comment) => `
      <div class="comment-item-video">
        <div class="comment-author">${comment.author || comment.user || "Anonymous"}</div>
        <div class="comment-text">${comment.text}</div>
        <div class="comment-time">${comment.timestamp || new Date().toLocaleDateString()}</div>
      </div>
    `,
    )
    .join("")
}

function submitVideoComment() {
  const input = document.getElementById("videoCommentInput")
  const commentText = input.value.trim()

  if (!commentText) {
    alert("Please enter a comment")
    return
  }

  const video = allVideos[currentVideoIndex]
  const products = JSON.parse(localStorage.getItem("products")) || []
  const product = products.find((p) => p.id === video.id)

  if (product) {
    if (!product.comments) product.comments = []
    product.comments.push({
      author: "You",
      text: commentText,
      timestamp: new Date().toISOString(),
    })
    updateProductInStorage(product)
    input.value = ""
    loadVideoComments(product.id)
  }
}

function toggleLikeVideo() {
  const video = allVideos[currentVideoIndex]
  const userLikes = JSON.parse(localStorage.getItem("userVideoLikes")) || {}
  const likeBtn = document.getElementById("likeVideoBtn")

  if (userLikes[video.id]) {
    delete userLikes[video.id]
    video.likes = Math.max(0, (video.likes || 0) - 1)
    likeBtn.classList.remove("liked")
  } else {
    userLikes[video.id] = true
    video.likes = (video.likes || 0) + 1
    likeBtn.classList.add("liked")
  }

  localStorage.setItem("userVideoLikes", JSON.stringify(userLikes))
  document.getElementById("videoLikeCount").textContent = video.likes
  updateProductInStorage(video)
}

function nextVideo() {
  if (currentVideoIndex < allVideos.length - 1) {
    currentVideoIndex++
    displayCurrentVideo()
  }
}

function previousVideo() {
  if (currentVideoIndex > 0) {
    currentVideoIndex--
    displayCurrentVideo()
  }
}

function closeVideoViewer() {
  const modal = document.getElementById("videoViewerModal")
  if (modal) {
    modal.classList.remove("active")
  }
}

function addToCartFromVideo() {
  const video = allVideos[currentVideoIndex]
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const existingItem = cart.find((item) => item.productId === video.id)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({ productId: video.id, quantity: 1 })
  }

  localStorage.setItem("cart", JSON.stringify(cart))
  alert("Product added to cart!")
}

function updateProductInStorage(product) {
  const products = JSON.parse(localStorage.getItem("products")) || []
  const index = products.findIndex((p) => p.id === product.id)
  if (index !== -1) {
    products[index] = product
    localStorage.setItem("products", JSON.stringify(products))
  }
}

// Close modal on ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeVideoViewer()
  }
})

// Close modal on outside click
document.addEventListener("click", (e) => {
  const modal = document.getElementById("videoViewerModal")
  if (modal && e.target === modal) {
    closeVideoViewer()
  }
})
