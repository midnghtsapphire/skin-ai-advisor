import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import QuizProgress from "@/components/quiz/QuizProgress";
import SkinTypeStep from "@/components/quiz/SkinTypeStep";
import SkinConcernsStep from "@/components/quiz/SkinConcernsStep";
import QuizResults from "@/components/quiz/QuizResults";

const TOTAL_STEPS = 3;

const SkinQuiz = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [skinType, setSkinType] = useState<string | null>(null);
  const [skinConcerns, setSkinConcerns] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleConcernToggle = (concern: string) => {
    setSkinConcerns((prev) =>
      prev.includes(concern)
        ? prev.filter((c) => c !== concern)
        : [...prev, concern]
    );
  };

  const canProceed = () => {
    if (currentStep === 1) return !!skinType;
    if (currentStep === 2) return skinConcerns.length > 0;
    return true;
  };

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === TOTAL_STEPS - 1) {
      await saveResults();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const saveResults = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to save your skin profile.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          skin_type: skinType,
          skin_concerns: skinConcerns,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Profile saved!",
        description: "Your skin profile has been updated successfully.",
      });

      setCurrentStep(TOTAL_STEPS);
      setIsComplete(true);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Quiz Content */}
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        {!isComplete && (
          <div className="mb-8">
            <QuizProgress currentStep={currentStep} totalSteps={TOTAL_STEPS - 1} />
          </div>
        )}

        <div className="space-y-8">
          {currentStep === 1 && (
            <SkinTypeStep selectedType={skinType} onSelect={setSkinType} />
          )}

          {currentStep === 2 && (
            <SkinConcernsStep
              selectedConcerns={skinConcerns}
              onToggle={handleConcernToggle}
            />
          )}

          {currentStep === 3 && isComplete && skinType && (
            <QuizResults skinType={skinType} concerns={skinConcerns} />
          )}
        </div>

        {/* Navigation Buttons */}
        {!isComplete && (
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <Button
              variant="hero"
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : currentStep === TOTAL_STEPS - 1 ? (
                <>
                  Complete Quiz
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SkinQuiz;
