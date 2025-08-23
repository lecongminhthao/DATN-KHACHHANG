import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Products.css';
import { confirmAlert } from 'react-confirm-alert';
import { toast, ToastContainer } from 'react-toastify';

interface Product {
  productId: string;
  productName: string;
  images: string[];
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  category: string;
}

interface Category {
  _id: string;
  name: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoveredImage, setHoveredImage] = useState<{ [key: string]: string | null }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12);

  // bộ lọc
  const [category, setCategory] = useState<string>('');  
  const [promotion, setPromotion] = useState<string>('');  
  const [priceRange, setPriceRange] = useState<[string | null, string | null]>([null, null]); 

  // 🔎 từ khóa search frontend
  const [searchTerm, setSearchTerm] = useState('');

  // fetch categories khi mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryResponse = await fetch('http://localhost:3000/client/categories');
        const categoryData = await categoryResponse.json();
        setCategories(categoryData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // fetch products khi thay đổi filter
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
          category,
          promotion,
        });

        if (priceRange[0]) queryParams.append("minPrice", priceRange[0]);
        if (priceRange[1]) queryParams.append("maxPrice", priceRange[1]);

        const response = await fetch(`http://localhost:3000/client/products?${queryParams}`);
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [currentPage, category, promotion, priceRange]);

  // danh sách sau khi lọc theo tên
  const filteredProducts = products.filter(p =>
    p.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // thay đổi giá trị input giá
  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = event.target.value === '' ? null : event.target.value;
    if (type === 'min') {
      setPriceRange([value, priceRange[1]]);
    } else {
      setPriceRange([priceRange[0], value]);
    }
  };

  // thêm vào giỏ hàng
  const handleAddToCart = (productId: string) => {
    confirmAlert({
      title: 'Xác nhận',
      message: 'Bạn có chắc muốn thêm sản phẩm này vào giỏ hàng?',
      buttons: [
        {
          label: 'Có',
          onClick: () => {
            toast.success('Đã thêm sản phẩm vào giỏ hàng!');
          }
        },
        {
          label: 'Không',
          onClick: () => {
            toast.error('Sản phẩm chưa được thêm.');
          }
        }
      ]
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="products-page">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />

      {/* Sidebar bộ lọc */}
      <aside className="filter-sidebar">

        {/* Thanh tìm kiếm */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Khuyến mãi */}
        <div className="filter-section">
          <h4>Khuyến mãi</h4>
          <label>
            <input
              type="radio"
              name="promotion"
              value="all"
              checked={promotion === 'all'}
              onChange={(e) => setPromotion(e.target.value)}
            />
            Tất cả
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="promotion"
              value="true"
              checked={promotion === 'true'}
              onChange={(e) => setPromotion(e.target.value)}
            />
            Đang giảm giá
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="promotion"
              value="false"
              checked={promotion === 'false'}
              onChange={(e) => setPromotion(e.target.value)}
            />
            Không giảm giá
          </label>
        </div>

        {/* Khoảng giá */}
        <div className="filter-section">
          <h4>Khoảng giá</h4>
          <div className="price-inputs">
            <input
              type="number"
              placeholder="Từ"
              value={priceRange[0] ?? ''}
              onChange={(e) => handlePriceChange(e, 'min')}
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Đến"
              value={priceRange[1] ?? ''}
              onChange={(e) => handlePriceChange(e, 'max')}
            />
          </div>
          <button onClick={() => setCurrentPage(1)}>Áp dụng</button>
        </div>
      </aside>

      {/* Danh sách sản phẩm */}
      <div className="products-content">
        <ul className="product-list">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <li className="product-item" key={product.productId}>
                <div className="product-image-container">
                  <img
                    src={`http://localhost:3000${hoveredImage[product.productId] || product.images[0]}`}
                    alt={product.productName}
                    className="product-image"
                    onMouseEnter={() => {
                      if (product.images[1]) {
                        setHoveredImage(prev => ({
                          ...prev,
                          [product.productId]: product.images[1]
                        }));
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredImage(prev => ({
                        ...prev,
                        [product.productId]: null
                      }));
                    }}
                  />
                  {product.discountAmount > 0 && (
                    <div className="discount-tag">
                      -{product.discountAmount.toLocaleString('vi-VN').replaceAll(',', '.')} VND
                    </div>
                  )}
                </div>
                <div className="product-details">
                  <h3 className="product-name">{product.productName}</h3>
                  <p className="product-price">
                    {product.finalPrice.toLocaleString('vi-VN').replaceAll(',', '.')} VND
                  </p>
                  <div className="product-actions">
                    <i
                      className="bi bi-cart-plus"
                      title="Add to cart"
                      onClick={() => handleAddToCart(product.productId)}
                    ></i>
                    <Link to={`/client/productdetail/${product.productId}`}>
                      <i className="bi bi-eye" title="View details"></i>
                    </Link>
                    <Link to="/wishlist">
                      <i className="bi bi-heart" title="Add to wishlist"></i>
                    </Link>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <p>Không có sản phẩm nào.</p>
          )}
        </ul>

        {/* Phân trang */}
        <div className="pagination">
          <button
            className="page-button"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(1)}
          >
            <i className="bi bi-chevron-double-left"></i>
          </button>

          <button
            className="page-button"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          <span className="page-info">
            Trang {currentPage} / {totalPages}
          </span>

          <button
            className="page-button"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <i className="bi bi-chevron-right"></i>
          </button>

          <button
            className="page-button"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            <i className="bi bi-chevron-double-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Products;
