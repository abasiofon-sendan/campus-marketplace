"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { mockProducts } from "@/lib/mock-data"
import { Plus, Edit, Trash2, Package } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

const categories: Category[] = ["Electronics", "Fashion", "Books", "Food", "Services", "Other"]

export default function VendorProductsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [uploadedImages, setUploadedImages] =  useState<string[]>([])
  const [uploadedImageFiles, setUploadedImageFiles] = useState<File[]>([])
  const [productName, setProductName] = useState("")
  const [productDescription, setProductDescription] = useState("")
  const [productPrice, setProductPrice] = useState("")
  const [productStock, setProductStock] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category | "">("")
  const [rating, setRating] = useState<number>(0)

  

  if (!user) {
    router.push("/signin")
    return null
  }

  if (user.role !== "vendor") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Only vendors can access product management.</p>
          <Link href="/">
            <Button>Go to Homepage</Button>
          </Link>
        </main>
      </div>
    )
  }

  const vendorProducts = mockProducts.filter((p) => p.vendorId === user.id)


  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log({productName, productDescription,   selectedCategory, uploadedImages, rating});


    const formData = new FormData()

    uploadedImageFiles.forEach((file) => {
      formData.append("image_url", file)
    })
    formData.append("product_name", productName)
    formData.append("description", productDescription)
    formData.append("price", productPrice)
    formData.append("quantity", productStock)
    formData.append("category", selectedCategory)
    formData.append("rating", rating.toString())

    e.preventDefault()  
    const token = localStorage.getItem("token") || ""

    // Basic client validation
    if (!productName.trim()) {
      toast({ title: "Missing name", description: "Please provide a product name.", variant: "destructive" })
      return
    }

    const price = parseFloat(formData.get("price") as string || "0")
    const quantity = parseInt(formData.get("quantity") as string || "0", 10)
    try {
      const response = await fetch("https://market-api-5lg1.onrender.com/products/create-product", {
        method: "POST",
        headers: {
          // "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Product added",
          description: "Your new product has been added successfully.",
        })
        setIsDialogOpen(false)
        setEditingProduct(null)
        setUploadedImages([])
        // reset form states
        setProductName("")
        setProductDescription("")
        setProductPrice("")
        setProductStock("")
        setSelectedCategory("")
        setRating(0)
      } else {
        const error = await response.json().catch(() => ({ message: "Unknown error" }))
        toast({
          title: "Error",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  // const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault()

  //   const formData = new FormData(e.currentTarget)
  //   const token = localStorage.getItem("token")

  //   try {
  //     const response = fetch("https://market-api-5lg1.onrender.com/products/create-product",{
  //       method: "POST",
  //       headers: {
  //         "Authorization": `Bearer ${token}`,
  //         'Content-Type': 'application/json',
          
  //     },
  //       body: JSON.stringify({
  //         name: formData.get("name"),
  //         description: formData.get("description"),
  //         price: parseFloat(formData.get("price") as string),
  //         stock: parseInt(formData.get("quantity") as string, 10),
  //         category: formData.get("category"),
  //         images: uploadedImages,
        
  //       }
  //       )
  //   })

  //   if (response.ok) {
  //     toast({
  //       title: "product added",
  //       description: "Your new product has been added successfully.",
  //     })
  //     setIsDialogOpen(false)
  //     setEditingProduct(null)
  //     setUploadedImages([])
  //   }else{
  //     const error = await response.json()
  //     toast({
  //       title: "Error",
  //       description: error.message || "Something went wrong. Please try again.",
  //       variant: "destructive",
  //     })
  //   }
  //     }
    
  //   catch (error) {
  //     console.error("Error saving product:", error)
  //     toast({
  //       title: "Error",
  //       description: "Something went wrong. Please try again.",
  //       variant: "destructive",
  //     })
  //   }
  // }
  //   toast({
  //     title: editingProduct ? "Product updated" : "Product added",
  //     description: editingProduct
  //       ? "Your product has been updated successfully."
  //       : "Your new product has been added successfully.",
  //   })
  //   setIsDialogOpen(false)
  //   setEditingProduct(null)
  //   setUploadedImages([])
  // }

  const handleDeleteProduct = (productId: string) => {
    toast({
      title: "Product deleted",
      description: "The product has been removed from your listings.",
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const fileArray = Array.from(files)
    setUploadedImageFiles((prev) => [...prev, ...fileArray])

    fileArray.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImages((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Products</h1>
            <p className="text-muted-foreground">Manage your product listings</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingProduct(null)
                  setUploadedImages([])
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSaveProduct}>
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                  <DialogDescription>
                    {editingProduct
                      ? "Update your product information below."
                      : "Fill in the details to create a new product listing."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" placeholder="Enter product name" required value={productName} onChange={(e) => setProductName(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Describe your product" rows={3} required value={productDescription} onChange={(e) => setProductDescription(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input id="price" type="number" step="0.01" min="0" placeholder="0.00" required value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="stock">Stock</Label>
                      <Input id="stock" type="number" min="0" placeholder="0" required value={productStock} onChange={(e) => setProductStock(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select required value={selectedCategory} onValueChange={(value: Category | "") => setSelectedCategory(value)} >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="images">Product Images</Label>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">Upload multiple images (JPG, PNG, etc.)</p>
                  </div>
                  {uploadedImages.length > 0 && (
                    <div className="grid gap-2">
                      <Label>Uploaded Images ({uploadedImages.length})</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {uploadedImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img || "/placeholder.svg"}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setUploadedImages([])
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">{editingProduct ? "Update Product" : "Add Product"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {vendorProducts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No products yet</h2>
              <p className="text-muted-foreground mb-6">Start selling by adding your first product.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {vendorProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.product_name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-xl">{product.product_name}</h3>
                            <Badge variant="secondary">{product.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Price</p>
                          <p className="text-lg font-bold">${product.price}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Stock</p>
                          <p className="text-lg font-semibold">{product.stock}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Sold</p>
                          <p className="text-lg font-semibold">{product.sold}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                          <p className="text-lg font-semibold">${(product.price * product.sold).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingProduct(product.id)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
