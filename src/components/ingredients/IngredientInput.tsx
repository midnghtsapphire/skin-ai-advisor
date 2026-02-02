import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Sparkles, ClipboardPaste } from "lucide-react";

interface IngredientInputProps {
  onAnalyze: (ingredients: string) => void;
  isLoading: boolean;
}

const IngredientInput = ({ onAnalyze, isLoading }: IngredientInputProps) => {
  const [ingredients, setIngredients] = useState("");

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setIngredients(text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const handleSubmit = () => {
    if (ingredients.trim()) {
      onAnalyze(ingredients.trim());
    }
  };

  return (
    <Card className="glass-card border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Enter Ingredients
        </CardTitle>
        <CardDescription>
          Paste or type the ingredient list from your skincare product
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder="e.g., Water, Glycerin, Niacinamide, Hyaluronic Acid, Salicylic Acid..."
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="min-h-[150px] resize-none"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handlePaste}
          >
            <ClipboardPaste className="h-4 w-4 mr-1" />
            Paste
          </Button>
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={!ingredients.trim() || isLoading}
          className="w-full"
          variant="hero"
          size="lg"
        >
          {isLoading ? (
            <>
              <Sparkles className="h-4 w-4 animate-pulse" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analyze Ingredients
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default IngredientInput;
