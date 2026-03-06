import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppLayout } from "./components/layout/AppLayout";
import { OverviewPage } from "./pages/OverviewPage";
import { BanksPage } from "./pages/BanksPage";
import { PrudentialPage } from "./pages/PrudentialPage";
import { RiskPage } from "./pages/RiskPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { ProfilesPage } from "./pages/ProfilesPage";
import { ExecutiveSummaryPage } from "./pages/ExecutiveSummaryPage";
import { StressTestPage } from "./pages/StressTestPage";
import { ComparePage } from "./pages/ComparePage";
import { SourcesPage } from "./pages/SourcesPage";

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/executive" element={<ExecutiveSummaryPage />} />
            <Route path="/banks" element={<BanksPage />} />
            <Route path="/prudential" element={<PrudentialPage />} />
            <Route path="/risk" element={<RiskPage />} />
            <Route path="/stress" element={<StressTestPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/profiles" element={<ProfilesPage />} />
            <Route path="/sources" element={<SourcesPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}
