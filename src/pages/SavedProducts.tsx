import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Heart, Trash2, ExternalLink, Loader2, GitCompare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProductComparison from "@/components/products/ProductComparison";
import ShareProductButton from "@/components/products/ShareProductButton";
import type { IngredientAnalysis } from "@/types/ingredients";

interface SavedProduct {
  id: string;
  product_name: string | null;
  ingredients: string;
  analysis_result: IngredientAnalysis;
  created_at: string;
}

const SavedProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<SavedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts((data || []) as unknown as SavedProduct[]);
    } catch (error) {
      console.error("Error fetching saved products:", error);
      toast({
        title: "Error",
        description: "Failed to load saved products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("saved_products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setProducts(products.filter((p) => p.id !== id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast({
        title: "Removed",
        description: "Product removed from favorites",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to remove product",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 4) {
        next.add(id);
      } else {
        toast({
          title: "Limit reached",
          description: "You can compare up to 4 products at a time",
        });
      }
      return next;
    });
  };

  const handleCompare = () => {
    if (selectedIds.size >= 2) {
      setShowComparison(true);
    }
  };

  const removeFromComparison = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (selectedIds.size <= 2) {
      setShowComparison(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const selectedProducts = products.filter(p => selectedIds.has(p.id));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-card border-b border-primary/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-semibold">Saved Products</h1>
            <p className="text-sm text-muted-foreground">
              Your favorited product analyses
            </p>
          </div>
          {selectedIds.size >= 2 && (
            <Button onClick={handleCompare} className="gap-2">
              <GitCompare className="h-4 w-4" />
              Compare ({selectedIds.size})
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">
          {/* Comparison View */}
          {showComparison && selectedProducts.length >= 2 && (
            <ProductComparison
              products={selectedProducts}
              onRemove={removeFromComparison}
              onClose={() => setShowComparison(false)}
            />
          )}

          {/* Selection hint */}
          {products.length > 1 && !showComparison && (
            <p className="text-sm text-muted-foreground text-center">
              Select 2-4 products to compare them side by side
            </p>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-medium mb-2">No saved products yet</h3>
                <p className="text-muted-foreground mb-4">
                  Analyze a product and save it to your favorites
                </p>
                <Button onClick={() => navigate("/ingredient-checker")}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Go to Ingredient Checker
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <Card 
                  key={product.id} 
                  className={`glass-card transition-all ${
                    selectedIds.has(product.id) 
                      ? "ring-2 ring-primary" 
                      : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedIds.has(product.id)}
                        onCheckedChange={() => toggleSelection(product.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {product.product_name || "Unnamed Product"}
                        </CardTitle>
                        <CardDescription>
                          Saved on {new Date(product.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${getScoreColor(product.analysis_result.overallScore)}`}>
                          {product.analysis_result.overallScore}
                        </span>
                        <span className="text-sm text-muted-foreground">/100</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2 ml-7">
                      {product.analysis_result.summary}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 text-xs ml-7">
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {product.analysis_result.beneficialIngredients.length} beneficial
                      </span>
                      {product.analysis_result.concerningIngredients.length > 0 && (
                        <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                          {product.analysis_result.concerningIngredients.length} concerning
                        </span>
                      )}
                      <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {product.analysis_result.neutralIngredients.length} neutral
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2 ml-7">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate("/ingredient-checker", { 
                          state: { 
                            ingredients: product.ingredients,
                            analysis: product.analysis_result 
                          } 
                        })}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <ShareProductButton
                        productName={product.product_name}
                        analysis={product.analysis_result}
                        size="sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                      >
                        {deletingId === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedProducts;
