import DeliveryList from "../../../sections/dealer/staff/deliveryManagement/deliveryList";
import { Helmet } from "react-helmet";
export default function DeliveryPage() {
  return (
    <>
      <Helmet>
        <title>Delivery Management | EVMS</title>
      </Helmet>
      <DeliveryList />
    </>
  );
}
