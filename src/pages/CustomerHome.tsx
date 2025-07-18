import React from 'react';
import Products from './Products/Products'; // Đường dẫn chuẩn theo cấu trúc của mày

const CustomerHome = () => {
  return (
    <div className="customer-home">
      {/* <h1>Chào mừng đến trang của khách hàng!</h1>
      <p>Bạn đã đăng nhập thành công.</p> */}

      {/* Hiển thị danh sách sản phẩm */}
      <Products />
    </div>
  );
};

export default CustomerHome;
