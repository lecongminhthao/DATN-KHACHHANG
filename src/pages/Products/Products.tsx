import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [hoveredImage, setHoveredImage] = useState<{ [key: string]: string | null }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(15);

  const [currentSlide, setCurrentSlide] = useState(1);

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const searchParam = query.get('search')?.toLowerCase() || '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`http://localhost:3000/client/products?page=${currentPage}&limit=${limit}`);
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [currentPage, limit]);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev >= 5 ? 1 : prev + 1));
    }, 3000);
    return () => clearInterval(slideInterval);
  }, []);

  const filteredProducts = products.filter((product) =>
    product.productName.toLowerCase().includes(searchParam)
  );

  const handleAddToCart = (productId: string) => {
    confirmAlert({
      title: 'Confirmation',
      message: 'Are you sure you want to add this product to the cart?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            toast.success('Product added to cart!');
          }
        },
        {
          label: 'No',
          onClick: () => {
            toast.error('Product not added to cart.');
          }
        }
      ]
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className='products'>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />

      {/* Banner slideshow */}
      <div className="banner-container">
        <img
          src={`/slide${currentSlide}.jpg`}
          alt={`Slide ${currentSlide}`}
          className="banner-image"
        />
      </div>

      {/* Danh sách sản phẩm */}
      <ul className="product-list">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <li className="product-item" key={product.productId}>
              <div className="product-image-container">
                <img
                  src={`/${hoveredImage[product.productId] || product.images[0]}`}
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
                  <i className="bi bi-cart-plus" title="Add to cart" onClick={() => handleAddToCart(product.productId)}></i>
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
          <p>No products to display.</p>
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
          Page {currentPage} / {totalPages}
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
  );
};

export default Products;
