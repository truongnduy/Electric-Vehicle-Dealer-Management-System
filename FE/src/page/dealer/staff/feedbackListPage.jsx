import DealerStaffFeedbackListPage from "../../../sections/dealer/staff/feedbackManagement/feedbackList";
import { Helmet } from "react-helmet";

export default function FeedbackListPage() {
  return (
    <>
      <Helmet>
        <title>Feedback Management</title>
      </Helmet>
      <DealerStaffFeedbackListPage />
    </>
  );
}