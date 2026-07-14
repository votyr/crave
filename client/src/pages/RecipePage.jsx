import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Users, Clock, Flame, RefreshCcw } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE;

gsap.registerPlugin(ScrollTrigger);

function normalizeIngredient(ing) {
    if (typeof ing === 'string') {
        const parts = ing.split(/\s*[-—]\s*|\s+(?=[\d¼½¾⅓⅔⅛⅜⅝⅞])/);
        return { name: parts[0]?.trim() || ing, amount: parts[1]?.trim() || '' };
    }
    return { name: ing.name || ing.label || '', amount: ing.amount || ing.value || '' };
    }

    function formatStepNumber(index) {
    return String(index + 1).padStart(2, '0') + '.';
    }

    function RecipePage({ dish, onBack }) {
    // 'search' | 'ingredients' | 'surprise' | 'healthy' | 'seasonal' | 'faith' | null
    const [mode, setMode] = useState(dish ? 'search' : null);
    const [query, setQuery] = useState(dish || '');
    const [ingredientsInput, setIngredientsInput] = useState([]); // raw list typed by user
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(false); // only true while an actual fetch is in flight
    const [missing, setMissing] = useState('');
    const [missingList, setMissingList] = useState([]);

    const spreadRef = useRef(null);
    const titleRef = useRef(null);
    const ingredientsRef = useRef(null);
    const stepsRef = useRef(null);
    const imageRef = useRef(null);
    const rotateXTo = useRef(null);
    const rotateYTo = useRef(null);

    const buildPayload = (selectedMode, overrides = {}) => {
        const base = { mode: selectedMode, missingIngredients: overrides.missingList ?? missingList };

        switch (selectedMode) {
        case 'search':
            return { ...base, dish: overrides.query ?? query };
        case 'ingredients':
            return { ...base, ingredients: overrides.ingredients ?? ingredientsInput };
        case 'surprise':
        case 'healthy':
        case 'seasonal':
        case 'faith':
            return { ...base }; // backend derives context (profile/location/etc.) server-side
        default:
            return base;
        }
    };

    const fetchRecipe = async (selectedMode = mode, overrides = {}) => {
        setMode(selectedMode);
        setLoading(true);
        try {
        const token = localStorage.getItem('crave_token');
        const res = await fetch(`${API_BASE}/api/ai/recipe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            credentials: 'include',
            body: JSON.stringify(buildPayload(selectedMode, overrides)),
        });
        const data = await res.json();
        setRecipe(data);
        } catch {
        setRecipe(null);
        } finally {
        setLoading(false);
        }
    };

    // Auto-fetch only when a dish was passed in directly (e.g. from a "surprise me" card elsewhere)
    useEffect(() => {
        if (dish) fetchRecipe('search', { query: dish });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // GSAP animations only run once we actually have a recipe on screen
    useEffect(() => {
        if (loading || !recipe) return;

        const ctx = gsap.context(() => {
        const spread = spreadRef.current;
        if (!spread) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!prefersReducedMotion) {
            gsap.fromTo(
            spread,
            { scale: 0.88, y: 120, opacity: 0, rotateX: -15 },
            { scale: 1, y: 0, opacity: 1, rotateX: 0, duration: 1.8, ease: 'elastic.out(1, 0.65)', delay: 0.2 }
            );

            gsap.from('.lamp-leader', {
            scaleX: 0,
            transformOrigin: 'left center',
            duration: 1.4,
            stagger: 0.12,
            ease: 'power4.out',
            scrollTrigger: { trigger: ingredientsRef.current, start: 'top 95%' },
            });

            gsap.from('.method-step', {
            x: -30,
            opacity: 0,
            duration: 0.9,
            stagger: 0.2,
            ease: 'back.out(1.5)',
            scrollTrigger: { trigger: stepsRef.current, start: 'top 85%' },
            });

            gsap.from('.ingredient-entry', {
            opacity: 0,
            y: 10,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: { trigger: ingredientsRef.current, start: 'top 90%' },
            });

            gsap.from(imageRef.current, {
            scale: 0.92,
            opacity: 0,
            duration: 1,
            ease: 'back.out(1.2)',
            scrollTrigger: { trigger: imageRef.current, start: 'top 90%' },
            });

            rotateXTo.current = gsap.quickTo(spread, 'rotateX', { duration: 0.5, ease: 'power1.out' });
            rotateYTo.current = gsap.quickTo(spread, 'rotateY', { duration: 0.5, ease: 'power1.out' });

            const onMove = (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 4;
            const y = (e.clientY / window.innerHeight - 0.5) * 4;
            rotateYTo.current(x);
            rotateXTo.current(-y);
            };

            spread.addEventListener('mousemove', onMove);
            return () => spread.removeEventListener('mousemove', onMove);
        }
        }, spreadRef);

        return () => {
        ctx.revert();
        if (rotateXTo.current) rotateXTo.current.kill?.();
        if (rotateYTo.current) rotateYTo.current.kill?.();
        };
    }, [loading, recipe]);

    const handleMissingSubmit = (e) => {
        e.preventDefault();
        if (!missing.trim()) return;
        const next = [...missingList, missing.trim()];
        setMissingList(next);
        setMissing('');
        fetchRecipe(mode, { missingList: next });
    };

    // ---------- 1. Mode picker ----------
    if (!mode && !recipe) {
        return (
        <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-6">
            <span className="mb-4 font-lamp-display text-sm uppercase tracking-[0.45em] text-lamp-crimson">
            CRAVE Recipe Studio
            </span>

            <h1 className="mb-4 text-center font-lamp-display text-6xl font-black text-lamp-ink">
            How shall we cook today?
            </h1>

            <p className="mb-12 max-w-2xl text-center font-lamp-body text-lg text-lamp-ink/70">
            Search for any recipe, cook using ingredients already in your kitchen,
            discover seasonal dishes, or let AI surprise you with something delicious.
            </p>

            <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            <button
                onClick={() => setMode('search')}
                className="lamp-paper rounded-3xl border-2 border-lamp-ink p-8 text-left transition hover:-translate-y-1 hover:shadow-xl"
            >
                <div className="mb-5 text-5xl">🔍</div>
                <h3 className="font-lamp-display text-2xl font-black">Search Recipe</h3>
                <p className="mt-2 text-sm text-lamp-ink/70">
                Enter the name of any dish and receive a beautifully formatted recipe.
                </p>
            </button>

            <button
                onClick={() => setMode('ingredients')}
                className="lamp-paper rounded-3xl border-2 border-lamp-ink p-8 text-left transition hover:-translate-y-1 hover:shadow-xl"
            >
                <div className="mb-5 text-5xl">🥬</div>
                <h3 className="font-lamp-display text-2xl font-black">Use My Ingredients</h3>
                <p className="mt-2 text-sm text-lamp-ink/70">
                Tell AI what you already have and it'll invent a meal around it.
                </p>
            </button>

            <button
                onClick={() => fetchRecipe('surprise')}
                className="lamp-paper rounded-3xl border-2 border-lamp-ink p-8 text-left transition hover:-translate-y-1 hover:shadow-xl"
            >
                <div className="mb-5 text-5xl">🎲</div>
                <h3 className="font-lamp-display text-2xl font-black">Surprise Me</h3>
                <p className="mt-2 text-sm text-lamp-ink/70">
                Let AI randomly choose something exciting you've probably never made.
                </p>
            </button>

            <button
                onClick={() => fetchRecipe('healthy')}
                className="lamp-paper rounded-3xl border-2 border-lamp-ink p-8 text-left transition hover:-translate-y-1 hover:shadow-xl"
            >
                <div className="mb-5 text-5xl">🍽️</div>
                <h3 className="font-lamp-display text-2xl font-black">Healthy For Me</h3>
                <p className="mt-2 text-sm text-lamp-ink/70">
                Personalized using your health profile, goals and activity level.
                </p>
            </button>

            <button
                onClick={() => fetchRecipe('seasonal')}
                className="lamp-paper rounded-3xl border-2 border-lamp-ink p-8 text-left transition hover:-translate-y-1 hover:shadow-xl"
            >
                <div className="mb-5 text-5xl">🌿</div>
                <h3 className="font-lamp-display text-2xl font-black">Seasonal</h3>
                <p className="mt-2 text-sm text-lamp-ink/70">
                Uses ingredients currently in season near your location.
                </p>
            </button>

            <button
                onClick={() => fetchRecipe('faith')}
                className="lamp-paper rounded-3xl border-2 border-lamp-ink p-8 text-left transition hover:-translate-y-1 hover:shadow-xl"
            >
                <div className="mb-5 text-5xl">✨</div>
                <h3 className="font-lamp-display text-2xl font-black">Faith Friendly</h3>
                <p className="mt-2 text-sm text-lamp-ink/70">
                Respects your dietary restrictions and religious preferences.
                </p>
            </button>
            </div>
        </div>
        );
    }

    // ---------- 2. Search input ----------
    if (mode === 'search' && !recipe && !loading) {
        return (
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-6">
            <h2 className="font-lamp-display text-5xl font-black text-lamp-ink">Search Recipes</h2>

            <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chicken Biryani, Pasta Alfredo..."
            className="w-full rounded-2xl border-2 border-lamp-ink bg-lamp-cream px-5 py-4 text-lg outline-none focus:border-lamp-crimson"
            />

            <div className="flex gap-4">
            <button onClick={() => setMode(null)} className="rounded-xl border-2 border-lamp-ink px-6 py-3">
                Back
            </button>
            <button onClick={() => fetchRecipe('search')} className="lamp-btn px-8 py-3">
                Generate Recipe
            </button>
            </div>
        </div>
        );
    }

    // ---------- 3. Ingredients input ----------
    if (mode === 'ingredients' && !recipe && !loading) {
        return (
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-6">
            <h2 className="font-lamp-display text-5xl font-black text-lamp-ink">What's In Your Kitchen?</h2>

            <textarea
            rows={6}
            placeholder="tomatoes, onions, garlic, rice, eggs..."
            onChange={(e) =>
                setIngredientsInput(
                e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                )
            }
            className="w-full rounded-2xl border-2 border-lamp-ink bg-lamp-cream p-5 outline-none focus:border-lamp-crimson"
            />

            <div className="flex gap-4">
            <button onClick={() => setMode(null)} className="rounded-xl border-2 border-lamp-ink px-6 py-3">
                Back
            </button>
            <button onClick={() => fetchRecipe('ingredients')} className="lamp-btn px-8 py-3">
                Generate Recipe
            </button>
            </div>
        </div>
        );
    }

    // ---------- 4. Loading ----------
    if (loading) {
        return (
        <div className="flex min-h-[60vh] items-center justify-center font-lamp-display text-2xl font-black text-lamp-ink/70">
            Preparing your recipe…
        </div>
        );
    }

    // ---------- 5. Fetch failed ----------
    if (!recipe) {
        return (
        <div className="space-y-4 text-center">
            <p className="font-lamp-display text-xl font-black text-lamp-crimson">Could not fetch the recipe.</p>
            <button onClick={onBack} className="lamp-btn inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4" /> Back to menu
            </button>
        </div>
        );
    }

    // ---------- 6. Recipe spread ----------
    const ingredients = (recipe.ingredients || []).map(normalizeIngredient);
    const steps = recipe.steps || [];
    const heatLevel = missingList.length ? 'Adjusted' : 'Mild Heat';

    return (
        <div className="space-y-8">
        <div className="flex items-center justify-between">
            <button
            onClick={onBack}
            className="group inline-flex items-center gap-3 font-lamp-display text-lg font-black text-lamp-ink transition-colors hover:text-lamp-crimson"
            >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-lamp-ink transition-all group-hover:bg-lamp-ink group-hover:text-lamp-cream">
                <ArrowLeft className="h-5 w-5" />
            </span>
            Back to menu
            </button>

            <span className="hidden font-lamp-body text-xs font-black uppercase tracking-[0.35em] text-lamp-ink/60 sm:block">
            Epicurean Almanac · Issue No. 42
            </span>
        </div>

        <main ref={spreadRef} className="lamp-shadow-pop relative mx-auto w-full max-w-[1340px]" style={{ perspective: '2000px', transformStyle: 'preserve-3d' }}>
            <div className="absolute -top-10 left-4 font-lamp-display text-lg italic text-lamp-ink/50 sm:left-12">
            — recipes for the long afternoon —
            </div>
            <div className="absolute -top-10 right-4 hidden items-center gap-4 text-xs font-black uppercase tracking-[0.35em] text-lamp-ink/60 sm:right-12 sm:flex">
            <span>Vol. XI</span>
            <span>·</span>
            <span>Roasted Root Series</span>
            </div>

            <div className="relative grid grid-cols-1 gap-0 lg:grid-cols-2">
            <div className="lamp-spine hidden lg:block" />

            {/* Left page */}
            <div className="relative z-10">
                <div
                className="lamp-paper lamp-grain min-h-[600px] border-2 border-lamp-ink p-8 sm:p-12 lg:min-h-[840px] lg:rounded-l-[60px_80px] lg:border-r-0 lg:p-20"
                style={{ transformOrigin: 'right center' }}
                >
                <div className="relative z-10">
                    <span className="mb-6 block font-lamp-display text-[11px] font-black uppercase tracking-[0.4em] text-lamp-crimson sm:mb-10">
                    Kitchen Note No. 042
                    </span>

                    <h1 ref={titleRef} className="mb-8 font-lamp-display text-5xl font-black leading-[0.85] tracking-tight text-lamp-ink sm:mb-14 sm:text-7xl lg:text-[104px]">
                    {recipe.dish}
                    </h1>

                    <div className="mb-10 flex flex-wrap gap-3 sm:mb-20 sm:gap-5">
                    <div className="lamp-chip">
                        <Users className="h-3.5 w-3.5" /> {recipe.servings || '2 Plates'}
                    </div>
                    <div className="lamp-chip">
                        <Flame className="h-3.5 w-3.5" /> {heatLevel}
                    </div>
                    <div className="lamp-chip" style={{ background: '#EFE0BE' }}>
                        <Clock className="h-3.5 w-3.5" /> {recipe.prep_time || '30 Mins'}
                    </div>
                    </div>

                    <div ref={ingredientsRef} className="max-w-[380px]">
                    <h3 className="mb-6 flex items-center gap-4 font-lamp-display text-xl font-black italic text-lamp-ink sm:mb-10 sm:text-2xl">
                        <span className="h-[2px] w-10 bg-lamp-crimson" /> Ingredients
                    </h3>
                    <ul className="space-y-4 sm:space-y-6">
                        {ingredients.map((ing, i) => (
                        <li
                            key={i}
                            className="ingredient-entry group/item flex cursor-default items-center text-sm font-bold text-lamp-ink transition-colors duration-300 hover:text-lamp-crimson sm:text-base"
                        >
                            <div className="lamp-bullet transition-transform group-hover/item:scale-125" />
                            <span className="truncate">{ing.name}</span>
                            <span className="lamp-leader" />
                            <span className="shrink-0 text-lamp-crimson">{ing.amount || 'As needed'}</span>
                        </li>
                        ))}
                    </ul>

                    <form onSubmit={handleMissingSubmit} className="mt-8 flex gap-2">
                        <input
                        value={missing}
                        onChange={(e) => setMissing(e.target.value)}
                        placeholder="Missing an ingredient?"
                        className="flex-1 rounded-xl border-2 border-lamp-ink bg-lamp-cream px-3 py-2 text-sm text-lamp-ink placeholder:text-lamp-ink/40 focus:border-lamp-pumpkin focus:bg-lamp-cream-2 focus:outline-none"
                        />
                        <button
                        type="submit"
                        aria-label="Refetch recipe without ingredient"
                        className="lamp-btn inline-flex h-10 w-10 items-center justify-center"
                        >
                        <RefreshCcw className="h-4 w-4" />
                        </button>
                    </form>
                    </div>
                </div>

                <div className="relative z-10 mt-12 flex items-end justify-between border-t border-lamp-ink/15 pt-6 sm:mt-16 sm:pt-10">
                    <div className="max-w-[260px] font-lamp-display text-sm italic leading-relaxed text-lamp-ink/70 sm:text-base">
                    “The dish should yield to a fork, yet retain its architecture.”
                    </div>
                    <div className="text-right">
                    <span className="block font-lamp-display text-4xl font-black leading-none text-lamp-ink sm:text-5xl">001</span>
                    <span className="mt-2 block text-[10px] font-black uppercase tracking-[0.5em] text-lamp-ink/40">Page</span>
                    </div>
                </div>
                </div>
            </div>

            {/* Right page */}
            <div className="relative z-10">
                <div
                className="lamp-paper lamp-grain min-h-[600px] border-2 border-lamp-ink p-8 sm:p-12 lg:min-h-[840px] lg:rounded-r-[60px_80px] lg:border-l-0 lg:p-20"
                style={{ transformOrigin: 'left center' }}
                >
                <div className="relative z-10">
                    <div ref={stepsRef} className="max-w-[460px]">
                    <h3 className="mb-8 flex items-center gap-4 font-lamp-display text-xl font-black italic text-lamp-ink sm:mb-12 sm:text-2xl">
                        <span className="h-[2px] w-10 bg-lamp-crimson" /> Preparation Method
                    </h3>
                    <div className="space-y-8 sm:space-y-12">
                        {steps.map((step, i) => (
                        <div key={i} className="method-step flex gap-4 sm:gap-8">
                            <span className="shrink-0 font-lamp-display text-2xl font-black italic leading-none text-lamp-crimson sm:text-4xl">
                            {formatStepNumber(i)}
                            </span>
                            <p className="font-lamp-body text-sm font-bold leading-relaxed text-lamp-ink sm:text-base">
                            {step}
                            </p>
                        </div>
                        ))}
                    </div>
                    </div>

                    <div className="mt-12 flex flex-col items-start sm:mt-16">
                    <div ref={imageRef} className="group relative mb-8 self-center lg:self-start lg:ml-16">
                        <div className="relative h-[200px] w-[280px] rotate-[-2deg] overflow-hidden border-[3px] border-lamp-ink bg-lamp-cream lamp-cut transition-all duration-700 group-hover:rotate-[3deg] group-hover:scale-[1.05] sm:h-[260px] sm:w-[360px]">
                        <img
                            src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                            alt={`Prepared ${recipe.dish}`}
                            className="h-full w-full object-cover grayscale-[0.1] contrast-[1.1]"
                            loading="lazy"
                        />
                        <div className="absolute left-3 top-3 bg-lamp-ink px-3 py-1.5 font-lamp-display text-[10px] font-black uppercase tracking-widest text-lamp-cream sm:left-5 sm:top-5">
                            Plate IV · Fig. 1
                        </div>
                        </div>
                        <div className="pointer-events-none absolute -top-5 left-1/2 z-10 h-7 w-28 -translate-x-1/2 rotate-[-8deg] bg-lamp-pumpkin/70 mix-blend-multiply shadow-sm sm:-top-6 sm:h-9 sm:w-32" style={{ borderLeft: '1px dashed rgba(58,44,92,0.2)', borderRight: '1px dashed rgba(58,44,92,0.2)' }} />
                    </div>

                    <div className="flex w-full items-end justify-between border-t border-lamp-ink/15 pt-6 sm:pt-10">
                        <div className="font-lamp-display text-base font-black italic text-lamp-crimson">
                        {recipe.pairing || 'Plate with: fresh herbs & a light dressing'}
                        </div>
                        <div className="text-right">
                        <span className="block font-lamp-display text-4xl font-black leading-none text-lamp-ink sm:text-5xl">002</span>
                        <span className="mt-2 block text-[10px] font-black uppercase tracking-[0.5em] text-lamp-ink/40">Page</span>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </main>
        </div>
    );
}

export default RecipePage;