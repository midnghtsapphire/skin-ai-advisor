import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WeeklyTreatment } from "@/types/routine";
import { Calendar } from "lucide-react";

interface WeeklyTreatmentsCardProps {
  treatments: WeeklyTreatment[];
}

const WeeklyTreatmentsCard = ({ treatments }: WeeklyTreatmentsCardProps) => {
  return (
    <Card className="glass-card border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-display">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Calendar className="w-5 h-5" />
          </div>
          Weekly Treatments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {treatments.map((treatment, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-secondary/50 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">
                {treatment.treatment}
              </h4>
              <Badge variant="outline" className="bg-background">
                {treatment.frequency}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {treatment.benefits}
            </p>
            <div className="flex flex-wrap gap-2">
              {treatment.recommendations.map((rec, recIdx) => (
                <Badge
                  key={recIdx}
                  className="bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {rec.brand} - {rec.product}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default WeeklyTreatmentsCard;
