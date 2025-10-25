import { Route } from "react-router-dom";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Lazy load all test components
const DebugPage = lazy(() => import("@/pages/DebugPage"));
const MatchingTestPage = lazy(() => import("@/pages/MatchingTestPage").then(m => ({ default: m.MatchingTestPage })));
const SubscriptionTestPage = lazy(() => import("@/pages/SubscriptionTestPage"));
const SubscriptionTestPhases = lazy(() => import("@/pages/SubscriptionTestPhases"));
const SubscriptionValidation = lazy(() => import("@/pages/SubscriptionValidation"));
const SimpleSubscriptionTest = lazy(() => import("@/pages/SimpleSubscriptionTest"));
const WorkingSubscriptionTest = lazy(() => import("@/pages/WorkingSubscriptionTest"));
const FinalSubscriptionTest = lazy(() => import("@/pages/FinalSubscriptionTest"));
const CompleteSubscriptionTest = lazy(() => import("@/pages/CompleteSubscriptionTest"));
const SilverFeatureTest = lazy(() => import("@/pages/SilverFeatureTest").then(m => ({ default: m.SilverFeatureTest })));
const DebugProfiles = lazy(() => import("@/pages/DebugProfiles"));
const TestLogin = lazy(() => import("@/pages/TestLogin"));
const DatabaseTest = lazy(() => import("@/pages/DatabaseTest"));
const ExecuteSQL = lazy(() => import("@/pages/ExecuteSQL"));
const FixDatabase = lazy(() => import("@/pages/FixDatabase"));
const TestServiceRole = lazy(() => import("@/pages/TestServiceRole"));
const SubscriptionDebugTest = lazy(() => import("@/pages/SubscriptionDebugTest"));

export const testRoutes = (
  <>
    <Route path="/debug" element={<ProtectedRoute requireRole="admin"><DebugPage /></ProtectedRoute>} />
    <Route path="/matching-test" element={<ProtectedRoute requireRole="admin"><MatchingTestPage /></ProtectedRoute>} />
    <Route path="/subscription-test" element={<ProtectedRoute requireRole="admin"><SubscriptionTestPage /></ProtectedRoute>} />
    <Route path="/subscription-phases" element={<ProtectedRoute requireRole="admin"><SubscriptionTestPhases /></ProtectedRoute>} />
    <Route path="/subscription-validation" element={<ProtectedRoute requireRole="admin"><SubscriptionValidation /></ProtectedRoute>} />
    <Route path="/simple-subscription-test" element={<ProtectedRoute requireRole="admin"><SimpleSubscriptionTest /></ProtectedRoute>} />
    <Route path="/working-subscription-test" element={<ProtectedRoute requireRole="admin"><WorkingSubscriptionTest /></ProtectedRoute>} />
    <Route path="/final-subscription-test" element={<ProtectedRoute requireRole="admin"><FinalSubscriptionTest /></ProtectedRoute>} />
    <Route path="/complete-subscription-test" element={<ProtectedRoute requireRole="admin"><CompleteSubscriptionTest /></ProtectedRoute>} />
    <Route path="/silver-test" element={<ProtectedRoute><SilverFeatureTest /></ProtectedRoute>} />
    <Route path="/debug-profiles" element={<DebugProfiles />} />
    <Route path="/test-login" element={<TestLogin />} />
    <Route path="/database-test" element={<DatabaseTest />} />
    <Route path="/execute-sql" element={<ExecuteSQL />} />
    <Route path="/fix-database" element={<FixDatabase />} />
    <Route path="/test-service-role" element={<TestServiceRole />} />
    <Route path="/subscription-debug" element={<ProtectedRoute><SubscriptionDebugTest /></ProtectedRoute>} />
  </>
);