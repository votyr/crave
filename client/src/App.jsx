import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AppShell from './components/AppShell';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import FitnessPage from './pages/FitnessPage';
import NutritionPage from './pages/NutritionPage';
import CommunityPage from './pages/CommunityPage';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    weightValue: "",
    weightUnit: "kg",
    goal: "",
    activity: "",
    dietary: [],
    religion: "",
    location: null,

    weather: {
      temperature: null,
      humidity: null,
      climate: "",
    },

    allergies: [],
  });

  const [backendStatus, setBackendStatus] = useState('Checking connection...');
  const [climateLoading, setClimateLoading] = useState(false);

  const [auth, setAuth] = useState(() => {
    const savedUser = localStorage.getItem('crave_user');
    const savedToken = localStorage.getItem('crave_token');

    return {
      isAuthenticated: Boolean(savedToken),
      user: savedUser ? JSON.parse(savedUser) : null,
    };
  });

  const authToken = localStorage.getItem('crave_token');

  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((r) => r.json())
      .then((data) => setBackendStatus(data.message || 'Backend connected'))
      .catch(() => setBackendStatus('Backend offline — local preview mode'));
  }, []);

  useEffect(() => {
    if (!auth.isAuthenticated || !authToken) return;

    fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setAuth((current) => ({
            ...current,
            user: data.user,
          }));
        }
      })
      .catch(console.error);
  }, [auth.isAuthenticated, authToken]);

  useEffect(() => {
    if (!auth.isAuthenticated || !authToken) return;

    fetch(`${API_BASE}/api/profile`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((data) => {
        const weightValue = data.weight ?? '';
        const weightUnit = 'kg'; // no unit column yet, default

        setProfile({
          name: auth.user?.name || '',
          age: data.age || '',
          weightValue,
          weightUnit,
          goal: data.goal || '',
          activity: data.activity || '',
          dietary: data.dietary || [],
          religion: data.religion || '',
          location: data.location?.label
            ? { label: data.location.label, lat: data.location.lat, lon: data.location.lon }
            : null,
          weather: {
            temperature: data.weather?.temperature ?? null,
            humidity: data.weather?.humidity ?? null,
            climate: data.weather?.climate || '',
          },
          allergies: data.allergies || [],
        });
      })
      .catch(console.error);
  }, [auth.isAuthenticated, authToken, auth.user]);

  useEffect(() => {
    if (!profile.location?.lat || !profile.location?.lon) return;

    setClimateLoading(true);

    fetch(
      `${API_BASE}/api/user/stats?location=${profile.location.lat},${profile.location.lon}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.weather?.climate) {
          setProfile((current) => ({
            ...current,
            weather: {
              temperature: data.weather.temperature,
              humidity: data.weather.humidity,
              climate: data.weather.climate,
            },
          }));
        }
      })
      .catch(console.error)
      .finally(() => setClimateLoading(false));
  }, [profile.location?.label]);

  const handleAuth = async ({ fullName, email, password, mode }) => {
    try {
      const endpoint =
        mode === 'signup'
          ? '/api/auth/register'
          : '/api/auth/login';

      const body =
        mode === 'signup'
          ? JSON.stringify({
              name: fullName,
              email,
              password,
            })
          : JSON.stringify({
              email,
              password,
            });

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message:
            data.error || 'Could not authenticate.',
        };
      }

      localStorage.setItem('crave_token', data.token);
      localStorage.setItem(
        'crave_user',
        JSON.stringify(data.user)
      );

      setAuth({
        isAuthenticated: true,
        user: data.user,
      });

      return { success: true };
    } catch {
      return {
        success: false,
        message: 'Backend unavailable.',
      };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('crave_token');
    localStorage.removeItem('crave_user');

    setAuth({
      isAuthenticated: false,
      user: null,
    });
  };

  const handleProfileSave = async (nextProfile) => {
    setProfile(nextProfile);

    const token = localStorage.getItem('crave_token');

    if (!token) {
      return {
        success: true,
        message: 'Profile saved locally.',
      };
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/users/profile`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            age: nextProfile.age,
            weight: parseFloat(nextProfile.weightValue) || null,
            goal: nextProfile.goal,
            activityLevel: nextProfile.activity,
            dietaryPreferences: nextProfile.dietary,
            religion: nextProfile.religion,
            location: nextProfile.location?.label || '',
            lat: nextProfile.location?.lat ?? null,
            lon: nextProfile.location?.lon ?? null,
            temperature: nextProfile.weather?.temperature,
            humidity: nextProfile.weather?.humidity,
            climate: nextProfile.weather?.climate,
            allergies: nextProfile.allergies,
          }),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: 'Sync failed.',
        };
      }

      return {
        success: true,
        message: 'Profile synced.',
      };
    } catch {
      return {
        success: true,
        message: 'Saved locally.',
      };
    }
  };

  const plan = useMemo(() => {
    const dietary = profile.dietary || [];

    const mealStyle = dietary.includes('vegan')
      ? 'plant-based bowls and legumes'
      : dietary.includes('vegetarian')
      ? 'protein-rich vegetarian plates'
      : 'balanced meals with lean proteins';

    return {
      summary: `${profile.name}, your plan is tailored for ${profile.goal}.`,
      meals: [
        {
          title: 'Breakfast',
          detail: 'Greek yogurt with oats',
        },
        {
          title: 'Lunch',
          detail: `Quinoa with ${mealStyle}`,
        },
        {
          title: 'Dinner',
          detail: 'Protein + vegetables',
        },
      ],
      fitness: [
        {
          title: 'Morning',
          detail: '20-minute walk',
        },
      ],
      habits: [
        `Climate: ${profile.climate || 'Unknown'}`,
        `Religion: ${profile.religion || 'None'}`,
      ],
    };
  }, [profile]);

  const handleApplyMealPlan = (result) => {
    setProfile((current) => ({
      ...current,
      customMeals: result.meals, // { Breakfast: [...], Lunch: [...], ... }
    }));
  };

  const handleApplyRecommendation = (result) => {
    setProfile((current) => ({
      ...current,
      aiNotes: result.recommendations,
    }));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={<AuthPage mode="login" onAuth={handleAuth} />}
        />

        <Route
          path="/signup"
          element={<AuthPage mode="signup" onAuth={handleAuth} />}
        />

        <Route
          path="/dashboard"
          element={
            <AppShell
              auth={auth}
              onLogout={handleLogout}
              backendStatus={backendStatus}
            >
              <DashboardPage
                profile={profile}
                backendStatus={backendStatus}
                plan={plan}
              />
            </AppShell>
          }
        />

        <Route
          path="/profile"
          element={
            <AppShell
              auth={auth}
              onLogout={handleLogout}
              backendStatus={backendStatus}
            >
              <ProfilePage
                profile={profile}
                onProfileChange={setProfile}
                onSave={handleProfileSave}
                climateLoading={climateLoading}
              />
            </AppShell>
          }
        />

        <Route
          path="/fitness"
          element={
            <AppShell auth={auth} onLogout={handleLogout} backendStatus={backendStatus}>
              <FitnessPage />
            </AppShell>
          }
        />

        <Route
          path="/nutrition"
          element={
            <AppShell auth={auth} onLogout={handleLogout} backendStatus={backendStatus}>
              <NutritionPage profile={profile} onApplyMealPlan={handleApplyMealPlan} />
            </AppShell>
          }
        />

        <Route
          path="/community"
          element={
            <AppShell auth={auth} onLogout={handleLogout} backendStatus={backendStatus}>
              <CommunityPage />
            </AppShell>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;