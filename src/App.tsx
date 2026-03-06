import { HashRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { OverviewPage } from "./pages/OverviewPage";
import { BanksPage } from "./pages/BanksPage";
import { PrudentialPage } from "./pages/PrudentialPage";
import { RiskPage } from "./pages/RiskPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { ProfilesPage } from "./pages/ProfilesPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/banks" element={<BanksPage />} />
          <Route path="/prudential" element={<PrudentialPage />} />
          <Route path="/risk" element={<RiskPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profiles" element={<ProfilesPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
