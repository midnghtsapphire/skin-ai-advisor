import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuizResultsProps {
  skinType: string;
  concerns: string[];
}

const skinTypeLabels: Record<string, string> = {
  oily: "Oily",
  dry: "Dry",
  combination: "Combination",
  normal: "Normal",
};

const concernLabels: Record<string, string> = {
  acne: "Acne & Breakouts",
  wrinkles: "Fine Lines & Wrinkles",
  dark_spots: "Dark Spots",
  dullness: "Dullness",
  dehydration: "Dehydration",
  sensitivity: "Sensitivity",
  uneven_tone: "Uneven Skin Tone",
  pores: "Large Pores",
};

const QuizResults = ({ skinType, concerns }: QuizResultsProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 text-center">
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
          Your Skin Profile is Ready!
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We've saved your skin analysis. Here's a summary of your unique skin profile.
        </p>
      </div>

      <Card className="glass-card border-primary/20">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              Your Skin Type
            </p>
            <p className="text-2xl font-display font-semibold text-primary">
              {skinTypeLabels[skinType] || skinType}
            </p>
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              Your Concerns
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {concerns.map((concern) => (
                <span
                  key={concern}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {concernLabels[concern] || concern}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button
          variant="hero"
          size="lg"
          onClick={() => navigate("/routine")}
          className="group"
        >
          <Sparkles className="w-5 h-5" />
          Get Your Personalized Routine
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
        <p className="text-sm text-muted-foreground">
          Your profile has been saved. Click above to see your AI-powered routine.
        </p>
      </div>
    </div>
  );
};

export default QuizResults;
