import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import './UserOrders.css';

const statusMap: Record<string, { text: string; cls: string }> = {
  pending: { text: 'Chờ thanh toán', cls: 'status-pending' },
  paid: { text: 'Đã thanh toán – chờ giao hàng', cls: 'status-paid' },
  waiting_delivery: { text: 'Chờ giao hàng', cls: 'status-waiting-delivery' },
  processing: { text: 'Đang xử lý', cls: 'status-processing' },
  shipped: { text: 'Đang vận chuyển', cls: 'status-shipped' },
  in_transit: { text: 'Đang vận chuyển', cls: 'status-shipped' },
  delivered: { text: 'Đã giao', cls: 'status-delivered' },
  canceled: { text: 'Đã hủy', cls: 'status-canceled' },
  refunded: { text: 'Hoàn tiền', cls: 'status-refunded' },
  unfulfilled: { text: 'Chưa giao hàng', cls: 'status-unfulfilled' },
  awaiting_shipment: { text: 'Đang chờ gửi hàng', cls: 'status-awaiting' },
  returned: { text: 'Đã trả hàng', cls: 'status-returned' },
  failed: { text: 'Thất bại', cls: 'status-failed' },
  on_hold: { text: 'Tạm giữ', cls: 'status-hold' },
  completed: { text: 'Hoàn tất', cls: 'status-completed' },
};

const translateStatus = (status: string) =>
  statusMap[status] || { text: status, cls: '' };

const getOrderStatus = (status: string) => {
  if (['pending', 'paid'].includes(status)) return 'Chưa giao hàng';
  if (['shipped', 'delivered', 'completed'].includes(status)) return 'Đã giao hàng';
  if (status === 'canceled') return 'Đã hủy';
  return 'Đang xử lý';
};

const getPaymentStatus = (paymentStatus?: string) => {
  if (paymentStatus === 'paid') return 'Đã thanh toán';
  if (paymentStatus === 'unpaid') return 'Chưa thanh toán';
  if (paymentStatus === 'refunded') return 'Đã hoàn tiền';
  return 'Chưa thanh toán'; // Default fallback
};

interface Order {
  _id: string;
  code: string;
  createdAt: string;
  status: string;
  paymentStatus?: string;
  totalAmount: number;
}

const UserOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;



  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('user');
      if (!token) {
        setError('Chưa đăng nhập');
        setLoading(false);
        return;
      }

      let userId: string | null = null;
      try {
        const decoded: any = jwtDecode(token);
        userId = decoded.userId || decoded.id;
      } catch {
        setError('Token không hợp lệ');
        setLoading(false);
        return;
      }

      if (!userId) {
        setError('Không tìm thấy userId trong token.');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:3000/client/getorders/${userId}`,
          {
            params: { page, limit },
          }
        );
        if (res.data.success) {
          setOrders(res.data.data);
        } else {
          setError('Không thể tải đơn hàng');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page]);



  if (loading) return <p>Đang tải đơn hàng...</p>;
  if (error) return <p className="error">Lỗi: {error}</p>;

  return (
    <div className="checkout-wrapper">
      <div className="checkout-steps">
        <p><strong>Lịch sử đơn hàng</strong></p>
      </div>

      <div className="checkout-body">
        <div className="checkout-main full-width">
          <div className="section">
            <h3>Lịch sử đơn hàng của bạn</h3>

            {orders.length === 0 ? (
              <p>Chưa có đơn hàng nào.</p>
            ) : (
              <div className="order-table-wrapper">
                <table className="order-table">
                  <thead>
                    <tr>
                      <th>Mã đơn hàng</th>
                      <th>Ngày đặt</th>
                      <th>Trạng thái đơn hàng</th>
                      <th>Trạng thái thanh toán</th>
                      <th>Tổng tiền</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => {
                      const statusInfo = translateStatus(o.status);
                      return (
                        <tr key={o._id}>
                          <td>{o.code}</td>
                          <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-label ${statusInfo.cls}`}>
                              {getOrderStatus(o.status)}
                            </span>
                          </td>
                          <td>
                            <span className="status-label">
                              {getPaymentStatus(o.paymentStatus)}
                            </span>
                          </td>
                          <td>{o.totalAmount.toLocaleString()}₫</td>
                          <td>
                            <a
                              className="btn btn-sm btn-outline-primary"
                              href={`/client/orderdetail/${o._id}`}
                            >
                              Xem chi tiết
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                ‹ Trước
              </button>
              <span>Trang {page}</span>
              <button
                disabled={orders.length < limit}
                onClick={() => setPage(p => p + 1)}
              >
                Sau ›
              </button>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default UserOrders;
