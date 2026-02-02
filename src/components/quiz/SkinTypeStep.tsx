import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Droplet, Sun, Layers, Sparkles } from "lucide-react";

const skinTypes = [
  {
    value: "oily",
    label: "Oily",
    description: "Shiny skin, enlarged pores, prone to breakouts",
    icon: Droplet,
  },
  {
    value: "dry",
    label: "Dry",
    description: "Tight feeling, flaky patches, dull appearance",
    icon: Sun,
  },
  {
    value: "combination",
    label: "Combination",
    description: "Oily T-zone, dry cheeks, mixed concerns",
    icon: Layers,
  },
  {
    value: "normal",
    label: "Normal",
    description: "Balanced, few imperfections, not sensitive",
    icon: Sparkles,
  },
];

interface SkinTypeStepProps {
  selectedType: string | null;
  onSelect: (type: string) => void;
}

const SkinTypeStep = ({ selectedType, onSelect }: SkinTypeStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
          What's your skin type?
        </h2>
        <p className="text-muted-foreground">
          Select the option that best describes your skin on most days.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skinTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.value;

          return (
            <Card
              key={type.value}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:shadow-soft",
                isSelected
                  ? "border-primary bg-primary/5 shadow-glow"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => onSelect(type.value)}
            >
              <CardContent className="p-6 flex items-start gap-4">
                <div
                  className={cn(
                    "p-3 rounded-xl transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{type.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {type.description}
                  </p>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  )}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SkinTypeStep;
