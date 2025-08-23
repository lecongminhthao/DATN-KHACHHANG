import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-box">
          <i className="bi bi-truck"></i>
          <p>GIAO HÀNG TOÀN QUỐC</p>
          <span>Áp dụng cho tất cả các đơn hàng</span>
        </div>
        <div className="footer-box">
          <i className="bi bi-arrow-repeat"></i>
          <p>CHÍNH SÁCH ĐỔI HÀNG</p>
          <span>Đổi sản phẩm trong vòng 2 ngày</span>
        </div>
        <div className="footer-box">
          <i className="bi bi-telephone-fill"></i>
          <p>MUA HÀNG (8H30 - 22H, T2 - CN)</p>
          <span>Hotline - CSKH: 0934.591.228</span>
        </div>
        <div className="footer-box">
          <i className="bi bi-shop"></i>
          <p>HỆ THỐNG SHOWROOM</p>
          <span>Hệ Thống Cửa Hàng</span>
        </div>
      </div>

      <div className="footer-middle">
        <div className="footer-about">
          <h4>VỀ CHÚNG TÔI</h4>
          <p>
            Rhodi Shop – một brand thời trang nam tại Hà Nội, được thành lập vào năm 2013. Sau hơn
            chục năm phát triển, Rhodi hiện đang hoạt động với 2 cơ sở chính tại Hà Nội và các nền
            tảng mạng xã hội...
          </p>
        </div>
        <div className="footer-contact">
          <h4>THÔNG TIN LIÊN HỆ</h4>
          <p>CSKH: 0934.591.228</p>
          <p>CS1: 365 Trần Khát Chân - Hà Nội</p>
          <p>CS2: 15 Ngõ 31 Hoàng Cầu - Hà Nội</p>
          <p>Email: rhodishop@gmail.com</p>
        </div>
        <div className="footer-subscribe">
          <h4>ĐĂNG KÍ NHẬN ƯU ĐÃI & XU HƯỚNG MỚI</h4>
          <input type="email" placeholder="Địa chỉ Email của bạn" />
          <button>GỬI</button>
        </div>
        <div className="footer-fanpage">
          <h4>FANPAGE</h4>
          <iframe
            src="https://www.facebook.com/plugins/page.php?href=https://www.facebook.com/rhodishop&tabs&width=300&height=160&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
            width="300"
            height="160"
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          ></iframe>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
