import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { IngredientAnalysis } from "@/types/ingredients";

interface SaveProductButtonProps {
  ingredients: string;
  analysis: IngredientAnalysis;
}

const SaveProductButton = ({ ingredients, analysis }: SaveProductButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save products to your favorites",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("saved_products").insert([{
        user_id: user.id,
        product_name: productName.trim() || null,
        ingredients,
        analysis_result: JSON.parse(JSON.stringify(analysis)),
      }]);

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Product added to your favorites",
      });
      setIsOpen(false);
      setProductName("");
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Heart className="h-4 w-4" />
        Save to Favorites
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Product</DialogTitle>
            <DialogDescription>
              Give this product a name to easily find it later (optional)
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              placeholder="e.g., Alba Botanica Lotion"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SaveProductButton;
