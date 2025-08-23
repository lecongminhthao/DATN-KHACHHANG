import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Đăng ký/Register';
import CustomerHome from './pages/CustomerHome';
import { GoogleOAuthProvider } from '@react-oauth/google';
import CustomerLayout from './pages/CustomerLayout';
import Products from './pages/Products/Products';
import ProductDetail from './pages/Productdetail/Productdetail';
import Cart from './pages/Cart/Cart';
import CartImageTest from './pages/Cart/CartImageTest';
import CheckPayment from './pages/Payment/Checkpayment';
import UserVouchers from './pages/Vouchers/VoucherLisst';
import CheckoutForm from './pages/TTnhanhang/CheckoutForm';
import UserOrders from './pages/Order/Orderlist';
import OrderDetail from './pages/Order/OrderDetail';
import TestOrderDetail from './pages/TestOrderDetail';
import Footer from './pages/Footer';
import Navbar from './pages/Navbar';
import About from './pages/About/About'; // ✅ Thêm About

import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-confirm-alert/src/react-confirm-alert.css';
import 'react-toastify/dist/ReactToastify.css';
import SearchPage from './pages/TimKiem/SearchPage';
import UserInfoForm from './pages/TTKhachhang/UserInfoForm';

type PrivateRouteProps = {
  children: React.ReactNode;
};

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const token = localStorage.getItem('user');
  return token ? <>{children}</> : <Navigate to="/client/login" replace />;
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId="306694139406-envmrdj4vhgpks0rfbqq36apnfbfam75.apps.googleusercontent.com">
      <Router>
        <>
          <Routes>
            <Route path="/client/login" element={<Login />} />
            <Route path="/client/register" element={<Register />} />

            {/* 🔓 KHÔNG cần đăng nhập vẫn xem được */}
            <Route path="/client" element={<CustomerLayout />}>
              <Route path="/client/customer" element={<CustomerHome />} />
              <Route path="/client/products" element={<Products />} />
              <Route path="/client/productdetail/:productId" element={<ProductDetail />} />
              <Route path="/client/about" element={<About />} />
            </Route>

            {/* 🔓 VNPay return - KHÔNG cần đăng nhập */}
            <Route path="/payment-result" element={<CheckPayment />} />

            {/* 🔓 TẠMTHỜI cho phép test OrderDetail không cần đăng nhập */}
            <Route path="/client" element={<CustomerLayout />}>
              <Route path="/client/orderdetail/:orderId" element={<OrderDetail />} />
              <Route path="/client/test-order-images" element={<TestOrderDetail />} />
            </Route>

            {/* 🔐 CẦN đăng nhập mới truy cập được */}
            <Route
              path="/client"
              element={
                <PrivateRoute>
                  <CustomerLayout />
                </PrivateRoute>
              }
            >
              <Route path="/client/cart" element={<Cart />} />
              <Route path="/client/SearchPage" element={<SearchPage />} />
              <Route path="/client/check_payment" element={<CheckPayment />} />
              <Route path="/client/voucher" element={<UserVouchers />} />
              <Route path="/client/checkoutform/" element={<CheckoutForm />} />
              <Route path="/client/order-history" element={<UserOrders />} />
              <Route path="/client/contact" element={<UserInfoForm />} />

            </Route>
          </Routes>

          {/* Hiển thị Navbar và Footer ở mọi trang */}
          <Navbar />
          <Footer />
        </>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
