import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SkincareRoutine } from "@/types/routine";
import RoutineCard from "@/components/routine/RoutineCard";
import IngredientsCard from "@/components/routine/IngredientsCard";
import WeeklyTreatmentsCard from "@/components/routine/WeeklyTreatmentsCard";

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

const Routine = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [skinType, setSkinType] = useState<string | null>(null);
  const [skinConcerns, setSkinConcerns] = useState<string[]>([]);
  const [routine, setRoutine] = useState<SkincareRoutine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("skin_type, skin_concerns")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSkinType(data.skin_type);
          setSkinConcerns(data.skin_concerns || []);
        }
        setProfileLoaded(true);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load your skin profile.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, toast]);

  const generateRoutine = async () => {
    if (!skinType || skinConcerns.length === 0) {
      toast({
        title: "Complete your profile",
        description: "Please take the skin quiz first to get personalized recommendations.",
        variant: "destructive",
      });
      navigate("/skin-quiz");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-routine`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ skinType, skinConcerns }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          toast({
            title: "Please wait",
            description: "Rate limit exceeded. Try again in a moment.",
            variant: "destructive",
          });
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Service unavailable",
            description: "Please try again later.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(errorData.error || "Failed to generate routine");
      }

      const data = await response.json();
      setRoutine(data.routine);

      toast({
        title: "Routine generated!",
        description: "Your personalized skincare routine is ready.",
      });
    } catch (error) {
      console.error("Error generating routine:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate routine.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (profileLoaded && skinType && skinConcerns.length > 0 && !routine) {
      generateRoutine();
    }
  }, [profileLoaded, skinType, skinConcerns]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const needsQuiz = !skinType || skinConcerns.length === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <span className="font-display text-lg font-semibold text-primary">
            Aura
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={generateRoutine}
            disabled={isGenerating || needsQuiz}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
            Regenerate
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Profile Summary */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Your Personalized Routine
          </h1>
          {skinType && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-muted-foreground">
                Skin type: <span className="text-foreground font-medium">{skinTypeLabels[skinType]}</span>
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Concerns:</span>
              {skinConcerns.map((concern) => (
                <span
                  key={concern}
                  className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-sm"
                >
                  {concernLabels[concern] || concern}
                </span>
              ))}
            </div>
          )}
        </div>

        {needsQuiz ? (
          <Card className="glass-card border-primary/20 text-center p-8">
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-display font-semibold">
                  Complete Your Skin Profile
                </h2>
                <p className="text-muted-foreground">
                  Take our quick skin quiz to get personalized skincare recommendations.
                </p>
              </div>
              <Button
                variant="hero"
                size="lg"
                onClick={() => navigate("/skin-quiz")}
              >
                Take the Skin Quiz
              </Button>
            </CardContent>
          </Card>
        ) : isGenerating ? (
          <div className="text-center py-16 space-y-6">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <div className="space-y-2">
              <h2 className="text-xl font-display font-semibold">
                Analyzing Your Skin Profile
              </h2>
              <p className="text-muted-foreground">
                Our AI is creating your personalized skincare routine...
              </p>
            </div>
          </div>
        ) : routine ? (
          <div className="space-y-8">
            {/* Summary */}
            <Card className="glass-card border-primary/20">
              <CardContent className="p-6">
                <p className="text-foreground leading-relaxed">{routine.summary}</p>
              </CardContent>
            </Card>

            {/* Routines */}
            <div className="grid lg:grid-cols-2 gap-6">
              <RoutineCard
                title="Morning Routine"
                icon="morning"
                steps={routine.morningRoutine}
              />
              <RoutineCard
                title="Evening Routine"
                icon="evening"
                steps={routine.eveningRoutine}
              />
            </div>

            {/* Weekly Treatments */}
            <WeeklyTreatmentsCard treatments={routine.weeklyTreatments} />

            {/* Ingredients */}
            <IngredientsCard
              keyIngredients={routine.keyIngredients}
              ingredientsToAvoid={routine.ingredientsToAvoid}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default Routine;
