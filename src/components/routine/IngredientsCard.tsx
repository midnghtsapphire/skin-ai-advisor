import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ingredient } from "@/types/routine";
import { Check, X } from "lucide-react";

interface IngredientsCardProps {
  keyIngredients: Ingredient[];
  ingredientsToAvoid: Ingredient[];
}

const IngredientsCard = ({
  keyIngredients,
  ingredientsToAvoid,
}: IngredientsCardProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="glass-card border-green-500/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-display text-green-600">
            <div className="p-2 rounded-xl bg-green-500/10">
              <Check className="w-4 h-4" />
            </div>
            Key Ingredients to Look For
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {keyIngredients.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5"
            >
              <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30 shrink-0">
                {item.ingredient}
              </Badge>
              <p className="text-sm text-muted-foreground">{item.benefit}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-card border-red-500/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-display text-red-600">
            <div className="p-2 rounded-xl bg-red-500/10">
              <X className="w-4 h-4" />
            </div>
            Ingredients to Avoid
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ingredientsToAvoid.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5"
            >
              <Badge className="bg-red-500/20 text-red-700 hover:bg-red-500/30 shrink-0">
                {item.ingredient}
              </Badge>
              <p className="text-sm text-muted-foreground">{item.reason}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default IngredientsCard;
