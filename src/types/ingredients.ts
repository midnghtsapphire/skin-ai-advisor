export interface BeneficialIngredient {
  name: string;
  benefit: string;
  relevance: string;
}

export interface ConcerningIngredient {
  name: string;
  concern: string;
  severity: "low" | "medium" | "high";
  recommendation: string;
}

export interface NeutralIngredient {
  name: string;
  purpose: string;
}

export interface IngredientAnalysis {
  overallScore: number;
  verdict: "excellent" | "good" | "moderate" | "caution" | "avoid";
  summary: string;
  beneficialIngredients: BeneficialIngredient[];
  concerningIngredients: ConcerningIngredient[];
  neutralIngredients: NeutralIngredient[];
  tips: string[];
}
