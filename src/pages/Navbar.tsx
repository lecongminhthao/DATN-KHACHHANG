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

  // Đường dẫn ảnh mặc định (public/images/default-avatar.png)
  const defaultAvatar = '/avatar.png';
  // Đường dẫn avatar khi đã login (public/images/avatar.jpg)
  const loggedInAvatar = '/login.jpg';

  const [avatar, setAvatar] = useState<string>(defaultAvatar);

  useEffect(() => {
    const token = localStorage.getItem('user');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        setUserName(decodedToken.name || 'Người dùng');
        setIsEmailLogin(!!decodedToken.email);
        setAvatar(loggedInAvatar); // Khi login → lấy ảnh từ public
      } catch (error) {
        console.error('Lỗi giải mã token:', error);
      }
    } else {
      setAvatar(defaultAvatar); // Chưa login → ảnh mặc định
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUserName(null);
    setAvatar(defaultAvatar); // reset lại về avatar mặc định
    navigate('/client/login');
  };

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
        <Link to="/client/cart" className="cart-icon-link" title="Giỏ hàng">
          <i className="bi bi-cart cart-icon-nav"></i>
        </Link>

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

        <div className="avatar-container">
          <img src={avatar} alt="avatar" className="avatar-icon" />
          {userName && (
            <div className="avatar-menu">
              <div className="user-name">{userName}</div>
              <Link to="/client/account"><i className="bi bi-person"></i> My Profile</Link>
              <Link to="/client/voucher"><i className="bi bi-gift"></i> My Voucher</Link>
              <Link to="/client/order-history"><i className="bi bi-clock-history"></i> Lịch sử</Link>
              <button onClick={handleLogout}><i className="bi bi-box-arrow-right"></i> Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
