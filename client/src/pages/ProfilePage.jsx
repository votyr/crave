import { useState, useEffect } from 'react';
import { Save, Info } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import LocationInput from '../components/LocationInput';
import Badge from '../components/ui/Badge';

const dietaryOptions = ['vegetarian', 'vegan', 'halal', 'kosher', 'pescatarian', 'gluten-free', 'dairy-free'];
const goalOptions = [
  { value: '', label: 'Select a goal...' },
  { value: 'lose', label: 'Lose weight' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'gain', label: 'Gain strength' },
];

const activityOptions = [
  { value: '', label: 'Select an activity level...' },
  { value: 'light', label: 'Light' },
  { value: 'active', label: 'Active' },
  { value: 'athletic', label: 'Athletic' },
];
const religionOptions = [
  { value: '', label: 'Select a religion...' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'christian', label: 'Christian' },
  { value: 'hindu', label: 'Hindu' },
  { value: 'jewish', label: 'Jewish' },
  { value: 'buddhist', label: 'Buddhist' },
  { value: 'none', label: 'No preference' },
  { value: 'other', label: 'Other' },
];

function ProfilePage({ profile, onProfileChange, onSave, climateLoading }) {
  const [message, setMessage] = useState('');

  const updateField = (event) => {
    const { name, value } = event.target;
    onProfileChange((current) => ({ ...current, [name]: value }));
  };

  const toggleDietary = (option) => {
    const current = profile.dietary || [];
    const next = current.includes(option) ? current.filter((o) => o !== option) : [...current, option];
    onProfileChange((prev) => ({ ...prev, dietary: next }));
  };

  const handleSave = async () => {
    const result = await onSave(profile);
    setMessage(result?.message || 'Saved');
  };

  return (
    <div className="rounded-2xl border-2 border-crave-ink bg-crave-bone p-6 shadow-hard">
      <div className="mb-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest2 text-crave-poppy">Profile</p>
        <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Set up the details CRAVE should learn from
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Input label="Name" name="name" value={profile.name} onChange={updateField} />
        <Input label="Age" name="age" value={profile.age} onChange={updateField} />
        <div className="flex gap-2">
          <Input label="Weight" name="weightValue" type="number" value={profile.weightValue} onChange={updateField} />
          <select name="weightUnit" value={profile.weightUnit || 'kg'} onChange={updateField} className="rounded-xl border-2 border-crave-ink px-2">
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </div>
        <Input
          label="Goal"
          name="goal"
          as="select"
          value={profile.goal}
          onChange={updateField}
          options={goalOptions}
        />
        <Input
          label="Activity"
          name="activity"
          as="select"
          value={profile.activity}
          onChange={updateField}
          options={activityOptions}
        />
        <LocationInput
          value={profile.location?.label || ''}
          onChange={(location) =>
            onProfileChange((current) => ({
              ...current,
              location,
            }))
          }
        />
        <Input label="Religion" name="religion" as="select" value={profile.religion} onChange={updateField} options={religionOptions} />
        <Input
          label="Climate"
          value={profile.climate || 'Unknown'}
          readOnly
        />
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-crave-ink">
            <span className="mb-2 block font-mono text-[11px] font-bold uppercase tracking-widest2 text-crave-ink/70">
              Dietary tags
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((option) => {
              const active = (profile.dietary || []).includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleDietary(option)}
                  className={`rounded-full border-2 border-crave-ink px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest transition ${
                    active
                      ? 'bg-crave-poppy text-crave-bone shadow-hard-sm'
                      : 'bg-crave-bone2 text-crave-ink hover:bg-crave-bone'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
        <div className="md:col-span-2">
          <Input
            label="Allergies (comma separated)"
            name="allergies"
            value={Array.isArray(profile.allergies) ? profile.allergies.join(', ') : profile.allergies}
            onChange={(e) =>
              onProfileChange((current) => ({
                ...current,
                allergies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              }))
            }
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="solid" onClick={handleSave} disabled={climateLoading}>
          {climateLoading ? 'Fetching climate...' : 'Save profile'}
        </Button>
        {message && <p className="text-sm font-semibold text-crave-jade">{message}</p>}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-crave-ink bg-crave-butter p-4 text-crave-ink shadow-hard-sm">
        <Info className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm leading-relaxed">
          This profile can be stored locally or synced with your backend account when the server is available. Your
          religion and dietary tags help the AI respect your preferences.
        </p>
      </div>
    </div>
  );
}

export default ProfilePage;
