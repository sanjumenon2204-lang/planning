export type CategoryType = "need" | "want";
export type GoalTerm = "short" | "long";

export interface Profile {
  id: string;
  household_id: string;
  label: string; // 'Husband' | 'Wife'
}

export interface Month {
  id: string;
  household_id: string;
  period: string; // YYYY-MM-01
  salary: number;
  closed: boolean;
  closed_at: string | null;
}

export interface Category {
  id: string;
  household_id: string;
  name: string;
  type: CategoryType;
  sort_order: number;
  archived: boolean;
}

export interface CategoryPlan {
  id: string;
  month_id: string;
  category_id: string;
  planned_amount: number;
}

export interface Expense {
  id: string;
  month_id: string;
  category_id: string;
  logged_by: string | null;
  amount: number;
  note: string | null;
  mottainai_note: string | null;
  spent_on: string;
  created_at: string;
}

export interface SavingsPot {
  id: string;
  household_id: string;
  balance: number;
  updated_at: string;
}

export interface SavingsTransfer {
  id: string;
  household_id: string;
  month_id: string;
  amount: number;
  created_at: string;
}

export interface Goal {
  id: string;
  household_id: string;
  name: string;
  term: GoalTerm;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  ikigai_love: string | null;
  ikigai_good_at: string | null;
  ikigai_world_needs: string | null;
  ikigai_paid_for: string | null;
  achieved: boolean;
}

// Category + its plan for a given month, with computed spend — the shape most
// UI components actually want.
export interface CategoryWithPlan extends Category {
  planned_amount: number;
  spent: number;
}
