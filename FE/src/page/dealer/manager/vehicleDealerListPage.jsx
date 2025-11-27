import React from "react";
import VehicleDealerList from "../../../sections/dealer/manager/vehicleManagement/vehicleDealerList";
import { Helmet } from "react-helmet";

const VehicleDealerListPage = () => {
    return (
        <>
            <Helmet>
                <title>Thông tin phương tiện</title>
            </Helmet>
            <VehicleDealerList />
        </>
    );
};

export default VehicleDealerListPage;
