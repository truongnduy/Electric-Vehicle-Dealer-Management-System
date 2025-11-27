import axiosClient from "../config/axiosClient";

const getTestDrives = async (dealerId) => {
  return await axiosClient.get(
    `/api/testdrives/get-test-drives-by-dealer/${dealerId}`
  );
};

const createTestDrive = async (data) => {
  return await axiosClient.post("/api/testdrives/create-test-drive", data);
};

const updateTestDriveStatus = async (testDriveId, status, note = "") => {
  return await axiosClient.put(
    `/api/testdrives/update-test-drive-status/${testDriveId}/status?status=${status}&note=${note}`
  );
};

const completeTestDrive = async (testDriveId, note = "") => {
  return await axiosClient.put(
    `/api/testdrives/update-test-drive-status/${testDriveId}/status?status=COMPLETED&note=${note}`
  );
};

const ReschuduleTestDrive = async (testDriveId, newDate) => {
  return await axiosClient.put(
    `/api/testdrives/reschedule-test-drive/${testDriveId}/reschedule?newDate=${newDate}`
  );
}

const cancelTestDrive = async (testDriveId) => {
  return await axiosClient.delete(
    `/api/testdrives/cancel-test-drive/${testDriveId}/cancel`
  );
};

export { 
  getTestDrives, 
  createTestDrive, 
  updateTestDriveStatus, 
  cancelTestDrive, 
  ReschuduleTestDrive,
  completeTestDrive 
};
