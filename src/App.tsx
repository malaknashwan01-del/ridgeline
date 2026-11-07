import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './context/AuthContext';
import AppShell, { PageLoader } from './components/layout/AppShell';

// Each page is its own chunk; the map and chart libraries only load where they're used.
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Explore = lazy(() => import('./pages/Explore'));
const TrailDetail = lazy(() => import('./pages/TrailDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Hikes = lazy(() => import('./pages/Hikes'));
const Planner = lazy(() => import('./pages/Planner'));
const Saved = lazy(() => import('./pages/Saved'));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="explore" element={<Explore />} />
          <Route path="trails/:id" element={<TrailDetail />} />
          <Route path="saved" element={<Saved />} />
          <Route path="hikes" element={<Hikes />} />
          <Route path="planner" element={<Planner />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
