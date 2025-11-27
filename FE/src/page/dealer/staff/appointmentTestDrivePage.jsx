import WeeklyCalendar from "../../../sections/dealer/staff/appointmentManagement/appointmentCalander";
import { Helmet } from "react-helmet";

export default function AppointmentTestDrivePage() {
  return (
    <>
      <Helmet>
        <title>Appointment Test Drive</title>
      </Helmet>
      <WeeklyCalendar />
    </>
  );
}
