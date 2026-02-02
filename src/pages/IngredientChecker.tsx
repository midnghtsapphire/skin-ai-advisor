import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import IngredientInput from "@/components/ingredients/IngredientInput";
import AnalysisScore from "@/components/ingredients/AnalysisScore";
import IngredientsList from "@/components/ingredients/IngredientsList";
import AnalysisTips from "@/components/ingredients/AnalysisTips";
import type { IngredientAnalysis } from "@/types/ingredients";

const IngredientChecker = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<IngredientAnalysis | null>(null);
  const [skinProfile, setSkinProfile] = useState<{
    skinType: string | null;
    skinConcerns: string[] | null;
  }>({ skinType: null, skinConcerns: null });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("skin_type, skin_concerns")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setSkinProfile({
        skinType: data?.skin_type || null,
        skinConcerns: data?.skin_concerns || null,
      });
    };

    fetchProfile();
  }, [user]);

  const handleAnalyze = async (ingredients: string) => {
    setIsLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-ingredients`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            ingredients,
            skinType: skinProfile.skinType,
            skinConcerns: skinProfile.skinConcerns,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze ingredients");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Error analyzing ingredients:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze ingredients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasProfile = skinProfile.skinType || skinProfile.skinConcerns?.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card border-b border-primary/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl font-semibold">Ingredient Checker</h1>
            <p className="text-sm text-muted-foreground">
              Analyze product ingredients for your skin
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">
          {/* Profile Status */}
          {!hasProfile && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Skin Profile</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <span>
                  Complete the skin quiz first to get personalized ingredient analysis.
                </span>
                <Button variant="outline" size="sm" className="w-fit" onClick={() => navigate("/skin-quiz")}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Take Skin Quiz
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {hasProfile && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Analyzing for:</span>
              {skinProfile.skinType && (
                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {skinProfile.skinType} skin
                </span>
              )}
              {skinProfile.skinConcerns?.map((concern) => (
                <span key={concern} className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                  {concern}
                </span>
              ))}
            </div>
          )}

          {/* Input Section */}
          <IngredientInput onAnalyze={handleAnalyze} isLoading={isLoading} />

          {/* Results Section */}
          {analysis && (
            <div className="space-y-6 animate-fade-in">
              <AnalysisScore
                score={analysis.overallScore}
                verdict={analysis.verdict}
                summary={analysis.summary}
              />

              <IngredientsList
                beneficial={analysis.beneficialIngredients}
                concerning={analysis.concerningIngredients}
                neutral={analysis.neutralIngredients}
              />

              <AnalysisTips tips={analysis.tips} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default IngredientChecker;
