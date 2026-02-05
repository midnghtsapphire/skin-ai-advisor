import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { IngredientAnalysis } from "@/types/ingredients";

interface ComparisonProduct {
  id: string;
  product_name: string | null;
  analysis_result: IngredientAnalysis;
}

interface ProductComparisonProps {
  products: ComparisonProduct[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

const ProductComparison = ({ products, onRemove, onClose }: ProductComparisonProps) => {
  if (products.length < 2) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    if (score >= 40) return "bg-orange-100";
    return "bg-red-100";
  };

  const bestScore = Math.max(...products.map(p => p.analysis_result.overallScore));
  const worstScore = Math.min(...products.map(p => p.analysis_result.overallScore));

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Product Comparison</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 text-left text-sm font-medium text-muted-foreground">
                  Product
                </th>
                {products.map((product) => (
                  <th key={product.id} className="py-3 px-4 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm line-clamp-1">
                        {product.product_name || "Unnamed"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => onRemove(product.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Score Row */}
              <tr className="border-b border-border">
                <td className="py-3 text-sm text-muted-foreground">Score</td>
                {products.map((product) => {
                  const score = product.analysis_result.overallScore;
                  const isBest = score === bestScore && products.length > 1;
                  const isWorst = score === worstScore && products.length > 1 && bestScore !== worstScore;
                  return (
                    <td key={product.id} className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                          {score}
                        </span>
                        {isBest && <TrendingUp className="h-4 w-4 text-green-600" />}
                        {isWorst && <TrendingDown className="h-4 w-4 text-red-500" />}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Verdict Row */}
              <tr className="border-b border-border">
                <td className="py-3 text-sm text-muted-foreground">Verdict</td>
                {products.map((product) => (
                  <td key={product.id} className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreBg(product.analysis_result.overallScore)} ${getScoreColor(product.analysis_result.overallScore)}`}>
                      {product.analysis_result.verdict}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Beneficial Ingredients */}
              <tr className="border-b border-border">
                <td className="py-3 text-sm text-muted-foreground">Beneficial</td>
                {products.map((product) => {
                  const count = product.analysis_result.beneficialIngredients.length;
                  return (
                    <td key={product.id} className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {count} ingredients
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Concerning Ingredients */}
              <tr className="border-b border-border">
                <td className="py-3 text-sm text-muted-foreground">Concerning</td>
                {products.map((product) => {
                  const count = product.analysis_result.concerningIngredients.length;
                  return (
                    <td key={product.id} className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        count === 0 
                          ? "bg-green-100 text-green-700"
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        {count} ingredients
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Neutral Ingredients */}
              <tr>
                <td className="py-3 text-sm text-muted-foreground">Neutral</td>
                {products.map((product) => {
                  const count = product.analysis_result.neutralIngredients.length;
                  return (
                    <td key={product.id} className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                        {count} ingredients
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductComparison;
