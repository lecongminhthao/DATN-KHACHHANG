import React, { useEffect, useState, useRef } from "react";
import { Button, Result } from "antd";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const CheckPayment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const [status, setStatus] = useState<"success" | "error">("error");
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const calledRef = useRef(false); // tránh gọi createOrder nhiều lần

  useEffect(() => {
    (async () => {
      if (calledRef.current) return;
      calledRef.current = true;

      try {
        let paymentSuccess = false;
        const paymentMethod = searchParams.get("paymentMethod");

        // Kiểm tra VNPay return parameters trực tiếp
        const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
        const vnp_TxnRef = searchParams.get("vnp_TxnRef");

        console.log('VNPay return params:', {
          vnp_ResponseCode,
          vnp_TxnRef,
          allParams: Object.fromEntries(searchParams.entries())
        });

        if (vnp_ResponseCode) {
          // Đây là VNPay return
          if (vnp_ResponseCode === "00") {
            paymentSuccess = true;
            console.log('✅ VNPay payment successful');
          } else {
            paymentSuccess = false;
            console.log('❌ VNPay payment failed, code:', vnp_ResponseCode);
          }
        } else if (paymentMethod === "zalopay") {
          const statusParam = searchParams.get("status");
          if (Number(statusParam) === 1) paymentSuccess = true;
        } else {
          // Fallback cho các trường hợp khác
          const { data } = await axios.get(
            `http://localhost:3000/client/check_payment?${searchParams.toString()}`
          );
          if (data.data.vnp_ResponseCode === "00") paymentSuccess = true;
          else if (data.data.vnp_ResponseCode === "24") paymentSuccess = false;
        }

        if (paymentSuccess) {
          setStatus("success");
          setTitle("Thanh toán thành công");
          toast.success("🎉 Thanh toán thành công! Đang cập nhật đơn hàng...");

          // Kiểm tra xem có phải VNPay return không
          const vnp_TxnRef = searchParams.get("vnp_TxnRef");
          if (vnp_TxnRef) {
            // Đây là VNPay return - cập nhật trạng thái đơn hàng đã tồn tại
            await updateVNPayOrderStatus();
          } else {
            // Tạo đơn hàng mới (cho các payment method khác)
            await createOrder();
          }
        } else {
          setStatus("error");
          setTitle("Khách hàng hủy thanh toán hoặc thanh toán thất bại");
          toast.error("❌ Thanh toán không thành công hoặc đã bị huỷ.");
        }
      } catch (error) {
        setStatus("error");
        setTitle("Đã có lỗi xảy ra trong quá trình thanh toán");
        toast.error("⚠️ Lỗi trong quá trình kiểm tra thanh toán.");
        console.error(error);
      }
    })();
  }, [location.search]);

  const createOrder = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("user");
      if (!token) throw new Error("Không tìm thấy user token");

      const decoded: any = jwtDecode(token);
      const userId = decoded._id || decoded.userId;
      if (!userId) throw new Error("Token không chứa userId");

      const checkoutInfoStr = localStorage.getItem("checkoutInfo");
      const selectedVouchersStr = localStorage.getItem("selectedVouchers");
      if (!checkoutInfoStr) throw new Error("Không tìm thấy thông tin nhận hàng");

      const checkoutInfo = JSON.parse(checkoutInfoStr);
      const voucherIds: string[] = selectedVouchersStr ? JSON.parse(selectedVouchersStr) : [];

      const orderData = {
        userId,
        shippingInfo: {
          name: checkoutInfo.name,
          phone: checkoutInfo.phone,
          address: checkoutInfo.address,
          note: checkoutInfo.note || "",
        },
        paymentMethod: checkoutInfo.paymentMethod,
        selectedVouchers: voucherIds, // Đổi tên để nhất quán với COD API
        voucherDiscount: checkoutInfo.voucherDiscount || 0, // Thêm thông tin voucher discount
      };

      console.log('Gửi dữ liệu tạo order sau thanh toán:', orderData);
      const res = await axios.post("http://localhost:3000/client/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 201) {
        const orderId = res.data.order?._id || res.data.orderId;
        const voucherDiscount = checkoutInfo.voucherDiscount || 0;

        localStorage.removeItem("checkoutInfo");
        localStorage.removeItem("selectedVouchers");
        toast.success("✅ Đơn hàng đã được tạo thành công!");

        setTimeout(() => {
          if (orderId) {
            navigate(`/client/orderdetail/${orderId}?voucherDiscount=${voucherDiscount}&orderDiscount=50000`);
          } else {
            navigate("/client/customer");
          }
        }, 2000);
      } else {
        toast.error("❌ Tạo đơn hàng thất bại. Vui lòng liên hệ hỗ trợ.");
      }
     
    } catch (error) {
      console.error("Lỗi tạo đơn hàng:", error);
      toast.error("⚠️ Lỗi khi tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật trạng thái đơn hàng VNPay
  const updateVNPayOrderStatus = async () => {
    try {
      const orderCode = searchParams.get("vnp_TxnRef");
      const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");

      if (!orderCode) {
        throw new Error("Không tìm thấy mã đơn hàng từ VNPay");
      }

      console.log('Cập nhật trạng thái đơn hàng VNPay:', { orderCode, vnp_ResponseCode });

      const res = await axios.post("http://localhost:3000/client/update-vnpay-order", {
        orderCode,
        vnp_ResponseCode
      });

      if (res.data.success) {
        const orderId = res.data.orderId;
        const checkoutInfo = JSON.parse(localStorage.getItem("checkoutInfo") || "{}");
        const voucherDiscount = checkoutInfo.voucherDiscount || 0;

        localStorage.removeItem("checkoutInfo");
        localStorage.removeItem("selectedVouchers");
        toast.success("✅ Đơn hàng VNPay đã được cập nhật thành công!");

        setTimeout(() => {
          if (orderId) {
             navigate("/client/customer");
          } else {
            navigate(`/client/orderdetail/${orderId}?voucherDiscount=${voucherDiscount}&orderDiscount=50000`);

          }
        }, 2000);
      } else {
        toast.error("❌ Cập nhật đơn hàng VNPay thất bại.");
      }

    } catch (error) {
      console.error("Lỗi cập nhật đơn hàng VNPay:", error);
      toast.error("⚠️ Lỗi khi cập nhật đơn hàng VNPay. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Result
        status={status}
        title={title}
        subTitle="Vui lòng đợi hệ thống xử lý đơn hàng."
        extra={[
          <Button key="home" onClick={() => navigate("/")}>
            Trang chủ
          </Button>,
          <Button key="orders" type="primary" onClick={() => navigate("/client/customer")}>
            Xem đơn hàng
          </Button>,
        ]}
      />
      {loading && <p>Đang tạo đơn hàng, vui lòng chờ...</p>}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default CheckPayment;
