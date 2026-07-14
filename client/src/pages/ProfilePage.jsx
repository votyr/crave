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
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              label="Weight"
              name="weightValue"
              type="number"
              value={profile.weightValue}
              onChange={updateField}
            />
          </div>

          <select
            name="weightUnit"
            value={profile.weightUnit || "kg"}
            onChange={updateField}
            className="
              h-12
              rounded-xl
              border-2
              border-crave-ink
              bg-crave-bone2
              px-3
              text-sm
              text-crave-ink
              focus:outline-none
              focus:ring-0
            "
          >
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
        <div>
          <label className="mb-2 block font-mono text-[11px] font-bold uppercase tracking-widest2 text-crave-ink/70">
            City
          </label>

          <LocationInput
            value={profile.location?.label || ""}
            onChange={(location) =>
              onProfileChange((current) => ({
                ...current,
                location,
              }))
            }
          />
        </div>
        <Input label="Religion" name="religion" as="select" value={profile.religion} onChange={updateField} options={religionOptions} />
        <div className="rounded-xl border-2 border-crave-ink bg-crave-bone2 p-4">
          <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-widest2 text-crave-ink/70">
            Local Weather
          </p>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-display font-extrabold">
                {profile.weather?.temperature ?? "--"}°
              </p>
              <p className="text-xs uppercase opacity-70">
                Temp
              </p>
            </div>

            <div>
              <p className="text-2xl font-display font-extrabold">
                {profile.weather?.humidity ?? "--"}%
              </p>
              <p className="text-xs uppercase opacity-70">
                Humidity
              </p>
            </div>

            <div>
              <p className="text-lg font-display font-extrabold capitalize">
                {profile.weather?.climate || "--"}
              </p>
              <p className="text-xs uppercase opacity-70">
                Climate
              </p>
            </div>
          </div>
        </div>
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

    </div>
  );
}

export default ProfilePage;
