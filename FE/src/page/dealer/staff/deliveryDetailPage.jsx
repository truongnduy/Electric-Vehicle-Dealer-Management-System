import DeliveryDetail from "../../../sections/dealer/staff/deliveryManagement/deliveryDetail";
import { Helmet } from "react-helmet";
export default function DeliveryDetailPage() {
  return (
    <>
      <Helmet>
        <title>Delivery Detail | EVMS</title>
      </Helmet>
      <DeliveryDetail />
    </>
  );
}