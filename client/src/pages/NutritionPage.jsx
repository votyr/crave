import { useMemo } from 'react';
import { Utensils, Flame, Leaf } from 'lucide-react';
import Board from '../components/ui/Board';
import Ticket from '../components/ui/Ticket';
import AIRecommendationPanel from '../components/AIRecommendationPanel';
import { useNavigate } from "react-router-dom";

const defaultCategories = [
  {
    name: 'Breakfast',
    items: [
      { label: 'Greek yogurt bowl', value: 'oats, berries, chia', tag: '380 kcal' },
      { label: 'Warm spiced oats', value: 'dates, walnuts, cinnamon', tag: '340 kcal' },
      { label: 'Plant smoothie', value: 'spinach, banana, flax', tag: '260 kcal' },
    ],
  },
  {
    name: 'Lunch',
    items: [
      { label: 'Quinoa power bowl', value: 'roasted veg + legumes', tag: '520 kcal' },
      { label: 'Grilled chicken rice', value: 'greens, herbs, lemon', tag: '580 kcal' },
      { label: 'Lentil stew', value: 'tomato, cumin, kale', tag: '440 kcal' },
    ],
  },
  {
    name: 'Dinner',
    items: [
      { label: 'Grilled fish / tofu', value: 'greens, warm grain', tag: '610 kcal' },
      { label: 'Chickpea curry', value: 'brown rice, cucumber raita', tag: '560 kcal' },
      { label: 'Stuffed peppers', value: 'bulgur, herbs, feta', tag: '490 kcal' },
    ],
  },
  {
    name: 'Hydration',
    items: [
      { label: 'Morning', value: '500 ml water', tag: '0 kcal' },
      { label: 'Pre-lunch', value: 'herbal tea or infused water', tag: '0 kcal' },
      { label: 'Evening', value: 'warm turmeric milk', tag: '120 kcal' },
    ],
  },
];

function NutritionPage({ profile, onApplyMealPlan }) {
  const categories = useMemo(() => {
    if (profile?.customMeals) {
      return Object.entries(profile.customMeals).map(([name, items]) => ({ name, items }));
    }
    return defaultCategories;
  }, [profile?.customMeals]);

  const flatItems = useMemo(
    () => categories.flatMap((cat) => cat.items.map((item) => ({ ...item, category: cat.name }))),
    [categories]
  );
  
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <section className="relative z-10 rounded-2xl border-2 border-crave-ink bg-crave-jade p-6 text-crave-bone shadow-hard">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest2 text-crave-butter">
              <Utensils className="h-4 w-4" />
              The menu
            </div>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Meals that respect your preferences.
            </h2>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl border-2 border-crave-bone px-4 py-2 text-center">
              <Flame className="mx-auto h-5 w-5 text-crave-butter" />
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest">Balanced</span>
            </div>
            <div className="rounded-xl border-2 border-crave-bone px-4 py-2 text-center">
              <Leaf className="mx-auto h-5 w-5 text-crave-butter" />
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest">Faith-aware</span>
            </div>
          </div>
        </div>
      </section>

      <AIRecommendationPanel page="nutrition" onApply={onApplyMealPlan} />

      <div className="grid gap-5 md:grid-cols-2">
        {categories.map((cat) => (
          <Board
            key={cat.name}
            title={cat.name}
            items={cat.items}
            className={cat.name === 'Hydration' ? 'bg-crave-bone2' : 'bg-crave-bone'}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border-2 border-crave-ink bg-crave-poppy p-6 text-crave-bone shadow-hard">
          <h3 className="mb-3 font-display text-2xl font-extrabold">Seasonal tip</h3>
          <p className="text-sm leading-relaxed opacity-95">
            In warm climates, favor lighter lunches with raw vegetables and fresh herbs. In colder weather, lean into
            warming spices like cumin, ginger, and turmeric to support digestion and circulation.
          </p>
        </div>
        <Ticket
          title="Sample day"
          rows={[
            { label: 'Breakfast', value: flatItems[0]?.label || '—' },
            { label: 'Lunch', value: flatItems[3]?.label || '—' },
            { label: 'Dinner', value: flatItems[6]?.label || '—' },
          ]}
          totalLabel="Total"
          totalValue="~1,510 kcal"
        />
      </div>
    </div>
  );
}

export default NutritionPage;