import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, AlertTriangle, Circle } from "lucide-react";
import type { BeneficialIngredient, ConcerningIngredient, NeutralIngredient } from "@/types/ingredients";

interface IngredientsListProps {
  beneficial: BeneficialIngredient[];
  concerning: ConcerningIngredient[];
  neutral: NeutralIngredient[];
}

const IngredientsList = ({ beneficial, concerning, neutral }: IngredientsListProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "low":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      {beneficial.length > 0 && (
        <Card className="border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Beneficial Ingredients ({beneficial.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {beneficial.map((ingredient, index) => (
                <AccordionItem key={index} value={`beneficial-${index}`}>
                  <AccordionTrigger className="text-left">
                    <span className="font-medium">{ingredient.name}</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      <strong>Benefit:</strong> {ingredient.benefit}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      <strong>Why it's good for you:</strong> {ingredient.relevance}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {concerning.length > 0 && (
        <Card className="border-orange-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Ingredients to Watch ({concerning.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {concerning.map((ingredient, index) => (
                <AccordionItem key={index} value={`concerning-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ingredient.name}</span>
                      <Badge variant="outline" className={getSeverityColor(ingredient.severity)}>
                        {ingredient.severity}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      <strong>Concern:</strong> {ingredient.concern}
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      <strong>Recommendation:</strong> {ingredient.recommendation}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {neutral.length > 0 && (
        <Card className="border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Circle className="h-5 w-5 text-muted-foreground" />
              Neutral Ingredients ({neutral.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {neutral.map((ingredient, index) => (
                <AccordionItem key={index} value={`neutral-${index}`}>
                  <AccordionTrigger className="text-left">
                    <span className="font-medium">{ingredient.name}</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      <strong>Purpose:</strong> {ingredient.purpose}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IngredientsList;
