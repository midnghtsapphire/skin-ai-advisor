export interface RoutineStep {
  step: number;
  productType: string;
  importance: string;
  howToUse: string;
  recommendations: {
    brand: string;
    product: string;
    priceRange: string;
  }[];
}

export interface WeeklyTreatment {
  treatment: string;
  frequency: string;
  benefits: string;
  recommendations: {
    brand: string;
    product: string;
  }[];
}

export interface Ingredient {
  ingredient: string;
  benefit?: string;
  reason?: string;
}

export interface SkincareRoutine {
  morningRoutine: RoutineStep[];
  eveningRoutine: RoutineStep[];
  weeklyTreatments: WeeklyTreatment[];
  keyIngredients: Ingredient[];
  ingredientsToAvoid: Ingredient[];
  summary: string;
}
