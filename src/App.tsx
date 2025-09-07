import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "leaflet/dist/leaflet.css";
import { routeList } from "./routes";
import { OpenPlayDetailPage } from "./pages";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
        {/* Public Routes */}
        <Route element={routeList.public.layout}>
          {routeList.public.routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
        <Route path="/open-play/:id" element={<OpenPlayDetailPage />} />
        {/* Private Routes */}
        <Route element={routeList.private.layout}>
          {routeList.private.routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>

        {/* SportsHub Routes */}
        <Route element={routeList.sportshub.layout}>
          {routeList.sportshub.routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>

        {/* Standalone Routes (no layout) */}
        {routeList.standalone.routes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
