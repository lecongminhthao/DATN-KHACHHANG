import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('user');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        setUserName(decodedToken.name || 'Người dùng');
        setIsEmailLogin(!!decodedToken.email);
      } catch (error) {
        console.error('Lỗi giải mã token:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/client/login');
  };

  // const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearchTerm(e.target.value.toLowerCase());
  //   // Nếu muốn xử lý tìm kiếm tức thì:
  //   // navigate(`/client/products?search=${e.target.value.toLowerCase()}`);
  // };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const term = e.target.value.toLowerCase();
  setSearchTerm(term);
  navigate(`/client/products?search=${encodeURIComponent(term)}`);
};

  return (
    <nav className="navbar">
      <h3 className="navbar-brand">
        <i className="bi bi-house-door-fill"></i> Rhodi
      </h3>

      <ul className="navbar-links">
        <li><Link to="/client/customer"><i className="bi bi-house"></i> Trang chủ</Link></li>
        <li><Link to="/client/products"><i className="bi bi-box-seam"></i> Sản phẩm</Link></li>
        <li><Link to="/client/about"><i className="bi bi-info-circle"></i> Giới thiệu</Link></li>
        <li><Link to="/client/contact"><i className="bi bi-envelope"></i> Liên hệ</Link></li>
      </ul>

      <div className="navbar-right">
        {/* Nút kính lúp và ô tìm kiếm */}
        {!searchVisible ? (
          <i
            className="bi bi-search search-icon-nav"
            title="Tìm kiếm"
            onClick={() => setSearchVisible(true)}
          ></i>
        ) : (
          <input
            type="text"
            className="search-input-nav"
            placeholder="Tìm sản phẩm..."
            value={searchTerm}
            onChange={handleSearchChange}
            onBlur={() => {
              if (searchTerm === '') setSearchVisible(false);
            }}
            autoFocus
          />
        )}

        {/* Avatar + Dropdown */}
        <div className="avatar-container">
          <i className="bi bi-person-circle avatar-icon"></i>

          <div className="avatar-menu">
            {userName && <div className="user-name">{userName}</div>}
            <Link to="/client/account"><i className="bi bi-person"></i> My Profile</Link>
            <Link to="/client/voucher"><i className="bi bi-gift"></i> My Voucher</Link>
            <Link to="/client/cart"><i className="bi bi-cart"></i> Giỏ hàng</Link>
            <Link to="/client/order-history"><i className="bi bi-clock-history"></i> Lịch sử</Link> 
            <button onClick={handleLogout}><i className="bi bi-box-arrow-right"></i> Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
