import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Circle,
  Frown,
  Sun,
  Clock,
  Droplets,
  AlertCircle,
  Palette,
  Shield,
} from "lucide-react";

const skinConcerns = [
  {
    value: "acne",
    label: "Acne & Breakouts",
    description: "Pimples, blackheads, whiteheads",
    icon: Circle,
  },
  {
    value: "wrinkles",
    label: "Fine Lines & Wrinkles",
    description: "Signs of aging, crow's feet",
    icon: Clock,
  },
  {
    value: "dark_spots",
    label: "Dark Spots",
    description: "Hyperpigmentation, sun damage",
    icon: Sun,
  },
  {
    value: "dullness",
    label: "Dullness",
    description: "Lack of radiance, uneven texture",
    icon: Frown,
  },
  {
    value: "dehydration",
    label: "Dehydration",
    description: "Tight skin, fine lines from dryness",
    icon: Droplets,
  },
  {
    value: "sensitivity",
    label: "Sensitivity",
    description: "Redness, irritation, reactions",
    icon: AlertCircle,
  },
  {
    value: "uneven_tone",
    label: "Uneven Skin Tone",
    description: "Discoloration, redness patches",
    icon: Palette,
  },
  {
    value: "pores",
    label: "Large Pores",
    description: "Visible, enlarged pores",
    icon: Shield,
  },
];

interface SkinConcernsStepProps {
  selectedConcerns: string[];
  onToggle: (concern: string) => void;
}

const SkinConcernsStep = ({
  selectedConcerns,
  onToggle,
}: SkinConcernsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
          What are your skin concerns?
        </h2>
        <p className="text-muted-foreground">
          Select all that apply. We'll create a routine tailored to your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {skinConcerns.map((concern) => {
          const Icon = concern.icon;
          const isSelected = selectedConcerns.includes(concern.value);

          return (
            <Card
              key={concern.value}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:shadow-soft",
                isSelected
                  ? "border-primary bg-primary/5 shadow-glow"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => onToggle(concern.value)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <Checkbox
                  checked={isSelected}
                  className="pointer-events-none"
                />
                <div
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm">
                    {concern.label}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {concern.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SkinConcernsStep;
