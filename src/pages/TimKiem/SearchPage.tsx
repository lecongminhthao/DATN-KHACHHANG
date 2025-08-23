import React, { useEffect, useState } from 'react';
import './SearchPage.css';
import axios from 'axios';

const SearchPage = () => {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });

  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:3000/api/products', {
      params: {
        keyword,
        category,
        sortBy,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
      },
    });
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, [keyword, category, sortBy, priceRange]);

  return (
    <div className="search-page">
      <div className="sidebar">
        <h3>Lọc sản phẩm</h3>

        <div className="filter-group">
          <label>Danh mục</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="shirt">Áo sơ mi</option>
            <option value="tshirt">Áo thun</option>
            <option value="jeans">Quần jeans</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Khoảng giá</label>
          <input
            type="number"
            placeholder="Từ"
            onChange={(e) => setPriceRange({ ...priceRange, min: +e.target.value })}
          />
          <input
            type="number"
            placeholder="Đến"
            onChange={(e) => setPriceRange({ ...priceRange, max: +e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>Sắp xếp theo</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="">Mặc định</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="newest">Mới nhất</option>
            <option value="bestseller">Bán chạy</option>
          </select>
        </div>
      </div>

      <div className="product-list">
        {products.length === 0 ? (
          <p>Không tìm thấy sản phẩm</p>
        ) : (
          <div className="grid">
            {products.map((product: any) => (
              <div key={product._id} className="product-card">
                <img src={product.image} alt={product.name} />
                <h4>{product.name}</h4>
                <p className="price">{product.price.toLocaleString()} ₫</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
