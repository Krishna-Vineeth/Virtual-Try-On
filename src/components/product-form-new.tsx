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
import { VideoGenerationModal } from "./video-generation-modal"

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
  section: 'upper' | 'lower'
}

const AVATAR_OPTIONS: AvatarOption[] = [
  { 
    id: "men-upper", 
    label: "Men Upper", 
    section: "upper",
    image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?w=200&h=200&fit=crop" 
  },
  { 
    id: "men-lower", 
    label: "Men Lower", 
    section: "lower",
    image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?w=200&h=200&fit=crop" 
  },
  { 
    id: "women-upper", 
    label: "Women Upper", 
    section: "upper",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=200&h=200&fit=crop" 
  },
  { 
    id: "women-lower", 
    label: "Women Lower", 
    section: "lower",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=200&h=200&fit=crop" 
  },
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

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  const handleGenerateVideoUrl = () => {
    setIsVideoModalOpen(true)
  }

  const handleVideoGeneration = async (selectedImages: string[], prompt: string) => {
    try {
      const response = await fetch('http://10.20.3.76:5001/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: selectedImages,
          prompt: prompt
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate video: ${response.status}`);
      }

      const data = await response.json();
      setVideoUrl(data.videoUrl); // Assuming the API returns a videoUrl field
      
    } catch (error) {
      console.error('Error generating video:', error);
      throw error;
    }
  }

  // Add state for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  async function handleGenerateAndUpload() {
    try {
      // First API call to generate product code
      const generateResponse = await fetch('http://10.20.3.76:5001/generate-product-code', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!generateResponse.ok) {
        throw new Error(`Failed to generate product code: ${generateResponse.status}`);
      }

      const generateData = await generateResponse.json();
      console.log('Generate Product Code Response:', generateData);

      if (generateData.success && generateData.value) {
        // Combine uploaded and generated images
        const allImages = [
          ...uploadedImages.map(img => ({ url: img.url, type: 'uploaded' })),
          ...generatedImages.filter(img => img.url).map(img => ({ url: img.url!, type: 'generated' }))
        ];

        // Upload each image
        const uploadPromises = allImages.map(async (image, index) => {
          try {
            const response = await fetch(image.url);
            const blob = await response.blob();
            
            const formData = new FormData();
            const imageFileName = `${generateData.value}/image_${index + 1}`;
            const fileExtension = blob.type.split('/')[1] || 'jpg';
            const fullFileName = `${imageFileName}.${fileExtension}`;
            
            const file = new File([blob], fullFileName, { type: blob.type });
            
            formData.append('imageFileName', fullFileName);
            formData.append('image', file);
            formData.append('productCode', generateData.value);
            formData.append('active', 'false');

            const uploadResponse = await fetch('http://10.20.3.76:5001/upload-image', {
              method: 'POST',
              body: formData,
            });

            if (!uploadResponse.ok) {
              throw new Error(`Upload failed for image ${index + 1}: ${uploadResponse.status}`);
            }

            const uploadData = await uploadResponse.json();
            console.log(`Upload Response for ${image.type} image ${index + 1}:`, uploadData);
            const locationPath = uploadData.path || `${generateData.value}/${uploadData.fileName || `image_${index + 1}.${fileExtension}`}`;
            return { 
              ...uploadData, 
              locationPath,
              sequence: index 
            };
          } catch (error) {
            console.error(`Error uploading image ${index + 1}:`, error);
            throw error;
          }
        });

        const uploadResults = await Promise.all(uploadPromises);
        console.log('All uploads completed:', uploadResults);

        // Prepare payload for add-product API
        const addProductPayload = {
          activated: false,
          brand: brand, // Using the brand state
          businessPartnerCode: "DED-70077",
          businessPartnerId: "617b77ca03d9bb660f8e4dca",
          businessPartnerName: "DED-70077",
          categoryName: "T-Shirt", // You might want to make this dynamic based on user selection
          description: "Cgo8aGVhZD4KPC9oZWFkPgo8Ym9keT4KPHA+VHNoaXJ0PC9wPgo8L2JvZHk+Cg==",
          longDescription: "Cgo8aGVhZD4KPC9oZWFkPgo8Ym9keT4KPHA+VHNoaXJ0PC9wPgo8L2JvZHk+Cg==",
          name: productName, // Using the productName state
          productCode: generateData.value,
          specificationDetail:"-",
          height:12,
          length:12,
          brandCode: "BR-M036969-07635",
          productStory:null,
          promoSKU:true,
          shippingWeight:0.288,
          uniqueSellingPoint:"",
          uom:"PC",
          url:"",
          viewable:false,
          weight:0.134,
          width:12,
          freeSample:false,
          brandApprovalStatus:"APPROVED",
          imagesUpdated:false,
          gdnProductSku:null,
          oldProductCode:null,
          productBusinessPartnerAttributes:[],
          preOrder: {
            isPreOrder: false,
            preOrderType: "",
            preOrderValue: null,
            preOrderDate: null
          },
          
          // Channel settings
          off2OnChannelActive: false,
          online: true,
          cncActivated: false,
          fbb: false,
          b2cActivated: null,
          b2bActivated: false,
          bundleProduct: false,
          
          // Logistics settings
          productItemLogisticsWebRequests: [
            {
              logisticProductCode: "BES_TMS_SD",
              logisticOptionCode: "SAME_DAY",
              logisticOptionName: "SameDay",
              requiredLongLat: false,
              additionalInformation: null,
              logisticProductName: "BES-SD",
              highlightedInformation: null,
              downloadInformation: null,
              downloadable: false,
              historyAvailable: false,
              selected: false
            },
            {
              logisticProductCode: "GOSEND_INSTANT_CAR",
              logisticOptionCode: "INSTANT_CAR",
              logisticOptionName: "Instant Car",
              requiredLongLat: true,
              additionalInformation: null,
              logisticProductName: "GOSEND Instant Car",
              highlightedInformation: null,
              downloadInformation: null,
              downloadable: false,
              historyAvailable: false,
              selected: false
            },
            {
              logisticProductCode: "GOSEND_INSTANT_HD",
              logisticOptionCode: "HOUR_DEL",
              logisticOptionName: "2 jam sampai",
              requiredLongLat: true,
              additionalInformation: null,
              logisticProductName: "2 Jam Sampai GS",
              highlightedInformation: null,
              downloadInformation: null,
              downloadable: false,
              historyAvailable: false,
              selected: false
            },
            {
              logisticProductCode: "GOSEND_SAMEDAY",
              logisticOptionCode: "SAME_DAY",
              logisticOptionName: "SameDay",
              requiredLongLat: true,
              additionalInformation: "<p><br></p><ul><li>Semua produk regular yang memenuhi persyaratan berikut akan tersedia untuk pengiriman melalui GO-SEND sesuai dengan permintaan customer:</li></ul><p style=\"margin-left: 60px;\">- Lokasi pickup point di Jabodetabek dan Bandung</p><p style=\"margin-left: 60px;\">- Berat max 5 kg</p><p style=\"margin-left: 60px;\">- Dimensi 40 X 40 x 17 (cm)</p><ul><li>Pastikan semua produk anda tersedia untuk mengindari autocancel. Order yang tidak difulfill dalam 1 hari kerja akan dibatalkan secara otomatis oleh sistem</li><li>Pastikan nomor telepon & telpon kontak yang tercatat di pickup point<strong>&nbsp;tidak mengandung SPASI dan tidak lebih dari 14 digit&nbsp;</strong>(nomor telepon yang tidak sesuai dengan ketentuan akan menyebabkan gagal booking Gosend)</li></ul>",
              logisticProductName: "GOSEND Sameday",
              highlightedInformation: "<p>Batas autocancel<span>&nbsp;</span><strong>1 hari kerja</strong></p>",
              downloadInformation: null,
              downloadable: false,
              historyAvailable: false,
              selected: true
            },
            {
              logisticProductCode: "GRAB_EXPRESS_CAR",
              logisticOptionCode: "INSTANT",
              logisticOptionName: "Instant",
              requiredLongLat: false,
              additionalInformation: null,
              logisticProductName: "Grab Instant Car",
              highlightedInformation: null,
              downloadInformation: null,
              downloadable: false,
              historyAvailable: false,
              selected: false
            },
            {
              logisticProductCode: "GRAB_INSTANT",
              logisticOptionCode: "INSTANT",
              logisticOptionName: "Instant",
              requiredLongLat: false,
              additionalInformation: "<p>shippingstandardautomation</p>",
              logisticProductName: "Grab Instant",
              highlightedInformation: "shippingstandardautomation",
              downloadInformation: null,
              downloadable: false,
              historyAvailable: false,
              selected: true
            },
            {
              logisticProductCode: "JNE_COD",
              logisticOptionCode: "STANDARD",
              logisticOptionName: "STANDARD",
              requiredLongLat: false,
              additionalInformation: "<ul><li>Untuk mengaktifkan dan menonaktifkan pilihan COD, kami memerlukan waktu maksimal <strong><u>3 hari kerja</u>&nbsp;</strong>setelah merchant mengubah pengaturan pilihan COD di MTA.</li><li>Semua produk (dengan harga normal Rp10.000 &ndash; Rp3.000.000) yang memenuhi syarat COD akan diikutsertakan dan tersedia untuk pembayaran COD sesuai dengan permintaan customer.</li><li>Pilihan COD hanya berlaku untuk <strong>merchant dengan</strong>\n<strong>jenis pengiriman pick-up</strong> di wilayah <strong>Jakarta, Tangerang, Depok, Bandung, Surabaya, Sidoarjo, Denpasar, Kuta, dan Medan</strong>.</li><li>Jika produk gagal dikirim, maka produk akan dikembalikan ke merchant dalam jangka waktu <strong>2x jumlah hari estimasi pengiriman + 10 hari kerja</strong>. Contoh: jika produk gagal dikirimkan dari Jakarta ke Surabaya (estimasi 3 hari), maka produk akan dikembalikan ke Jakarta dalam waktu 2x3 hari + 10 hari kerja.</li><li>Jika produk gagal dikirim, merchant harus <strong>segera memeriksa kondisi produk saat sampai di alamat merchant</strong>. Pastikan Anda menyiapkan bukti pemeriksaan kondisi produk seperti foto/video/etc.</li><li>Jika merchant tidak melaporkan kerusakan/kekurangan langsung ke pihak logistik, maka merchant dianggap sudah menerima dan <strong>tidak dapat lagi mengajukan penolakan produk tersebut</strong>.</li><li>Kerusakan isi paket produk pecah belah/mudah pecah (fragile) tidak ditanggung oleh Blibli.com dan pihak logistik.</li><li>Pengiriman produk COD harus menggunakan <strong>Label Pengiriman dari Blibli.com</strong> yang disertakan informasi COD, harga produk, dan alamat pengembalian (untuk penanganan produk yang gagal terkirim). Kesalahan penanganan karena kekurangan informasi pada label pengiriman tidak ditanggung oleh Blibli.com dan pihak logistik.</li></ul>",
              logisticProductName: "JNE COD",
              highlightedInformation: null,
              downloadInformation: null,
              downloadable: false,
              historyAvailable: false,
              selected: false
            },
            {
              logisticProductCode: "JNTC_CARGO_TEN",
              logisticOptionCode: "TRUCKING",
              logisticOptionName: "Cargo",
              requiredLongLat: false,
              additionalInformation: null,
              logisticProductName: "JNT Cargo",
              highlightedInformation: null,
              downloadInformation: null,
              downloadable: false,
              historyAvailable: false,
              selected: false
            },
            {
              logisticProductCode: "PAXEL_MP",
              logisticOptionCode: "EXPRESS",
              logisticOptionName: "Express",
              requiredLongLat: true,
              additionalInformation: "<ul><li>Aktivasi berlaku 3 hari kerja sejak pengajuan</li><li>Pengiriman tersedia untuk <strong>Area Kota</strong><span>:</span><br>Bandung, Banyuwangi, Bekasi, Bogor, Cirebon, Denpasar, Depok, Jakarta, Jember, Kediri, Madiun, Magelang, Makasar, Malang, Medan, Purwokerto, Semarang, Solo, Surabaya, Tangerang, Tasikmalaya, Yogyakarta</li><li>Pastikan berat paket yang tertulis di MTA sama dengan berat paket yang akan diserahkan ke Paxel, dengan maksimum berat paket sebesar 5 KG per koli</li><li>Petunjuk pengemasan:<ul><li>Makanan beku: Pastikan makanan/minuman dibungkus dengan plastik vacuum dan dilapisi kembali dengan box/styrofoam</li><li>Makanan segar: Pastikan makanan/minuman dibungkus dengan box</li></ul></li></ul>",
              logisticProductName: "PAXEL MP",
              highlightedInformation: "<p>Pilihan pengiriman kategori makanan & minuman yang dilengkapi fasilitas pendingin</p>",
              downloadInformation: null,
              downloadable: false,
              historyAvailable: false,
              selected: false
            },
            {
              logisticProductCode: "WAHANA_EKO",
              logisticOptionCode: "ECONOMY",
              logisticOptionName: "Economy",
              requiredLongLat: false,
              additionalInformation: null,
              logisticProductName: "Wahana Ekonomis",
              highlightedInformation: null,
              downloadInformation: null,
              downloadable: false,
              historyAvailable: false,
              selected: false
            },
            {
              logisticProductCode: "WAHANA_EKO_B",
              logisticOptionCode: "TRUCKING",
              logisticOptionName: "Cargo",
              requiredLongLat: false,
              additionalInformation: null,
              logisticProductName: "Wahana",
              highlightedInformation: null,
              downloadInformation: null,
              downloadable: false,
              historyAvailable: false,
              selected: false
            },
            {
              logisticProductCode: "WAHANA_TRUCKING",
              logisticOptionCode: "TRUCKING",
              logisticOptionName: "Cargo",
              requiredLongLat: false,
              additionalInformation: null,
              logisticProductName: "Wahana Trucking",
              highlightedInformation: null,
              downloadInformation: null,
              downloadable: false,
              historyAvailable: false,
              selected: false
            }
          ],
          
          // Size chart settings
          sizeChartCode: null,
          sizeChartName: null,
          productCategories: [
            {
              level: 3,
              categoryName: "T-Shirt",
              categoryNameEnglish: "T-Shirt",
              categoryCode: "T--1000004",
              catalog: {
                id: "41591a5a-daad-11e4-b9d6-1681e6b88ec1",
                name: "MASTER CATALOG",
                catalogCode: "10001",
                catalogType: "MASTER_CATALOG"
              },
              id: "6c23cfb8-c0be-697d-c5ec-8e4bbf42314a"
            }
          ],
          productAttributes: [
            {
              attribute: {
                searchAble: false,
                skuValue: false,
                productAttributeName: "Material",
                attributeCode: "MA-0000006",
                attributeType: "DESCRIPTIVE_ATTRIBUTE",
                basicView: true,
                description: "TWF0ZXJpYWw=",
                example: null,
                id: "28f69725-9fd3-46af-a36d-f037dbe02243",
                mandatory: false,
                variantCreation: false,
                name: "Material",
                nameEnglish: "Material",
                predefinedAllowedAttributeValues: null
              },
              id: null,
              ownByProductItem: false,
              productAttributeName: "Material",
              productAttributeValues: [
                {
                  name: "Material",
                  nameEnglish: "Material",
                  allowedAttributeValue: null,
                  descriptiveAttributeValueType: "SINGLE",
                  id: null,
                  predefinedAllowedAttributeValue: null,
                  value: "",
                  descriptiveAttributeValue: ""
                }
              ],
              sequence: 0
            },
            {
              attribute: {
                searchAble: false,
                skuValue: false,
                productAttributeName: "Care Label",
                attributeCode: "CA-0036941",
                attributeType: "DESCRIPTIVE_ATTRIBUTE",
                basicView: true,
                description: "Q2FyZSBMYWJlbA==",
                example: null,
                id: "7ded34c8-ffee-45bd-96a3-e479242b1e2f",
                mandatory: false,
                variantCreation: false,
                name: "Care Label",
                nameEnglish: "Care Label",
                predefinedAllowedAttributeValues: null
              },
              id: null,
              ownByProductItem: false,
              productAttributeName: "Care Label",
              productAttributeValues: [
                {
                  name: "Care Label",
                  nameEnglish: "Care Label",
                  allowedAttributeValue: null,
                  descriptiveAttributeValueType: "SINGLE",
                  id: null,
                  predefinedAllowedAttributeValue: null,
                  value: "",
                  descriptiveAttributeValue: ""
                }
              ],
              sequence: 0
            },
            {
              attribute: {
                searchAble: true,
                skuValue: false,
                productAttributeName: "Brand",
                attributeCode: "BR-M036969",
                attributeType: "PREDEFINED_ATTRIBUTE",
                basicView: true,
                description: "QnJhbmQgKFByZWRlZmluZWQp",
                example: null,
                id: "176cff65-5e57-4458-920d-2d120d471d22",
                mandatory: false,
                variantCreation: false,
                name: "Brand",
                nameEnglish: "Brand",
                predefinedAllowedAttributeValues: null
              },
              id: null,
              ownByProductItem: false,
              productAttributeName: "Brand",
              productAttributeValues: [
                {
                  allowedAttributeValue: null,
                  descriptiveAttributeValue: null,
                  descriptiveAttributeValueType: "PREDEFINED",
                  id: null,
                  predefinedAllowedAttributeValue: {
                    id: null,
                    predefinedAllowedAttributeCode: "BR-M036969-07635",
                    value: brand, // Using the brand state value
                    sequence: null
                  }
                }
              ]
            }
          ],
          productItemRequests: [
            {
              generatedItemName: productName,
              id:null,
              attributesMap:{
              },
              gdnProductItemSku:"",
              markDefaultAddress:true,
              sourceItemCode:null,
              contentChanged:false,
              upcCode:"",
              merchantSku:"",
              pickupPointId:"",
              productItemHashCode:"",
              productItemId:"",
              productType:1,
              dangerousGoodsLevel:0,
              showWholesaleDiscountError:{
                show:false,
                closed:false
              },

              pickupPoints: [
                {
                  id:null,
                  pickupPointId:"PP-3279208",
                  minimumStock:0,
                  display:false,
                  buyable:false,
                  cncDisplay:false,
                  cncBuyable:false,
                  discount:0,
                  price:10,
                  salePrice:10,
                  wholesalePriceActivated:false,
                  fbbActivated:false,
                  stock:0,
                  pickupPointName:"PP-3279208",
                  cncActivated:false,
                  delivery:true,
                  pickupPointUpdated:true,
                  b2bFields:null
                }
              ],
              images: uploadResults.map((result, index) => ({
                name: `${productName}.jpg`,
                width: 800,
                height: 800,
                sequence: index,
                markForDelete:false,
                type: "new",
                generatedItemName:false,
                mainImages: index === 0,
                originalImage: true,
                commonImage: true,
                locationPath: result.locationPath
              }))
            }
          ],
          commonImages: uploadResults.map((result, index) => ({
            name: `${productName}.jpg`,
            width: 800,
            height: 800,
            sequence: index,
            type: "new",
            mainImages: index === 0,
            originalImage: true,
            commonImage: true,
            locationPath: result.locationPath
          }))
          // ... rest of the payload structure remains the same as your example
        };

        // Make the final API call to add-product
        const addProductResponse = await fetch('http://10.20.3.76:5001/add_product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(addProductPayload)
        });

        if (!addProductResponse.ok) {
          throw new Error(`Failed to add product: ${addProductResponse.status}`);
        }

        const addProductData = await addProductResponse.json();
        console.log('Add Product Response:', addProductData);

      } else {
        throw new Error('Failed to generate product code: Invalid response format');
      }
    } catch (error) {
      console.error('Error in API calls:', error);
      // You might want to show an error message to the user here
    }
  }

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
            "md:w-[190px] md:sticky md:top-0 md:h-fit mt-2 ml-5"
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
                      <SelectItem value="c1">T-Shirts</SelectItem>
                      {/* <SelectItem value="c2">T-Shirts</SelectItem> */}
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
              <Button size="sm" className="bg-black text-white hover:bg-black/90" onClick={handleGenerateAndUpload}>Send</Button>
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
            <DialogTitle>Select Model</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-4">
            {/* Upper Section */}
            <div>
              <h3 className="text-sm font-medium mb-3">Upper Body</h3>
              <div className="grid grid-cols-2 gap-4">
                {avatarOptions
                  .filter(avatar => avatar.section === 'upper')
                  .map((avatar) => (
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
            </div>

            {/* Lower Section */}
            <div>
              <h3 className="text-sm font-medium mb-3">Lower Body</h3>
              <div className="grid grid-cols-2 gap-4">
                {avatarOptions
                  .filter(avatar => avatar.section === 'lower')
                  .map((avatar) => (
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
            </div>
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

      <VideoGenerationModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        uploadedImages={uploadedImages}
        generatedImages={generatedImages}
        onGenerate={handleVideoGeneration}
      />

    </section>
  )
}

