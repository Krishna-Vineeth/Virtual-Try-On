"use client"

import { useEffect, useState, useRef } from "react"
import { Upload, X, Wand2, Loader2, Sparkles, Menu } from 'lucide-react'
// import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


interface UploadedImage {
  id: string
  url: string
}

interface GeneratedImage {
  id: string
  originalId: string
  url?: string
  isGenerating: boolean
}

interface AvatarOption {
  id: string
  label: string
  image: string
}

const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "men", label: "Men", image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?w=200&h=200&fit=crop" },
  { id: "women", label: "Women", image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=200&h=200&fit=crop" },
  { id: "boy", label: "Boy", image: "https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?w=200&h=200&fit=crop" },
  { id: "girl", label: "Girl", image: "https://images.pexels.com/photos/36029/aroni-arsa-children-little.jpg?w=200&h=200&fit=crop" },
]

export function ProductForm() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [productName, setProductName] = useState("")
  const [brand, setBrand] = useState("")
  const [videoUrl, setVideoUrl] = useState('')
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption | null>(null)
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null)
  const [avatarOptions] = useState<AvatarOption[]>(AVATAR_OPTIONS)
  // const [hasSample, setHasSample] = useState(false)

  const productInfoRef = useRef<HTMLDivElement>(null)
  const photosVideosRef = useRef<HTMLDivElement>(null)
  const productDetailsRef = useRef<HTMLDivElement>(null)
  const pickupAddressRef = useRef<HTMLDivElement>(null)
  const priceStockRef = useRef<HTMLDivElement>(null)
  const deliveryRef = useRef<HTMLDivElement>(null)

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const navItems = [
    { label: "Product info", ref: productInfoRef },
    { label: "Photos & videos", ref: photosVideosRef },
    { label: "Product details", ref: productDetailsRef },
    { label: "Pickup address", ref: pickupAddressRef },
    { label: "Price & Stock", ref: priceStockRef },
    { label: "Delivery", ref: deliveryRef },
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // alert("handle image upload.")
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        url: URL.createObjectURL(file),
      }))
      setUploadedImages((prev) => [...prev, ...newImages].slice(0, 8))
    }
  }

  const handleRemoveUpload = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id))
  }

  const handleGenerate = (image: UploadedImage) => {
    setSelectedImage(image)
    setIsModalOpen(true)
  }

  const handleAvatarSelect = (avatar: AvatarOption) => {
    setSelectedAvatar(avatar)
  }

  const [customAvatarImages, setCustomAvatarImages] = useState<{ [key: string]: string }>({})

  const handleModelImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, avatarId: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Here you would typically upload to your server
      // For now, we'll use local URL
      const imageUrl = URL.createObjectURL(file)
      
      setCustomAvatarImages(prev => ({
        ...prev,
        [avatarId]: imageUrl
      }))

      // Update selected avatar if it's the current one
      if (selectedAvatar?.id === avatarId) {
        setSelectedAvatar(prev => prev ? {
          ...prev,
          image: imageUrl
        } : null)
      }
    } catch (error) {
      console.error('Error uploading model image:', error)
      // Add error handling as needed
    }
  }

const handleGenerateImage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // alert("handle generate image.")
    e.preventDefault(); // Prevent form submission
    if (!selectedAvatar || !selectedImage) return

    setIsModalOpen(false)
    
    const newGeneratedImage: GeneratedImage = {
      id: Math.random().toString(36).substring(7),
      originalId: selectedImage.id,
      isGenerating: true,
    }

    setGeneratedImages((prev) => [...prev, newGeneratedImage])

    // Simulate API call with timeout
    await new Promise((resolve) => setTimeout(resolve, 2000))
                          // replace api
    let res = await fetch("https://gfgkarecode.pythonanywhere.com/pe_count", {
      method: "GET",    // will be post for actual api
      // body: JSON.stringify({       // body should be kept for actual api
      //   avatarId: selectedAvatar.id,
      //   imageUrl: selectedImage.url,
      // }),
    });
    const imageGenerationData = await res.json();

    setGeneratedImages((prev) =>
      prev.map((img) =>
        img.id === newGeneratedImage.id
          ? {
              ...img,
              isGenerating: false,
              url: imageGenerationData?.url || "https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?w=200&h=200&fit=crop",
                        // actual image             fallback image.
            }
          : img
      )
    )

    setSelectedImage(null)
    setSelectedAvatar(null)
  }

  const [activeSection, setActiveSection] = useState<string>("product-info")

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => ({
        id: item.label.toLowerCase().replace(/ /g, "-"),
        ref: item.ref
      }))

      const currentSection = sections.find(section => {
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      })

      if (currentSection) {
        setActiveSection(currentSection.id)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    console.log(`Modal open status: ${isModalOpen}`)
  }, [isModalOpen])

  const handleGenerateVideoUrl = async () => {
    setIsGeneratingUrl(true)
    try {
      // Replace with your actual API endpoint
      const response = {
        ok: true,
        json: () => Promise.resolve({
          url: "https://www.youtube.com/watch?v=INLdX0gxwkk" 
        })
      }
      
      const data = await response.json()
      if (data.url) {
        setVideoUrl(data.url)
      }
    } catch (error) {
      console.error('Error generating video URL:', error)
      // Add error handling as needed
    } finally {
      setIsGeneratingUrl(false)
    }
  }

  // Add state for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <section className="w-full min-h-screen relative">
      {/* Animated Header Section */}
      <div className="w-full bg-gradient-to-r from-purple-600/10 via-blue-600/5 to-purple-600/10 py-4 md:py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-grid-pattern"></div>
        <div className="max-w-[1400px] mx-auto px-4 relative">
          <div className="flex flex-col items-center justify-center space-y-3 md:space-y-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <h1 className="relative px-4 md:px-7 py-2 md:py-4 bg-white bg-opacity-90 rounded-lg text-2xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 flex items-center gap-2 md:gap-3">
                <Sparkles className="h-5 w-5 md:h-8 md:w-8 text-blue-600 animate-pulse" />
                Virtual Try On
                <Sparkles className="h-5 w-5 md:h-8 md:w-8 text-purple-600 animate-pulse" />
              </h1>
            </div>
            <p className="text-base md:text-lg font-medium tracking-wide text-gray-600 text-center px-4">
              Experience fashion in a whole new dimension
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs md:text-sm text-gray-500 px-4">
              <span className="px-2 md:px-3 py-1 bg-white/80 rounded-full border border-gray-200">
                AI-Powered
              </span>
              <span className="px-2 md:px-3 py-1 bg-white/80 rounded-full border border-gray-200">
                Real-time Preview
              </span>
              <span className="px-2 md:px-3 py-1 bg-white/80 rounded-full border border-gray-200">
                Smart Fitting
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto relative">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Mobile Menu Button - Only visible on mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden fixed bottom-20 right-4 z-50 bg-black text-white p-3 rounded-full shadow-lg"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Sidebar Navigation - Responsive */}
          <div className={cn(
            "fixed md:relative inset-0 z-40 md:z-0 bg-white/95 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none",
            "transform transition-transform duration-200 ease-in-out md:transform-none",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            "md:w-[200px] md:sticky md:top-0 md:h-fit mt-2 ml-5"
          )}>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation Items */}
            <div className="flex flex-col pt-16 md:pt-4 px-4 md:px-0">
              {navItems.map((item) => {
                const itemId = item.label.toLowerCase().replace(/ /g, "-")
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      scrollToSection(item.ref)
                      setIsMobileMenuOpen(false) // Close mobile menu after clicking
                    }}
                    className={cn(
                      "w-full py-2 px-3 text-left text-sm text-gray-700 font-medium transition-all rounded-lg",
                      activeSection === itemId 
                        ? "border border-gray-900"
                        : "hover:bg-gray-50/50"
                    )}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-4 md:p-6 bg-transparent pb-16">
            {/* Product Info Section */}
            <div ref={productInfoRef} className="mb-8 bg-[#fafafa] rounded-lg p-6">
              <h2 className="text-lg font-medium mb-6">Product Info</h2>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="productName">
                    Product name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="mt-2"
                    placeholder="Format: Brand + Model + Product type (max. 150 characters)"
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {productName.length} / 150
                  </div>
                </div>

                <div>
                  <Label htmlFor="brand">
                    Brand<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="mt-2"
                    placeholder="Brand name"
                  />
                </div>

                <div>
                  <Label htmlFor="category">
                    Category<span className="text-red-500">*</span>
                  </Label>
                  <Select>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="c1">Category 1</SelectItem>
                      <SelectItem value="c2">Category 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Photos & Videos Section */}
            <div ref={photosVideosRef} className="mb-8 bg-[#fafafa] rounded-lg p-6">
              <h2 className="text-lg font-medium mb-6">Photos & Videos</h2>
              <div className="space-y-6">
                <div>
                  <Label>
                    General photos (max. 8)<span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-gray-500 mb-4">
                    You can add a generic photo that will appear in all variants (max. 8 photos).
                  </p>
                  
                  {/* Responsive grid for upload images */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {Array.from({ length: 8 }).map((_, index) => {
                      const image = uploadedImages[index]
                      return (
                        <div key={index} className="aspect-square border border-dashed rounded-lg">
                          {image ? (
                            <div className="relative h-full group">
                              <img
                                src={image.url}
                                alt="Uploaded"
                                className="h-full w-full object-contain rounded-lg"
                                // style={{
                                //   maxHeight: '200px',
                                //   minHeight: '100px',
                                // }}
                              />
                              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  onClick={() => handleRemoveUpload(image.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  onClick={() => handleGenerate(image)}
                                >
                                  <Wand2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center h-full cursor-pointer">
                              <Upload className="h-6 w-6 mb-2" />
                              <span className="text-sm">Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                              />
                            </label>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Generated Images Section */}
                  {generatedImages.length > 0 && (
                    <div className="mt-6 md:mt-8">
                      <Label className="mb-4 block">Generated photos</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {generatedImages.map((image) => (
                          <div key={image.id} className="aspect-square border rounded-lg overflow-hidden">
                            {image.isGenerating ? (
                              <div className="h-full w-full flex items-center justify-center bg-gray-50">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                              </div>
                            ) : (
                              <div className="relative h-full w-full">
                                <img
                                  src={image.url}
                                  alt="Generated"
                                  className="h-full w-full object-cover"
                                  // style={{
                                  //   maxHeight: '200px',
                                  //   minHeight: '100px',
                                  // }}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                                  <div className="absolute top-2 right-2">
                                    <Button
                                      variant="secondary"
                                      size="icon"
                                      className="h-8 w-8 bg-white/90 hover:bg-white"
                                      onClick={() => {
                                        setGeneratedImages(prev => 
                                          prev.filter(img => img.id !== image.id)
                                        )
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Input Section */}
                <div className="mt-6 md:mt-8">
                  <Label htmlFor="video">Video</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="video"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="Link video"
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleGenerateVideoUrl}
                      disabled={isGeneratingUrl}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {isGeneratingUrl ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Only Youtube links available.
                  </p>
                </div>
              </div>
            </div>

            {/* Product Details Section */}
            <div ref={productDetailsRef} className="mb-8 bg-[#fafafa] rounded-lg p-6">
              <h2 className="text-lg font-medium mb-6">Product Details</h2>
              <div className="space-y-6">
                <div>
                  <Label>Description</Label>
                  <textarea
                    className="w-full mt-2 p-3 border rounded-md min-h-[150px]"
                    placeholder="Enter product description..."
                  />
                </div>
                <div>
                  <Label>Specifications</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <Input placeholder="Specification name" />
                    <Input placeholder="Specification value" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup Address Section */}
            <div ref={pickupAddressRef} className="mb-8 bg-[#fafafa] rounded-lg p-6">
              <h2 className="text-lg font-medium mb-6">Pickup Address</h2>
              <div className="space-y-6">
                <div>
                  <Label>Address Line 1</Label>
                  <Input className="mt-2" placeholder="Street address" />
                </div>
                <div>
                  <Label>Address Line 2</Label>
                  <Input className="mt-2" placeholder="Apartment, suite, etc." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input className="mt-2" placeholder="City" />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input className="mt-2" placeholder="State" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Country</Label>
                    <Input className="mt-2" placeholder="Country" />
                  </div>
                  <div>
                    <Label>Postal Code</Label>
                    <Input className="mt-2" placeholder="Postal code" />
                  </div>
                </div>
              </div>
            </div>

            {/* Price & Stock Section */}
            <div ref={priceStockRef} className="mb-8 bg-[#fafafa] rounded-lg p-6">
              <h2 className="text-lg font-medium mb-6">Price & Stock</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Regular Price</Label>
                    <Input className="mt-2" type="number" placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Sale Price</Label>
                    <Input className="mt-2" type="number" placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <Label>Stock Quantity</Label>
                  <Input className="mt-2" type="number" placeholder="0" />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input className="mt-2" placeholder="Stock Keeping Unit" />
                </div>
              </div>
            </div>

            {/* Delivery Section */}
            <div ref={deliveryRef} className="bg-[#fafafa] rounded-lg p-6">
              <h2 className="text-lg font-medium mb-6">Delivery</h2>
              <div className="space-y-6">
                <div>
                  <Label>Shipping Method</Label>
                  <Select>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select shipping method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Shipping</SelectItem>
                      <SelectItem value="express">Express Shipping</SelectItem>
                      <SelectItem value="overnight">Overnight Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estimated Delivery Time</Label>
                  <Input className="mt-2" placeholder="e.g., 3-5 business days" />
                </div>
                <div>
                  <Label>Shipping Cost</Label>
                  <Input className="mt-2" type="number" placeholder="0.00" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t z-50">
          <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 flex justify-end gap-3 h-14">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">Cancel</Button>
              <Button size="sm" className="bg-black text-white hover:bg-black/90">Send</Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t mt-2">
          <div className="w-full max-w-[1400px] mx-auto px-8">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8">
              {/* Company Info */}
              <div>
                <h3 className="font-semibold mb-4">Virtual Try On</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Experience fashion in a whole new dimension with our AI-powered virtual fitting solution.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-600 text-sm hover:text-gray-900">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 text-sm hover:text-gray-900">
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 text-sm hover:text-gray-900">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 text-sm hover:text-gray-900">
                      Pricing
                    </a>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-600 text-sm hover:text-gray-900">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 text-sm hover:text-gray-900">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 text-sm hover:text-gray-900">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 text-sm hover:text-gray-900">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="font-semibold mb-4">Contact</h3>
                <ul className="space-y-2">
                  <li className="text-gray-600 text-sm">
                    123 Innovation Drive
                  </li>
                  <li className="text-gray-600 text-sm">
                    Tech Valley, CA 94043
                  </li>
                  <li className="text-gray-600 text-sm">
                    contact@virtualtry.on
                  </li>
                  <li className="text-gray-600 text-sm">
                    +1 (555) 123-4567
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Footer - Reduced padding */}
            <div className="border-t py-4">
              <p className="text-gray-600 text-sm text-center">
                © 2024 Virtual Try On. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Avatar Model</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 p-4">
            {avatarOptions.map((avatar) => (
              <div
                key={avatar.id}
                onClick={() => handleAvatarSelect(avatar)}
                className={cn(
                  "relative aspect-square rounded-lg border-2 overflow-hidden cursor-pointer",
                  selectedAvatar?.id === avatar.id
                    ? "border-primary"
                    : "border-muted"
                )}
              >
                <img
                  src={customAvatarImages[avatar.id] || avatar.image}
                  alt={avatar.label}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/50 to-transparent p-2">
                  <span className="text-white font-medium">
                    {avatar.label}
                  </span>
                </div>
                <label className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full cursor-pointer hover:bg-white transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleModelImageUpload(e, avatar.id)}
                  />
                  <Upload className="h-4 w-4 text-gray-600" />
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 px-4 pb-4">
            <Button 
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleGenerateImage}
              disabled={!selectedAvatar}
            >
              Generate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </section>
  )
}

