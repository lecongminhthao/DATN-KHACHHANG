import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ok.css";

interface Product {
  productId: string;
  productName: string;
  images: string[];
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

const CustomerHome: React.FC = () => {
  const [discountProducts, setDiscountProducts] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = ["/slide1.jpg", "/slide2.jpg", "/slide3.jpg", "/slide4.jpg","/slide5.jpg"]; // ảnh trong public

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  // Fetch sản phẩm đang giảm giá
  useEffect(() => {
    const fetchDiscountProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/client/products?promotion=true&limit=8"
        );
        const data = await response.json();
        setDiscountProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching discount products:", error);
      }
    };
    fetchDiscountProducts();
  }, []);

  return (
    <div className="customer-home">
      {/* 🔹 Slideshow ngang */}
      <div className="slideshow-container">
        {slides.map((src, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? "active" : ""}`}
          >
            <img src={src} alt={`slide-${index}`} />
          </div>
        ))}

        {/* Nút điều hướng */}
        <button className="prev" onClick={prevSlide}>
          ❮
        </button>
        <button className="next" onClick={nextSlide}>
          ❯
        </button>

        {/* Dots */}
        <div className="dots">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            ></span>
          ))}
        </div>
      </div>

      {/* Section 1: Danh sách sản phẩm đang giảm giá */}
      <section>
        <h2>Sản Phẩm Đang Giảm Giá</h2>
        <div className="product-grid">
          {discountProducts.length > 0 ? (
            discountProducts.map((product) => (
              <div key={product.productId} className="product-card">
                <div className="relative">
                  <img
                    src={`http://localhost:3000${product.images[0]}`}
                    alt={product.productName}
                  />
                  {product.discountAmount > 0 && (
                    <span className="discount-badge">
                      -{product.discountAmount.toLocaleString("vi-VN")} VND
                    </span>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.productName}</h3>
                  <p>{product.finalPrice.toLocaleString("vi-VN")} VND</p>
                  <div className="icons">
                    <Link to={`/client/productdetail/${product.productId}`}>
                      <i className="bi bi-eye" title="Xem chi tiết"></i>
                    </Link>
                    <Link to="/wishlist">
                      <i className="bi bi-heart" title="Yêu thích"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Không có sản phẩm giảm giá.</p>
          )}
        </div>
        {/* 🔹 Banner khuyến mãi dịp 2/9 */}
          {/* 🔹 Banner khuyến mãi dịp 2/9 */}
<div className="promo-banner">
  <div className="promo-text">
    🎉 Chương trình khuyến mãi theo hóa đơn  
    <br />Điều kiện áp dụng: Đơn hàng có giá trị từ 1.000.000₫ trở lên.

    <br />Mức giảm: Giảm 8% tổng giá trị đơn hàng.

    <br />Giới hạn tối thiểu: Nếu số tiền giảm 100.000 VNĐ 
    <br />Nhân dịp Quốc Khánh 2/9 
  </div>
</div>

      </section>

      {/* Section 2: Follow Instagram */}
      <section className="instagram-section">
        <h2>Follow Instagram @lecongminhthao</h2>
        <div className="instagram-grid">
          {["/ig1.jpg", "/ig2.jpg", "/ig3.jpg", "/ig4.jpg", "/ig5.jpg"].map(
            (img, index) => (
              <div key={index} className="instagram-card">
                <img src={img} alt={`instagram-${index}`} />
              </div>
            )
          )}
        </div>
      </section>

      {/* Section 3: Tin Thời Trang */}
      <section className="blog-section">
        <h2>Tin Thời Trang</h2>
        <div className="blog-grid">
          {[
            {
              title:
                "Gợi ý outfit thời trang mùa hè nam 2025 đẹp, dẫn đầu xu hướng",
              img: "/thoitrangnam1.jpg",
              desc: "Mùa hè 2025 đang đến gần, mang theo làn gió mới trong thế giới thời trang mùa hè nam giới. Đây là thời điểm lý tưởng ...",
              date: "26/05/2025",
            },
            {
              title:
                "Màu nào hấp thụ nhiệt nhiều nhất? Cơ chế hấp thụ nhiệt của màu sắc",
              img: "/thoitrangnam2.jpg",
              desc: "Bạn đã bao giờ thắc mắc vì sao vào mùa hè, mặc áo đen lại khiến bạn cảm thấy nóng hơn so với áo trắng? Tất cả đều liê...",
              date: "28/04/2025",
            },
            {
              title:
                "Phong cách layer - Nghệ thuật phối đồ nhiều lớp dẫn đầu xu hướng",
              img: "/thoitrangnam3.jpg",
              desc: "Nếu bạn nghĩ việc mặc nhiều lớp quần áo chỉ dành cho mùa đông thì có lẽ bạn chưa khám phá hết sức hút của phong cách ...",
              date: "18/04/2025",
            },
          ].map((item, index) => (
            <div key={index} className="blog-card">
              <img src={item.img} alt={item.title} />
              <div className="blog-content">
                <h3>{item.title}</h3>
                <p className="date">{item.date}</p>
                <p className="desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CustomerHome;
