import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Checkbox } from "./ui/checkbox"
import { ScrollArea } from "./ui/scroll-area"

interface VideoGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  uploadedImages: Array<{ id: string; url: string }>
  generatedImages: Array<{ id: string; url: string }>
  onGenerate: (selectedImages: string[], prompt: string) => Promise<void>
}

export function VideoGenerationModal({
  isOpen,
  onClose,
  uploadedImages,
  generatedImages,
  onGenerate,
}: VideoGenerationModalProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const allImages = [...uploadedImages, ...generatedImages]

  const toggleImage = (imageUrl: string) => {
    setSelectedImages(prev => 
      prev.includes(imageUrl) 
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    )
  }

  const handleGenerate = async () => {
    if (selectedImages.length === 0) {
      alert("Please select at least one image")
      return
    }
    if (!prompt) {
      alert("Please enter a prompt")
      return
    }

    setIsGenerating(true)
    try {
      await onGenerate(selectedImages, prompt)
      onClose()
    } catch (error) {
      console.error("Error generating video:", error)
      alert("Failed to generate video")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Generate Video</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Select Images</Label>
            <ScrollArea className="h-[300px] mt-2 p-4 border rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                {allImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt="Selection"
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 right-2 z-10">
                      <Checkbox
                        checked={selectedImages.includes(image.url)}
                        onCheckedChange={() => toggleImage(image.url)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt for video generation"
            />
          </div>

          {/* Generate Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || selectedImages.length === 0 || !prompt}
            >
              {isGenerating ? "Generating..." : "Generate Video"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 