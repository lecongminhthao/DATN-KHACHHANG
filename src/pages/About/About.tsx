import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-banner">
        <h1>Giới thiệu về Rhodi Shop</h1>
        <p>Thời trang nam hiện đại – Phong cách của bạn, chất riêng của bạn.</p>
      </div>

      <div className="about-content">
        <h2>👑 Chủ shop: Lê Công Minh Thảo</h2>
        <p>
          Rhodi Shop là cửa hàng thời trang nam được sáng lập bởi Lê Công Minh Thảo với sứ mệnh mang đến cho nam giới
          những trang phục thời thượng, đơn giản nhưng vẫn tinh tế và đẳng cấp. 
        </p>
        <p>
          Chúng tôi tin rằng quần áo không chỉ là thứ bạn mặc lên người – mà còn là cách bạn thể hiện bản thân.
        </p>

        <h2>💼 Sản phẩm của chúng tôi</h2>
        <ul>
          <li>Áo thun, áo polo, sơ mi nam</li>
          <li>Quần jeans, quần tây, jogger</li>
          <li>Phụ kiện: túi, nón, kính, v.v.</li>
        </ul>

        <h2>💬 Cam kết từ Rhodi Shop</h2>
        <ul>
          <li>✔️ Sản phẩm chất lượng – Đảm bảo hình ảnh thật</li>
          <li>✔️ Giá cả hợp lý – Luôn có khuyến mãi đặc biệt</li>
          <li>✔️ Giao hàng toàn quốc – Đổi trả dễ dàng</li>
          <li>✔️ Hỗ trợ khách hàng 24/7 qua fanpage, Zalo và hotline</li>
        </ul>

        <h2>📍 Địa chỉ & Liên hệ</h2>
        <p>
          Cửa hàng hiện tại bán online trên nền tảng web Rhodi Shop và các kênh mạng xã hội.  
          Liên hệ trực tiếp: <strong>lecongminhthao@gmail.com</strong> | Zalo: 09xx xxx xxx
        </p>
      </div>
    </div>
  );
};

export default About;
