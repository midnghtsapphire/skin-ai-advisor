import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoutineStep } from "@/types/routine";
import { Sun, Moon } from "lucide-react";

interface RoutineCardProps {
  title: string;
  icon: "morning" | "evening";
  steps: RoutineStep[];
}

const RoutineCard = ({ title, icon, steps }: RoutineCardProps) => {
  const Icon = icon === "morning" ? Sun : Moon;

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-display">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Icon className="w-5 h-5" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {steps.map((step) => (
          <div
            key={step.step}
            className="relative pl-8 pb-6 border-l-2 border-primary/20 last:pb-0 last:border-transparent"
          >
            <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
              {step.step}
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">
                  {step.productType}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {step.importance}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-sm text-foreground">
                  <span className="font-medium">How to use:</span>{" "}
                  {step.howToUse}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {step.recommendations.map((rec, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs bg-background"
                  >
                    {rec.brand} - {rec.product}{" "}
                    <span className="text-muted-foreground ml-1">
                      ({rec.priceRange})
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RoutineCard;
