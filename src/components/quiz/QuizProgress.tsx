import { Progress } from "@/components/ui/progress";

interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
}

const QuizProgress = ({ currentStep, totalSteps }: QuizProgressProps) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(percentage)}% complete</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

export default QuizProgress;
