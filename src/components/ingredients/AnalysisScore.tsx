import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, ThumbsUp, Minus } from "lucide-react";

interface AnalysisScoreProps {
  score: number;
  verdict: "excellent" | "good" | "moderate" | "caution" | "avoid";
  summary: string;
}

const AnalysisScore = ({ score, verdict, summary }: AnalysisScoreProps) => {
  const getVerdictConfig = () => {
    switch (verdict) {
      case "excellent":
        return {
          icon: CheckCircle2,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/20",
          label: "Excellent Match",
        };
      case "good":
        return {
          icon: ThumbsUp,
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/20",
          label: "Good Match",
        };
      case "moderate":
        return {
          icon: Minus,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/20",
          label: "Moderate",
        };
      case "caution":
        return {
          icon: AlertTriangle,
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
          borderColor: "border-orange-500/20",
          label: "Use with Caution",
        };
      case "avoid":
        return {
          icon: XCircle,
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/20",
          label: "Not Recommended",
        };
    }
  };

  const config = getVerdictConfig();
  const Icon = config.icon;

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${config.bgColor}`}>
              <Icon className={`h-8 w-8 ${config.color}`} />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className={`text-4xl font-bold ${config.color}`}>{score}</span>
                <span className="text-muted-foreground text-lg">/100</span>
              </div>
              <Badge variant="outline" className={`${config.color} ${config.borderColor}`}>
                {config.label}
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground max-w-md">{summary}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisScore;
