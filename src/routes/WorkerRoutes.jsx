import React from "react";
import { Routes, Route } from "react-router-dom";

/* Worker Pages */
import WorkerOverview from "../pages/overview/WorkerOverview";
import AvailableJobs from "../pages/jobs/AvailableJobs";
import AppliedJobs from "../pages/jobs/AppliedJobs";
import WorkerEarnings from "../pages/payments/WorkerEarnings";
import WorkerReviews from "../pages/reviews/WorkerReviews";
import WorkerVerification from "../pages/verification/WorkerVerification";

/* Others*/
import NotFound from "../pages/common/NotFound";

function WorkerRoutes() {
  return (
    <Routes>
      <Route path="overview" element={<WorkerOverview />} />
      <Route path="jobs/available" element={<AvailableJobs />} />
      <Route path="jobs/applied" element={<AppliedJobs />} />
      <Route path="earnings" element={<WorkerEarnings />} />
      <Route path="reviews" element={<WorkerReviews />} />
      <Route path="verification" element={<WorkerVerification />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default WorkerRoutes;
