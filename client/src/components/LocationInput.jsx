// LocationInput.jsx
import { useState, useEffect, useRef } from 'react';

function LocationInput({ value, onChange }) {
    const [query, setQuery] = useState(value || '');
    const [results, setResults] = useState([]);
    const debounceRef = useRef();

    useEffect(() => {
        if (query.length < 3) { setResults([]); return; }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
        setResults(await res.json());
        }, 400);
    }, [query]);

    return (
        <div className="relative">
        <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city..."
            className="
                h-12
                w-full
                rounded-xl
                border-2
                border-crave-ink
                bg-crave-bone2
                px-3
                text-sm
                text-crave-ink
                placeholder:text-crave-ink/50
                focus:outline-none
                focus:ring-0
            "
            />
        {results.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full
                overflow-hidden
                rounded-xl
                border-2
                border-crave-ink
                bg-crave-bone
                ">
            {results.map((r) => (
                <li key={r.place_id} onClick={() => {
                onChange({ label: r.display_name, lat: r.lat, lon: r.lon });
                setQuery(r.display_name);
                setResults([]);
                }} className="cursor-pointer px-3 py-2 hover:bg-crave-bone2 text-sm">
                {r.display_name}
                </li>
            ))}
            </ul>
        )}
        </div>
    );
}

export default LocationInput;