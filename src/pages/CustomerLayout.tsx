// src/pages/CustomerLayout.tsx
import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const CustomerLayout: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div style={{ height: '40px' }}></div>
      <div  > {/* Thêm padding để tránh Navbar che khuất */}
        <Outlet />
      </div>
    </div>
  );
};

export default CustomerLayout;
