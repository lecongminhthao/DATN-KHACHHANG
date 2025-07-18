import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Productdetail.css';
import { jwtDecode } from 'jwt-decode';

interface ProductDetail {
  productId: string;
  productName: string;
  description: string;
  images: string[];
  productDescription: string;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

interface Variant {
  productDetailId: string;
  size: string;
  color: string;
  stockQuantity: number;
  salePrice: number;
  discountAmount: number;
  finalPrice: number;
  images: string[];
  productDescription: string;
}

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState<number>(0);
  const thumbnailsToShow = 4;

  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        const res = await fetch(`http://localhost:3000/client/productdetail/${productId}`);
        const data: Variant[] = await res.json();
        if (data.length > 0) {
          setVariants(data);
          const sizes = Array.from(new Set(data.map(v => v.size)));
          const colors = Array.from(new Set(data.map(v => v.color)));
          setAvailableSizes(sizes);
          setAvailableColors(colors);
          const base = data[0];
          setProduct({
            productId: base.productDetailId,
            productName: (base as any).product || (base as any).productName || '',
            description: (base as any).description || '',
            productDescription: base.productDescription,
            images: base.images || [],
            originalPrice: base.salePrice,
            discountAmount: base.discountAmount,
            finalPrice: base.finalPrice,
          });
          if (base.images?.length) setMainImage(base.images[0]);
        }
      } catch (err) {
        console.error(err);
        toast.error('❌ Lỗi khi tải sản phẩm');
      }
    })();
  }, [productId]);

  useEffect(() => {
    if (selectedSize) {
      const colors = variants.filter(v => v.size === selectedSize).map(v => v.color);
      setAvailableColors(Array.from(new Set(colors)));
    } else {
      setAvailableColors(Array.from(new Set(variants.map(v => v.color))));
    }
  }, [selectedSize, variants]);

  useEffect(() => {
    if (selectedColor) {
      const sizes = variants.filter(v => v.color === selectedColor).map(v => v.size);
      setAvailableSizes(Array.from(new Set(sizes)));
    } else {
      setAvailableSizes(Array.from(new Set(variants.map(v => v.size))));
    }
  }, [selectedColor, variants]);

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      toast.warning('Chọn đủ size và màu nhé!');
      return;
    }
    const variant = variants.find(v => v.size === selectedSize && v.color === selectedColor);
    if (!variant) {
      toast.error('Không tìm thấy biến thể!');
      return;
    }
    const token = localStorage.getItem('user');
    if (!token) return toast.error('Cần đăng nhập!');
    const decoded: any = jwtDecode(token);
    try {
      const res = await fetch('http://localhost:3000/client/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: decoded.userId,
          productDetailId: variant.productDetailId,
          quantity,
        }),
      });
      const data = await res.json();
      res.ok ? toast.success('✅ Thêm vào giỏ thành công!') : toast.error(`❌ ${data.message}`);
    } catch {
      toast.error('❌ Lỗi server');
    }
  };

  const handlePrev = () => setThumbnailStartIndex(i => Math.max(0, i - 1));
  const handleNext = () =>
    product && setThumbnailStartIndex(i => Math.min(product.images.length - thumbnailsToShow, i + 1));

  if (!product) return <p>Đang tải...</p>;

  const totalFinalPrice = product.finalPrice * quantity;
  const totalOriginalPrice = product.originalPrice * quantity;
  const totalDiscount = product.discountAmount * quantity;

  const selectedVariant = variants.find(v => v.size === selectedSize && v.color === selectedColor);
  const stockLeft = selectedVariant?.stockQuantity;

  return (
    <div className="product-detail-container">
      {/* Hình ảnh */}
      <div className="images-section">
        <img src={`/${mainImage}`} alt="" className="main-image" />
        <div className="thumbnail-list-wrapper">
          {product.images.length > thumbnailsToShow && (
            <button onClick={handlePrev} disabled={thumbnailStartIndex === 0}>&#8249;</button>
          )}
          <div className="thumbnail-list">
            {product.images
              .slice(thumbnailStartIndex, thumbnailStartIndex + thumbnailsToShow)
              .map((img, i) => (
                <img
                  key={i}
                  src={`/${img}`}
                  onClick={() => setMainImage(img)}
                  className="thumbnail"
                />
              ))}
          </div>
          {product.images.length > thumbnailsToShow && (
            <button onClick={handleNext} disabled={thumbnailStartIndex + thumbnailsToShow >= product.images.length}>
              &#8250;
            </button>
          )}
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="info-section">
        {/* Tên sản phẩm */}
        <h2>{product.productName}</h2>

        {/* Mô tả sản phẩm */}
        <div className="description-section">
          <h3>Mô tả sản phẩm</h3>
          <p>{product.productDescription || 'Chưa có mô tả cho sản phẩm này.'}</p>
        </div>

        {/* Biến thể size / màu */}
        <div className="variant-selection">
          <div className="size-options">
            <p>Chọn size:</p>
            {Array.from(new Set(variants.map(v => v.size))).map(size => {
              const ok = availableSizes.includes(size);
              return (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  disabled={!ok}
                  onClick={() => {
                    setSelectedSize(s => (s === size ? '' : size));
                    setSelectedColor('');
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>

          <div className="color-options">
            <p>Chọn màu:</p>
            {Array.from(new Set(variants.map(v => v.color))).map(color => {
              const ok = availableColors.includes(color);
              return (
                <button
                  key={color}
                  className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                  disabled={!ok}
                  onClick={() => setSelectedColor(c => (c === color ? '' : color))}
                >
                  {color}
                </button>
              );
            })}
          </div>

          {selectedVariant && (
            <p className="stock-left">Còn lại: {stockLeft} sản phẩm</p>
          )}
        </div>

        {/* Giá bán */}
        <div className="price-section">
          <div className="price-line">
            <span className="price-label">Giá gốc:</span>
            <span className="original-price">
              {totalOriginalPrice.toLocaleString('vi-VN').replaceAll(',', '.')} VND
            </span>
          </div>
          <div className="price-line">
            <span className="price-label">Giảm giá:</span>
            <span className="discount-amount">
              - {totalDiscount.toLocaleString('vi-VN').replaceAll(',', '.')} VND
            </span>
          </div>
          <div className="price-line">
            <span className="price-label">Giá bán:</span>
            <span className="final-price">
              {totalFinalPrice.toLocaleString('vi-VN').replaceAll(',', '.')} VND
            </span>
          </div>
        </div>

        {/* Số lượng + nút mua */}
        <div className="quantity-selector">
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
          <input
            value={quantity}
            type="number"
            min="1"
            onChange={e => setQuantity(Math.max(1, +e.target.value))}
          />
          <button onClick={() => setQuantity(q => q + 1)}>+</button>
        </div>

        <button className="buy-btn" onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ProductDetail;
