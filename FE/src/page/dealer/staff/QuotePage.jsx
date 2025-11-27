import Quote from "../../../sections/dealer/staff/orderManagement/Quote";
import { Helmet } from "react-helmet";

export default function QuotePage() {
  return (
    <div>
      <Helmet>
        <title>Báo Giá</title>
      </Helmet>
      <Quote />
    </div>
  );
}
