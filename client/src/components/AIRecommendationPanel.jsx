import { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE;

const ENDPOINTS = {
  nutrition: '/api/ai/meal-plan',
  fitness: '/api/ai/generate-workout',
  profile: '/api/ai/recommend',
};

function formatIngredient(ingredient) {
  if (typeof ingredient === 'string') return ingredient;

  const amount = [ingredient.quantity, ingredient.unit]
    .filter(Boolean)
    .join(' ');
  const preparation = ingredient.preparation ? `, ${ingredient.preparation}` : '';
  const notes = ingredient.notes ? ` (${ingredient.notes})` : '';

  return `${amount ? `${amount} ` : ''}${ingredient.name || ''}${preparation}${notes}`;
}

function AIRecommendationPanel({ page, onApply }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [excluded, setExcluded] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const endpoint = ENDPOINTS[page] || ENDPOINTS.profile;
  const excludeKey = page === 'nutrition' ? 'excluded' : page === 'fitness' ? 'excludedExercises' : null;
  const chatPlaceholder =
    page === 'nutrition' ? "e.g. I don't like mushrooms" : "e.g. I can't do jumping exercises";

  const fetchPlan = async (excludedList) => {
    const token = localStorage.getItem('crave_token');
    if (!token) {
      setError('Log in to get AI recommendations.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const body = { page };
      if (excludeKey) body[excludeKey] = excludedList;

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Request failed');
      setResult(await res.json());
    } catch {
      setError('Could not fetch recommendations right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !excludeKey) return;
    const next = [...excluded, chatInput.trim()];
    setExcluded(next);
    setChatInput('');
    await fetchPlan(next);
  };

  const handleApplyClick = async () => {
    if (!result) return;

    setApplying(true);
    setError('');

    try {
      await onApply(result);
    } catch (applyError) {
      setError(applyError.message || 'Could not save this plan.');
    } finally {
      setApplying(false);
    }
  };

  const groupedEntries = result?.meals
    ? Object.entries(result.meals)
    : result?.exercises
    ? Object.entries(result.exercises)
    : null;

  return (
    <div className="rounded-2xl border-2 border-crave-ink bg-crave-bone2 p-5 shadow-hard-sm">
      <button
        type="button"
        onClick={() => fetchPlan(excluded)}
        disabled={loading}
        className="flex items-center gap-2 rounded-full border-2 border-crave-ink bg-crave-poppy px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-crave-bone shadow-hard-sm disabled:opacity-60"
      >
        <Sparkles className="h-4 w-4" />
        {loading ? 'Thinking...' : 'Ask AI for suggestions'}
      </button>

      {error && <p className="mt-3 text-sm text-crave-poppy">{error}</p>}

      {result && (
        <div className="mt-4 rounded-xl border-2 border-crave-ink bg-crave-bone p-4">
          <p className="text-sm font-semibold text-crave-ink">{result.summary}</p>

          {groupedEntries ? (
            <div className="mt-3 space-y-3">
              {groupedEntries.map(([category, items]) => (
                <div key={category}>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-widest2 text-crave-ink/60">
                    {category}
                  </p>
                  <ul className="mt-1 space-y-1">
                    {items.map((item, i) => (
                      <li key={i} className="text-sm text-crave-ink/80">
                        <span className="font-semibold text-crave-ink">{item.title || item.label}</span> —{' '}
                        {item.description || item.detail || item.value}{' '}
                        <span className="text-crave-ink/50">({item.calories || item.tag})</span>
                        {Array.isArray(item.ingredients) && item.ingredients.length > 0 && (
                          <span className="block text-crave-ink/60">
                            Ingredients: {item.ingredients.map(formatIngredient).join(', ')}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {(result.recommendations || []).map((r, i) => (
                <li key={i} className="text-sm text-crave-ink/80">• {r}</li>
              ))}
            </ul>
          )}

          {excludeKey && excluded.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {excluded.map((x) => (
                <span key={x} className="rounded-full bg-crave-poppy/10 px-2 py-0.5 text-xs text-crave-poppy">
                  no {x}
                </span>
              ))}
            </div>
          )}

          {excludeKey && (
            <form onSubmit={handleChatSubmit} className="mt-3 flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={chatPlaceholder}
                className="flex-1 rounded-xl border-2 border-crave-ink bg-crave-bone2 px-3 py-1.5 text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl border-2 border-crave-ink bg-crave-bone2 px-3 text-sm font-bold disabled:opacity-60"
              >
                Send
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={handleApplyClick}
            disabled={applying}
            className="mt-4 flex items-center gap-2 rounded-full border-2 border-crave-ink bg-crave-jade px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-crave-bone"
          >
            <Check className="h-3.5 w-3.5" />
            {applying ? 'Saving...' : 'Apply'}
          </button>
        </div>
      )}
    </div>
  );
}

export default AIRecommendationPanel;
