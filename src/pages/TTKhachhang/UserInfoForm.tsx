// Contact.tsx
import React from "react";
import "./contact.css";

const Contact: React.FC = () => {
  return (
    <div className="contact-container">
      <h2>Liên hệ với chúng tôi</h2>

      <div className="contact-info">
        <p><strong>Giám đốc:</strong> Lê Công Minh Thảo</p>
        <p><strong>Địa chỉ:</strong> 123 Đường ABC, Quận 1, TP. Hồ Chí Minh</p>
        <p><strong>Điện thoại:</strong> 0123 456 789</p>
        <p><strong>Email:</strong> contact@rhodi.vn</p>
        <p>
          <strong>Hoàn hàng hay cần hỗ trợ hãy liên hệ qua:</strong>{" "}
          <a href="https://www.facebook.com/danonghoangda/" target="_blank" rel="noreferrer">
            Giám Đốc Lê Công Minh Thảo
          </a>
        </p>
      </div>

      <div className="map-container">
        <h3>Bản đồ</h3>
        <iframe
          title="Google Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.502494772321!2d106.70042381533434!3d10.77688999232233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529292b1c4dcd%3A0xdee10e6014b37d2e!2zMTIzIMSQxrDhu51uZyBBQkMsIFF14buRYyAxLCBUUC4gSMOgIENow60gTWluaCBOZ8Oibg!5e0!3m2!1svi!2s!4v1692954765093!5m2!1svi!2s"
          width="100%"
          height="400"
          style={{ border: "0" }}
          allowFullScreen={true}
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default Contact;
