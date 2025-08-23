import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './UserVouchers.css';

interface Voucher {
  _id: string;
  code: string;
  discountAmount: number;
  endDate: string;
  minOrderAmount: number;
  status: string;
}

const UserVouchers: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      const token = localStorage.getItem('user');
      if (!token) {
        console.error('Không tìm thấy token trong localStorage.');
        setLoading(false);
        return;
      }

      let userId: string | null = null;
      try {
        const decoded: any = jwtDecode(token);
        userId = decoded.userId;
      } catch (error) {
        console.error('Lỗi khi giải mã JWT:', error);
        setLoading(false);
        return;
      }

      if (!userId) {
        console.error('Không tìm thấy userId trong token.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/client/vouchers/${userId}`);
        setVouchers(response.data.vouchers || []);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách voucher:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  if (loading) {
    return <p>Đang tải danh sách voucher...</p>;
  }

  return (
    <div className="voucher-container">
      <h2>Danh sách Voucher của bạn</h2>
      {vouchers.length === 0 ? (
        <p>Không có voucher nào.</p>
      ) : (
        <ul className="voucher-list">
          {vouchers.map((voucher) => (
            <li key={voucher._id} className="voucher-item">
              <div className="voucher-header">
                <strong>Mã:</strong> {voucher.code}
              </div>
              <div className="voucher-details">
                <span><strong>Giảm giá:</strong> {voucher.discountAmount.toLocaleString()} VND</span>
                <span><strong>Hạn sử dụng:</strong> {new Date(voucher.endDate).toLocaleDateString()}</span>
                <span><strong>Đơn hàng tối thiểu:</strong> {voucher.minOrderAmount.toLocaleString()} VND</span>
                <span><strong>Trạng thái:</strong> {voucher.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserVouchers;
