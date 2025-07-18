import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Đăng ký/Register';
import Products from './pages/Products/Products';
import CustomerLayout from './pages/CustomerLayout';
import Navbar from './pages/Navbar';
import Footer from './pages/Footer';
import { GoogleOAuthProvider } from '@react-oauth/google';

import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-confirm-alert/src/react-confirm-alert.css';
import 'react-toastify/dist/ReactToastify.css';
import CustomerHome from './pages/CustomerHome';
import ProductDetail from './pages/productdetail/Productdetail';
import Cart from './pages/Cart/Cart';

const App = () => {
  return (
    <GoogleOAuthProvider clientId="306694139406-envmrdj4vhgpks0rfbqq36apnfbfam75.apps.googleusercontent.com">
      <Router>
        <>
          <Navbar />
          <Routes>
            <Route path="/client/login" element={<Login />} />
            <Route path="/client/register" element={<Register />} />
             <Route path="/client" element={<CustomerLayout />}>
              <Route path="/client/customer" element={<CustomerHome />} />
              <Route path="/client/products" element={<Products />} />
              <Route path="/client/productdetail/:productId" element={<ProductDetail />} />
               <Route path="/client/cart" element={<Cart />} />

            </Route>
          </Routes>
          <Footer />
        </>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
