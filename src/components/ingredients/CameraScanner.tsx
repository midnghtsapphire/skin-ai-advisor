import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, X, RotateCcw, Loader2, Upload, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIngredientsExtracted: (ingredients: string) => void;
}

const CameraScanner = ({ open, onOpenChange, onIngredientsExtracted }: CameraScannerProps) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Could not access camera. Please use the upload option instead.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    if (open && !capturedImage) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [open, capturedImage, startCamera, stopCamera]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    
    setCapturedImage(imageData);
    stopCamera();
  }, [stopCamera]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setCapturedImage(imageData);
      stopCamera();
    };
    reader.readAsDataURL(file);
  }, [stopCamera, toast]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const extractIngredients = async () => {
    if (!capturedImage) return;
    
    setIsExtracting(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-ingredients`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ imageBase64: capturedImage }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to extract ingredients");
      }
      
      onIngredientsExtracted(data.ingredients);
      onOpenChange(false);
      setCapturedImage(null);
      
      toast({
        title: "Ingredients Extracted",
        description: "The ingredient list has been added to the input field",
      });
    } catch (error) {
      console.error("Extraction error:", error);
      toast({
        title: "Extraction Failed",
        description: error instanceof Error ? error.message : "Could not extract ingredients",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setCameraError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Scan Ingredients
          </DialogTitle>
          <DialogDescription>
            Take a photo of the product's ingredient list or upload an image
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative aspect-[4/3] bg-muted">
          {!capturedImage ? (
            <>
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">{cameraError}</p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {!isStreaming && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-8 border-2 border-primary/50 rounded-lg">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <img
              src={capturedImage}
              alt="Captured ingredient list"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        
        <div className="p-4 flex gap-2">
          {!capturedImage ? (
            <>
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              {isStreaming && (
                <Button className="flex-1" onClick={captureImage}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" className="flex-1" onClick={retakePhoto}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button 
                className="flex-1" 
                onClick={extractIngredients}
                disabled={isExtracting}
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Extract
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraScanner;
