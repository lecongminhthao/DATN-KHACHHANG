import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CheckoutForm.css';

// Global lock để ngăn multiple requests
let isProcessingOrder = false;

const CheckoutForm: React.FC = () => {
  console.log('🏗️ CheckoutForm COMPONENT MOUNTING/RE-MOUNTING');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const baseAmount = Number(searchParams.get('amount')) || 0;
  const urlVoucherDiscount = Number(searchParams.get('voucherDiscount')) || 0;
  const [invoiceDiscount, setInvoiceDiscount] = useState<number>(0);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'cod'>('vnpay');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const submitRef = useRef(false); // Ref để track submit state

  const [selectedVouchers, setSelectedVouchers] = useState<string[]>(() => {
    const x = localStorage.getItem('selectedVouchers');
    return x ? JSON.parse(x) : [];
  });

  const [selectedCartItems, setSelectedCartItems] = useState<string[]>(() => {
    const x = localStorage.getItem('selectedCartItems');
    console.log('🔍 CHECKOUT INIT - localStorage selectedCartItems:', x);
    const parsed = x ? JSON.parse(x) : [];
    console.log('🔍 CHECKOUT INIT - parsed selectedCartItems:', parsed);
    return parsed;
  });



  // Debug: Track selectedCartItems changes
  useEffect(() => {
    console.log('🔄 selectedCartItems CHANGED:', selectedCartItems);
  }, [selectedCartItems]);

  useEffect(() => {
    const token = localStorage.getItem('user');
    if (token) {
      try {
        const userId = jwtDecode<any>(token).userId;
        axios
          .get('http://localhost:3000/client/order/InvoiceDiscountPromotion', {
            params: { userId },
          })
          .then((res) => {
            if (res.data.eligible) {
              setInvoiceDiscount(res.data.discountAmount);
            }
          })
          .catch((err) => console.error('Invoice discount error:', err));
      } catch {}
    }
  }, []);

  // Tính voucher discount thực tế dựa trên selectedVouchers
  const actualVoucherDiscount = selectedVouchers.length > 0 ? urlVoucherDiscount : 0;

  // Debug log
  console.log('💰 CHECKOUT CALCULATION:', {
    baseAmount,
    urlVoucherDiscount,
    selectedVouchersCount: selectedVouchers.length,
    actualVoucherDiscount,
    invoiceDiscount
  });

  const amountAfterAll = Math.max(baseAmount - actualVoucherDiscount - invoiceDiscount, 0);

  // Debug calculation
  console.log('🧮 FINAL CALCULATION:');
  console.log('- Base amount:', baseAmount);
  console.log('- Voucher discount:', actualVoucherDiscount);
  console.log('- Invoice discount:', invoiceDiscount);
  console.log('- Final amount:', amountAfterAll);
  console.log('- Expected: 1,140,000 - 50,000 - 50,000 = 1,040,000');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // MULTIPLE PROTECTION LAYERS
    console.log('🔒 Submit attempt - Global lock:', isProcessingOrder, 'Local loading:', loading, 'Ref:', submitRef.current);

    // Layer 1: Global lock
    if (isProcessingOrder) {
      console.log('⚠️ GLOBAL LOCK: Order processing in progress, ignoring request');
      return;
    }

    // Layer 2: Component state
    if (loading) {
      console.log('⚠️ COMPONENT LOCK: Already processing, ignoring duplicate request');
      return;
    }

    // Layer 3: Ref check
    if (submitRef.current) {
      console.log('⚠️ REF LOCK: Submit already in progress, ignoring request');
      return;
    }

    // Layer 4: Debounce
    const now = Date.now();
    if (now - lastSubmitTime < 2000) {
      console.log('⚠️ DEBOUNCE: Too fast! Please wait before submitting again');
      alert('Vui lòng đợi trước khi gửi lại!');
      return;
    }

    // Set all locks
    isProcessingOrder = true;
    submitRef.current = true;
    setLastSubmitTime(now);

    if (!name || !address || !phone) {
      alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    setLoading(true);

    const token = localStorage.getItem('user');
    if (!token) {
      alert('Bạn chưa đăng nhập.');
      setLoading(false);
      return;
    }

    const decoded: any = jwtDecode(token);
    const userId = decoded._id || decoded.userId || decoded.id;

    const shippingInfo = { name, address, phone, paymentMethod };

    if (paymentMethod === 'vnpay') {
      // Lưu thêm thông tin voucher discount để sử dụng sau khi thanh toán
      const checkoutInfo = { ...shippingInfo, voucherDiscount: actualVoucherDiscount };
      localStorage.setItem('checkoutInfo', JSON.stringify(checkoutInfo));
      try {
        // Gửi voucher cùng với request tạo payment URL
        console.log('Gửi dữ liệu tạo payment:', {
          userId,
          shippingInfo,
          selectedVouchers,
          selectedCartItems,
          voucherDiscount: actualVoucherDiscount,
          orderInfo: `Thanh toán đơn hàng ${Date.now()}`
        });
        const res = await axios.post('http://localhost:3000/client/create-payment', {
          userId,
          shippingInfo,
          selectedVouchers,
          selectedCartItems,
          voucherDiscount: actualVoucherDiscount,
          invoiceDiscount: invoiceDiscount, // Thêm invoice discount
          orderInfo: `Thanh toán đơn hàng ${Date.now()}`
        });

        console.log('✅ VNPay response received:', res.data);

        if (res.data.success && res.data.paymentUrl) {
          console.log('🚀 Redirecting to VNPay:', res.data.paymentUrl);
          window.location.href = res.data.paymentUrl;
        } else {
          console.error('❌ Invalid VNPay response:', res.data);
          alert('Không thể tạo URL thanh toán VNPay');
        }
      } catch (err: any) {
        console.error('Lỗi tạo payment URL:', err);
        console.error('Chi tiết lỗi:', err.response?.data);
        alert(`Tạo URL thanh toán thất bại: ${err.response?.data?.message || err.message}`);
      } finally {
        // Release all locks (VNPay)
        console.log('🔓 Releasing all locks (VNPay)');
        setLoading(false);
        submitRef.current = false;
        isProcessingOrder = false;
      }
    } else {
      try {
        const requestId = `COD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('🚀 === STARTING COD ORDER CREATION ===');
        console.log('Request ID:', requestId);
        console.log('Timestamp:', new Date().toISOString());
        console.log('Gửi dữ liệu COD:', {
          userId,
          shippingInfo,
          selectedVouchers,
          selectedCartItems,
          voucherDiscount: actualVoucherDiscount
        });
        console.log('Chi tiết selectedVouchers:', selectedVouchers);
        console.log('Chi tiết selectedCartItems:', selectedCartItems);
        console.log('selectedCartItems type:', typeof selectedCartItems);
        console.log('selectedCartItems is array:', Array.isArray(selectedCartItems));
        console.log('selectedCartItems length:', selectedCartItems?.length);
        console.log('🔍 DETAILED selectedCartItems:', JSON.stringify(selectedCartItems, null, 2));

        // Check for duplicates
        const uniqueItems = Array.from(new Set(selectedCartItems));
        console.log('🔍 UNIQUE selectedCartItems:', uniqueItems);
        console.log('🔍 HAS DUPLICATES:', selectedCartItems.length !== uniqueItems.length);

        console.log('📡 Making API call to /client/ordersCod...');
        const res = await axios.post('http://localhost:3000/client/ordersCod', {
          userId,
          shippingInfo,
          selectedVouchers,
          selectedCartItems,
          voucherDiscount: actualVoucherDiscount,
          invoiceDiscount: invoiceDiscount, // Thêm invoice discount
          requestId, // Thêm requestId để track
        });
        if (res.status === 201) {
          console.log('Response từ server COD:', res.data);

          // Xóa thông tin checkout và voucher khỏi localStorage
          localStorage.removeItem("checkoutInfo");
          localStorage.removeItem("selectedVouchers");

          // Hiển thị modal thành công
          setShowSuccessModal(true);

          // Chuyển về trang chủ sau 3 giây
          setTimeout(() => {
            navigate('/client/customer');
          }, 3000);
        } else {
          console.log('COD failed response:', res.data);
          toast.error("❌ Tạo đơn hàng thất bại. Vui lòng thử lại.");
        }
      } catch (err: any) {
        console.error('Lỗi tạo đơn COD:', err);
        alert(err.response?.data?.message || 'Lỗi tạo đơn COD');
      } finally {
        // Release all locks (COD)
        console.log('🔓 Releasing all locks (COD)');
        setLoading(false);
        submitRef.current = false;
        isProcessingOrder = false;
      }
    }
  };

  return (
    <div className="checkout-wrapper">
      <div className="checkout-steps">
        <p><strong>1 Đăng Nhập</strong> → <strong>2 Giỏ Hàng</strong> → <strong>3 Xác Nhận</strong> → 4 Thanh toán</p>
      </div>

      <form onSubmit={handleSubmit} className="checkout-body">
        <div className="checkout-main">
          <div className="section">
            <h3>Thông tin người nhận</h3>

            <div className="form-group">
              <label>Họ tên:</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Địa chỉ:</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Số điện thoại:</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Phương thức thanh toán:</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}>
                <option value="vnpay">VNPAY</option>
                <option value="cod">Thanh toán khi nhận hàng</option>
              </select>
            </div>
          </div>
        </div>

        <div className="checkout-sidebar">
          <h3>Thông tin đơn hàng</h3>
          <p>Tổng tiền sản phẩm: <strong>{baseAmount.toLocaleString()} ₫</strong></p>

          {actualVoucherDiscount > 0 && (
            <p>Giảm giá voucher: <strong style={{ color: 'green' }}>-{actualVoucherDiscount.toLocaleString()} ₫</strong></p>
          )}
          {invoiceDiscount > 0 && (
            <p>Khuyến mãi hóa đơn: <strong style={{ color: 'green' }}>-{invoiceDiscount.toLocaleString()} ₫</strong></p>
          )}
          <p>Vận chuyển: <strong>Miễn Phí</strong></p>
          {selectedVouchers.length > 0 && (
            <p>Voucher đã chọn: <strong>{selectedVouchers.length} voucher</strong></p>
          )}

          <hr />
          <p style={{ color: 'red', fontWeight: 'bold' }}>
            Tổng thanh toán: {amountAfterAll.toLocaleString()} ₫
          </p>

          <div className="btn-row-right">
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/client/cart')}>
              Quay lại
            </button>
            <button type="submit" className="btn btn-danger" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'MUA NGAY'}
            </button>
          </div>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-icon">
              <div className="checkmark">
                <div className="checkmark-circle"></div>
                <div className="checkmark-stem"></div>
                <div className="checkmark-kick"></div>
              </div>
            </div>
            <h2 className="success-title">Đặt hàng thành công!</h2>
            <p className="success-message">
              🎉 Cảm ơn bạn đã mua hàng tại <strong>Rhodi</strong>
            </p>
            <p className="success-submessage">
              Đơn hàng của bạn đang được xử lý và sẽ được giao sớm nhất có thể.
            </p>
            <div className="success-details">
              <div className="detail-item">
                <span className="detail-icon">📦</span>
                <span>Phương thức: Thanh toán khi nhận hàng (COD)</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🚚</span>
                <span>Thời gian giao hàng: 1-3 ngày làm việc</span>
              </div>
            </div>
            <div className="success-actions">
              <button
                className="btn-continue-shopping"
                onClick={() => navigate('/client/customer')}
              >
                Tiếp tục mua sắm
              </button>
              <button
                className="btn-view-orders"
                onClick={() => navigate('/client/order-history')}
              >
                Xem đơn hàng
              </button>
            </div>
            <div className="auto-redirect">
              Tự động chuyển về trang chủ sau 3 giây...
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default CheckoutForm;
