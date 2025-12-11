let currentEditProductId = null

function checkAuth() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) {
    window.location.href = "login.html"
    return null
  }
  if (currentUser.role !== "vendor") {
    alert("Only vendors can access inventory")
    window.location.href = "index.html"
    return null
  }
  return currentUser
}

function loadInventory() {
  const currentUser = checkAuth()
  if (!currentUser) return

  const products = JSON.parse(localStorage.getItem("products")) || []
  const vendorProducts = products.filter((p) => p.vendorId === currentUser.id)

  const grid = document.getElementById("productsGrid")

  if (vendorProducts.length === 0) {
    grid.innerHTML = `
            <div class="empty-inventory" style="grid-column: 1/-1;">
                <div class="empty-icon">📦</div>
                <p class="empty-text">No products listed yet. Click the + button to add your first product!</p>
            </div>
        `
    return
  }

  grid.innerHTML = vendorProducts
    .map(
      (product, index) => `
        <div class="product-card">
            <img src="${product.images[0]}" alt="${product.name}" class="product-image">
            <div class="product-card-body">
                <div class="product-card-name">${product.name}</div>
                <div class="product-card-price">$${product.price}</div>
                <div class="product-card-info">Qty: ${product.quantity}</div>
                <div class="product-card-info">Views: ${product.viewCount || 0}</div>
                <!-- video badge is now clickable to open video viewer -->
                ${product.videoUrl ? `<div class="product-card-info" style="cursor: pointer;" onclick="initVideoViewer(${JSON.stringify([product]).replace(/"/g, "&quot;")}, 0)">🎥 View Video</div>` : ""}
                <div class="product-card-actions">
                    <button class="edit-btn" onclick="openEditModal(${product.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

// Add Product Modal
document.getElementById("addProductBtn").addEventListener("click", () => {
  document.getElementById("addProductModal").classList.add("active")
})

document.getElementById("closeAddProductModal").addEventListener("click", () => {
  document.getElementById("addProductModal").classList.remove("active")
})

document.getElementById("cancelAddBtn").addEventListener("click", () => {
  document.getElementById("addProductModal").classList.remove("active")
})

document.addEventListener("DOMContentLoaded", () => {
  // Drag and drop for images
  const imageUpload = document.querySelector(".image-upload")
  if (imageUpload) {
    imageUpload.addEventListener("dragover", (e) => {
      e.preventDefault()
      imageUpload.style.borderColor = "var(--primary)"
      imageUpload.style.background = "rgba(28, 110, 242, 0.1)"
    })
    imageUpload.addEventListener("dragleave", (e) => {
      e.preventDefault()
      imageUpload.style.borderColor = "var(--border)"
      imageUpload.style.background = "transparent"
    })
    imageUpload.addEventListener("drop", (e) => {
      e.preventDefault()
      if (e.dataTransfer.files[0]) {
        document.getElementById("productImage").files = e.dataTransfer.files
      }
      imageUpload.style.borderColor = "var(--border)"
      imageUpload.style.background = "transparent"
    })
  }
})

document.getElementById("addProductForm").addEventListener("submit", (e) => {
  e.preventDefault()

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const products = JSON.parse(localStorage.getItem("products")) || []

  const newProduct = {
    id: Math.max(...products.map((p) => p.id), 0) + 1,
    name: document.getElementById("productName").value,
    price: Number.parseFloat(document.getElementById("productPrice").value),
    category: document.getElementById("productCategory").value,
    description: document.getElementById("productDescription").value,
    color: document.getElementById("productColor").value,
    location: document.getElementById("productLocation").value,
    quantity: Number.parseInt(document.getElementById("productQuantity").value),
    images: ["/placeholder.svg?key=default"],
    vendorId: currentUser.id,
    rating: 0,
    reviews: 0,
    viewCount: 0,
    likes: 0,
    comments: [],
    videoUrl: null,
  }

  // Handle image upload
  const fileInput = document.getElementById("productImage")
  if (fileInput.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newProduct.images[0] = e.target.result

      const videoInput = document.getElementById("productVideo")
      if (videoInput.files[0]) {
        const videoReader = new FileReader()
        videoReader.onload = (ve) => {
          newProduct.videoUrl = ve.target.result
          products.push(newProduct)
          localStorage.setItem("products", JSON.stringify(products))
          alert("Product added successfully!")
          document.getElementById("addProductForm").reset()
          document.getElementById("addProductModal").classList.remove("active")
          loadInventory()
        }
        videoReader.readAsDataURL(videoInput.files[0])
      } else {
        products.push(newProduct)
        localStorage.setItem("products", JSON.stringify(products))
        alert("Product added successfully!")
        document.getElementById("addProductForm").reset()
        document.getElementById("addProductModal").classList.remove("active")
        loadInventory()
      }
    }
    reader.readAsDataURL(fileInput.files[0])
  } else {
    products.push(newProduct)
    localStorage.setItem("products", JSON.stringify(products))
    alert("Product added successfully!")
    document.getElementById("addProductForm").reset()
    document.getElementById("addProductModal").classList.remove("active")
    loadInventory()
  }
})

// Edit Product Modal
function openEditModal(productId) {
  currentEditProductId = productId
  const products = JSON.parse(localStorage.getItem("products")) || []
  const product = products.find((p) => p.id === productId)

  if (!product) return

  document.getElementById("editProductName").value = product.name
  document.getElementById("editProductDescription").value = product.description
  document.getElementById("editProductColor").value = product.color
  document.getElementById("editProductPrice").value = product.price
  document.getElementById("editProductQuantity").value = product.quantity
  document.getElementById("editProductCategory").value = product.category
  document.getElementById("editProductLocation").value = product.location
  document.getElementById("editViewCount").textContent = product.viewCount || 0

  document.getElementById("editProductModal").classList.add("active")
}

document.getElementById("closeEditProductModal").addEventListener("click", () => {
  document.getElementById("editProductModal").classList.remove("active")
})

document.getElementById("cancelEditBtn").addEventListener("click", () => {
  document.getElementById("editProductModal").classList.remove("active")
})

document.getElementById("editProductForm").addEventListener("submit", (e) => {
  e.preventDefault()

  const products = JSON.parse(localStorage.getItem("products")) || []
  const productIndex = products.findIndex((p) => p.id === currentEditProductId)

  if (productIndex !== -1) {
    products[productIndex].name = document.getElementById("editProductName").value
    products[productIndex].description = document.getElementById("editProductDescription").value
    products[productIndex].color = document.getElementById("editProductColor").value
    products[productIndex].price = Number.parseFloat(document.getElementById("editProductPrice").value)
    products[productIndex].quantity = Number.parseInt(document.getElementById("editProductQuantity").value)
    products[productIndex].category = document.getElementById("editProductCategory").value
    products[productIndex].location = document.getElementById("editProductLocation").value

    localStorage.setItem("products", JSON.stringify(products))
    alert("Product updated successfully!")
    document.getElementById("editProductModal").classList.remove("active")
    loadInventory()
  }
})

function deleteProduct(productId) {
  if (confirm("Are you sure you want to delete this product?")) {
    const products = JSON.parse(localStorage.getItem("products")) || []
    const filtered = products.filter((p) => p.id !== productId)
    localStorage.setItem("products", JSON.stringify(filtered))
    alert("Product deleted successfully!")
    document.getElementById("editProductModal").classList.remove("active")
    loadInventory()
  }
}

document.getElementById("deleteProductBtn").addEventListener("click", () => {
  if (currentEditProductId) {
    deleteProduct(currentEditProductId)
  }
})

// Modal close on ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.getElementById("addProductModal").classList.remove("active")
    document.getElementById("editProductModal").classList.remove("active")
  }
})

// Close modal on outside click
document.getElementById("addProductModal").addEventListener("click", function (e) {
  if (e.target === this) {
    this.classList.remove("active")
  }
})

document.getElementById("editProductModal").addEventListener("click", function (e) {
  if (e.target === this) {
    this.classList.remove("active")
  }
})

document.addEventListener("DOMContentLoaded", () => {
  loadInventory()
  // Declare or import updateVendorMenu here if necessary
  // For example: const updateVendorMenu = () => { /* implementation */ }
  // updateVendorMenu()
})

// Function to initialize video viewer
function initVideoViewer(product, index) {
  // Implementation for video viewer
  console.log("Video viewer initialized for product:", product, "at index:", index)
}
