import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check, Twitter, Facebook, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { IngredientAnalysis } from "@/types/ingredients";

interface ShareProductButtonProps {
  productName: string | null;
  analysis: IngredientAnalysis;
  size?: "default" | "sm" | "icon";
}

const ShareProductButton = ({ productName, analysis, size = "default" }: ShareProductButtonProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = `${productName || "Product"} - Skin Compatibility: ${analysis.overallScore}/100 (${analysis.verdict})\n\n${analysis.summary}\n\n✅ ${analysis.beneficialIngredients.length} beneficial ingredients\n⚠️ ${analysis.concerningIngredients.length} concerning ingredients`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Analysis copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${productName || "Product"} Analysis`,
          text: shareText,
        });
      } catch (error) {
        // User cancelled share
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  const handleTwitterShare = () => {
    const tweetText = encodeURIComponent(shareText.substring(0, 280));
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, "_blank");
  };

  const handleFacebookShare = () => {
    const text = encodeURIComponent(shareText);
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, "_blank");
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`${productName || "Product"} - Skin Compatibility Analysis`);
    const body = encodeURIComponent(shareText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <Button
        variant="ghost"
        size={size}
        onClick={handleNativeShare}
        className={size === "icon" ? "" : "gap-2"}
      >
        <Share2 className="h-4 w-4" />
        {size !== "icon" && "Share"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Analysis</DialogTitle>
            <DialogDescription>
              Share this product analysis with others
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={shareText.substring(0, 100) + "..."}
                className="flex-1"
              />
              <Button size="icon" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={handleTwitterShare}
              >
                <Twitter className="h-5 w-5" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={handleFacebookShare}
              >
                <Facebook className="h-5 w-5" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={handleEmailShare}
              >
                <Mail className="h-5 w-5" />
                Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareProductButton;
