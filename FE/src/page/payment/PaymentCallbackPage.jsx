import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin, Card } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import useAuthen from "../../hooks/useAuthen";
import usePaymentStore from "../../hooks/usePayment";
import useCustomerDebt from "../../hooks/useCustomerDebt"; 

export default function PaymentCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, role, isInitialized } = useAuthen();
  const { paymentSuccess } = usePaymentStore();
  const { createCustomerDebtFromPayment } = useCustomerDebt(); 
  const processedRef = useRef(false);

  // Tối ưu: Memoize helper functions
  const getRedirectUrl = React.useCallback((userRole) => {
    return userRole === "DEALER_MANAGER"
      ? "/dealer-manager/dealer-orders"
      : userRole === "DEALER_STAFF"
      ? "/dealer-staff/orders"
      : "/";
  }, []);

  const showSuccessToast = React.useCallback(() => {
    toast.success("Thanh toán VNPay thành công!", {
      position: "top-right",
      autoClose: 3000,
    });
  }, []);

  const handlePaymentSuccess = React.useCallback(async (orderId, paymentType, paymentId, userRole) => {
    // Cập nhật trạng thái đơn hàng
    const statusToUpdate = paymentType === "FULL" ? "PAID" : "PARTIAL";
    await paymentSuccess(orderId, statusToUpdate);

    // Tạo công nợ nếu cần
    if (paymentType === "INSTALLMENT" && userRole === "DEALER_STAFF" && paymentId) {
      try {
        const debtResponse = await createCustomerDebtFromPayment(paymentId);
        
        if (debtResponse?.status === 200) {
          showSuccessToast();
        } else {
          toast.warn("Thanh toán thành công nhưng tạo công nợ thất bại!", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (debtError) {
        console.error("❌ Error creating debt:", debtError);
        toast.error("Thanh toán thành công nhưng lỗi khi tạo công nợ!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } else {
      showSuccessToast();
    }
  }, [paymentSuccess, createCustomerDebtFromPayment, showSuccessToast]);

  useEffect(() => {
    // Prevent multiple processing
    if (processedRef.current) return;

    // Đợi auth state được khởi tạo
    if (!isInitialized) return;

    // Nếu chưa đăng nhập, redirect về login
    if (!isAuthenticated) {
      processedRef.current = true;
      navigate("/", { replace: true });
      return;
    }

    const pendingPaymentStr = sessionStorage.getItem("pendingVNPayPayment");

    if (!pendingPaymentStr) {
      processedRef.current = true;
      navigate(getRedirectUrl(role), { replace: true });
      return;
    }

    // Xử lý VNPay callback
    const handleCallback = async () => {
      try {
        processedRef.current = true;

        const pendingPayment = JSON.parse(pendingPaymentStr);
        const { orderId, paymentType, paymentId, userRole } = pendingPayment;

        const vnpResponseCode = searchParams.get("vnp_ResponseCode");
        const vnpTransactionStatus = searchParams.get("vnp_TransactionStatus");

        // Kiểm tra kết quả thanh toán
        if (vnpResponseCode === "00" && vnpTransactionStatus === "00") {
          await handlePaymentSuccess(orderId, paymentType, paymentId, userRole);
        } else {
          toast.error("Thanh toán VNPay thất bại hoặc đã bị hủy!", {
            position: "top-right",
            autoClose: 3000,
          });
        }

        // Clear và redirect
        sessionStorage.removeItem("pendingVNPayPayment");
        navigate(getRedirectUrl(userRole), { replace: true });
      } catch (error) {
        console.error("❌ Error processing VNPay callback:", error);
        toast.error("Đã xảy ra lỗi khi xử lý kết quả thanh toán");

        // Vẫn redirect về trang order list
        sessionStorage.removeItem("pendingVNPayPayment");
        navigate(getRedirectUrl(role), { replace: true });
      }
    };

    handleCallback();
  }, [
    navigate,
    searchParams,
    isAuthenticated,
    role,
    isInitialized,
    getRedirectUrl,
    handlePaymentSuccess,
  ]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card style={{ textAlign: "center", padding: 40 }}>
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          size="large"
        />
        <h3 style={{ marginTop: 20 }}>Đang xử lý kết quả thanh toán...</h3>
      </Card>
    </div>
  );
}