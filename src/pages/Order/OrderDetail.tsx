import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import './OrderDetail.css';

// ====== Status mapping ======
const statusMap: Record<string, { text: string; cls: string }> = {
  pending: { text: 'Chờ thanh toán', cls: 'status-pending' },
  paid: { text: ' chờ giao hàng', cls: 'status-paid' },
  processing: { text: 'Đang xử lý', cls: 'status-processing' },
  shipped: { text: 'Đang vận chuyển', cls: 'status-shipped' },
  in_transit: { text: 'Đang vận chuyển', cls: 'status-shipped' },
  delivered: { text: 'Hoàn thành', cls: 'status-delivered' },
  canceled: { text: 'Đã hủy', cls: 'status-canceled' },
  refunded: { text: 'Hoàn tiền', cls: 'status-refunded' },
};

const translateStatus = (status: string) => statusMap[status] || { text: status, cls: '' };

// ====== Interfaces ======
interface Category { _id: string; name: string }
interface Color { _id: string; name: string }
interface Size { _id: string; name: string }
interface ProductType { _id: string; name: string }
interface Image { _id: string; url: string; altText?: string }
interface Product { _id: string; name: string; images?: Image[] }
interface ProductDetail {
  _id: string;
  product: Product;
  category?: Category;
  color?: Color;
  size?: Size;
  producttype?: ProductType;
}
interface ProductItem {
  productDetailId: ProductDetail;
  productName: string;
  color: string;
  size: string;
  category: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  finalPrice: number;
}
interface ShippingAddress {
  recipientName: string;
  phone: string;
  address: string;
  note?: string;
}
interface PaymentMethod { method: string; amount: number }
interface OrderDetailData {
  _id: string;
  code: string;
  createdAt: string;
  status: string;
  paymentStatus?: string;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  products: ProductItem[];
  paymentMethod?: string;
  paymentMethods?: PaymentMethod[];
  discountByVoucher?: number;
  discountByOrder?: number;
}

// ====== Helpers ======
const defaultImage =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNMjAgMjBINEBWNDBIMjBWMjBaIiBmaWxsPSIjRDFENURCIi8+PC9zdmc+';

const getImageSrc = (
  images: any[] | undefined,
  productId?: string,
  productImages?: { [key: string]: string }
): string => {
  if (images && images.length > 0) {
    const firstImage = images[0];
    if (typeof firstImage === 'object' && firstImage?.url) {
      return firstImage.url.startsWith('http') ? firstImage.url : `http://localhost:3000/${firstImage.url}`;
    }
    if (typeof firstImage === 'string') {
      return firstImage.startsWith('http') ? firstImage : `http://localhost:3000/${firstImage}`;
    }
  }
  if (productId && productImages && productImages[productId]) {
    const imageUrl = productImages[productId];
    return imageUrl.startsWith('http') ? imageUrl : `http://localhost:3000/${imageUrl}`;
  }
  return defaultImage;
};

// ====== Component ======
const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [receivedStatus, setReceivedStatus] = useState<string | null>(null);
  const [voucherInfo, setVoucherInfo] = useState<{ voucherDiscount: number; orderDiscount: number } | null>(null);
  const [productImages, setProductImages] = useState<{ [key: string]: string }>({});

  // Reviews (không dùng ảnh theo yêu cầu)
  const [productReviews, setProductReviews] = useState<{ [key: string]: any }>({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [reviewData, setReviewData] = useState<{ rating: number; content: string }>({
    rating: 5,
    content: '',
  });

  // ====== Fetch order detail & map ảnh ======
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/client/orderdetail/${orderId}`);
        if (res.data.success) {
          const o = res.data.order;

          setOrder({
            ...o,
            discountByOrder: typeof o.discountByOrder === 'number' ? o.discountByOrder : 0,
            discountByVoucher: typeof o.discountByVoucher === 'number' ? o.discountByVoucher : 0,
          });

          // Map ảnh fallback theo tên
          const imageMap: { [key: string]: string } = {};
          o.products?.forEach((productItem: any) => {
            const product = productItem.productDetailId?.product;
            if (product?._id) {
              const name = (product.name || '').toLowerCase();
              if (name.includes('quần âu') || name.includes('quan au')) {
                imageMap[product._id] = 'quan1.jpeg';
              } else if (name.includes('giày') || name.includes('g-dragon') || name.includes('gìày')) {
                imageMap[product._id] = 'giaygdragon.jpg';
              } else if (name.includes('áo') || name.includes('ao')) {
                imageMap[product._id] = 'ao1.jpeg';
              } else if (name.includes('polo')) {
                imageMap[product._id] = 'polo.jpeg';
              } else if (name.includes('kính') || name.includes('kinh')) {
                imageMap[product._id] = 'kinh.jpeg';
              } else {
                imageMap[product._id] = 'quan1.jpeg';
              }
            }
          });
          setProductImages(imageMap);

          // Lấy voucher từ URL hoặc localStorage
          const voucherDiscountParam = searchParams.get('voucherDiscount');
          const orderDiscountParam = searchParams.get('orderDiscount');
          if (voucherDiscountParam) {
            setVoucherInfo({
              voucherDiscount: Number(voucherDiscountParam),
              orderDiscount: orderDiscountParam ? Number(orderDiscountParam) : 50000,
            });
          } else {
            const checkoutInfo = localStorage.getItem('checkoutInfo');
            const selectedVouchers = localStorage.getItem('selectedVouchers');
            if (checkoutInfo && selectedVouchers) {
              try {
                const checkout = JSON.parse(checkoutInfo);
                const vouchers = JSON.parse(selectedVouchers);
                if (checkout.voucherDiscount && vouchers.length > 0) {
                  setVoucherInfo({
                    voucherDiscount: checkout.voucherDiscount,
                    orderDiscount: 50000,
                  });
                }
              } catch (e) {
                console.log('Không thể parse localStorage:', e);
              }
            }
          }
        } else {
          setError('Không tải được chi tiết đơn hàng.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [orderId, searchParams]);

  // ====== Reviews ======
  const fetchProductReviews = async () => {
    if (!order) return;
    try {
      const token = localStorage.getItem('user');
      const decoded: any = token ? jwtDecode(token) : null;
      const userId = decoded?.userId || decoded?.id;

      const reviewPromises = order.products.map(async (product) => {
        const productId = product.productDetailId?.product?._id || product.productDetailId._id;
        const response = await axios.get(`http://localhost:3000/api/comments/product/${productId}`);
        if (response.data.success) {
          const userReview = response.data.data.find((c: any) => c.user._id === userId);
          return { productId: product.productDetailId._id, review: userReview || null };
        }
        return { productId: product.productDetailId._id, review: null };
      });

      const reviews = await Promise.all(reviewPromises);
      const map: { [key: string]: any } = {};
      reviews.forEach(({ productId, review }) => (map[productId] = review));
      setProductReviews(map);
    } catch (e) {
      console.error('Error fetching reviews:', e);
    }
  };

  const handleReviewProduct = (product: any) => {
    setSelectedProduct(product);
    setShowReviewModal(true);
    setReviewData({ rating: 5, content: '' });
  };

  const handleSubmitReview = async () => {
    try {
      const token = localStorage.getItem('user');
      if (!token) {
        toast.error('Vui lòng đăng nhập để đánh giá');
        return;
      }
      const decoded: any = jwtDecode(token);
      const userId = decoded.userId || decoded.id;

      if (!reviewData.content.trim()) {
        toast.error('Vui lòng nhập nội dung đánh giá');
        return;
      }

      const productId =
        selectedProduct.productDetailId?.product?._id ||
        selectedProduct.productDetailId?._id ||
        selectedProduct.productId;

      if (!productId) {
        toast.error('Không tìm thấy thông tin sản phẩm');
        return;
      }

      const body = {
        userId,
        productId,
        orderId: order?._id,
        content: reviewData.content.trim(),
        rating: Number(reviewData.rating),
      };

      let response;
      try {
        response = await axios.post('http://localhost:3000/api/comments', body, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
      } catch {
        response = await axios.post('http://localhost:3000/api/reviews', body, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
      }

      if (response.data.success || response.data.message === 'success') {
        toast.success('Đánh giá đã được gửi!');
        setShowReviewModal(false);
        setReviewData({ rating: 5, content: '' });
        fetchProductReviews();
      } else {
        toast.error(response.data.message || 'Không thể gửi đánh giá');
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message || error.response?.data?.error || 'Lỗi khi gửi đánh giá';
      toast.error(msg);
    }
  };

  // Render stars
  const renderStars = (
    rating: number,
    interactive = false,
    onStarClick?: (star: number) => void
  ) => (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={interactive && onStarClick ? () => onStarClick(star) : undefined}
          style={{
            color: star <= rating ? '#ffc107' : '#ddd',
            cursor: interactive ? 'pointer' : 'default',
            fontSize: '1.2rem',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );

  // Fetch reviews khi đã giao
  useEffect(() => {
    if (order && order.status === 'delivered') {
      fetchProductReviews();
    }
  }, [order]);

  if (loading) return <p>Đang tải chi tiết đơn hàng...</p>;
  if (error) return <p className="error">Lỗi: {error}</p>;
  if (!order) return <p>Không tìm thấy đơn hàng.</p>;

  const statusInfo = translateStatus(order.status);

  // ====== Tính toán tổng tiền/giảm giá ======
  const totalOriginalAmount = order.products.reduce((sum, p) => {
    const unitPrice = p.unitPrice || p.finalPrice || 0;
    const quantity = p.quantity || 0;
    return sum + unitPrice * quantity;
  }, 0);

  const totalProductDiscount = order.products.reduce((sum, p) => {
    const unitPrice = p.unitPrice || p.finalPrice || 0;
    const finalPrice = p.finalPrice || 0;
    const quantity = p.quantity || 0;
    const discountPerItem = unitPrice - finalPrice;
    return sum + discountPerItem * quantity;
  }, 0);

  const totalProductAmount = order.products.reduce((sum, p) => {
    const finalPrice = p.finalPrice || 0;
    const quantity = p.quantity || 0;
    return sum + finalPrice * quantity;
  }, 0);

  let actualDiscountByVoucher = 0;
  let actualDiscountByOrder = 0;

  const voucherDiscountFromDB =
    (order as any).voucherInfo?.voucherDiscount || (order as any).voucher?.discountAmount || 0;
  const invoiceDiscountFromDB =
    (order as any).invoicePromotionInfo?.invoiceDiscount ||
    (order as any).invoicePromotion?.discountValue ||
    0;

  const totalDiscountOnOrder = totalProductAmount - order.totalAmount;

  if (voucherDiscountFromDB > 0 || invoiceDiscountFromDB > 0) {
    actualDiscountByVoucher = voucherDiscountFromDB;
    actualDiscountByOrder = invoiceDiscountFromDB;
  } else if (voucherInfo && voucherInfo.voucherDiscount > 0) {
    actualDiscountByVoucher = voucherInfo.voucherDiscount;
    actualDiscountByOrder = voucherInfo.orderDiscount;
  } else if (totalDiscountOnOrder > 0) {
    actualDiscountByVoucher = 0;
    actualDiscountByOrder = totalDiscountOnOrder;
  } else {
    actualDiscountByVoucher = 0;
    actualDiscountByOrder = 0;
  }

  const paymentStatus = order.paymentStatus || 'unpaid';
  const isPaid = paymentStatus === 'paid';

  return (
    <div className="order-detail-container">
      <h2>
        Chi tiết đơn hàng <span style={{ color: '#ff6600' }}>#{order.code}</span>
      </h2>
      <p>
        <strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleString()}
      </p>
      <p>
        <strong>Trạng thái đơn hàng:</strong>{' '}
        <span className={statusInfo.cls}>{statusInfo.text}</span>
      </p>

      <p>
        <strong>Trạng thái thanh toán:</strong>{' '}
        <span className={`payment-status ${isPaid ? 'paid' : 'unpaid'}`}>
          {paymentStatus === 'paid'
            ? 'Đã thanh toán'
            : paymentStatus === 'unpaid'
            ? 'Chưa thanh toán'
            : paymentStatus === 'refunded'
            ? 'Đã hoàn tiền'
            : 'Không xác định'}
        </span>
      </p>

      <div className="order-detail-main">
        {/* LEFT */}
        <div className="order-left">
          <div className="order-info-boxes">
            <div className="order-box">
              <h4>KHÁCH HÀNG</h4>
              <p>
                <strong>{order.shippingAddress.recipientName}</strong>
              </p>
              <p>{order.shippingAddress.phone}</p>
            </div>
            <div className="order-box">
              <h4>NGƯỜI NHẬN</h4>
              <p>
                <strong>{order.shippingAddress.recipientName}</strong>
              </p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.address}</p>
              {order.shippingAddress.note && <p><em>Ghi chú: {order.shippingAddress.note}</em></p>}
            </div>
          </div>

          <div className="product-table-wrapper">
            <h3>Danh sách sản phẩm</h3>
            <table className="product-table">
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Sản phẩm</th>
                  <th>Thể loại</th>
                  <th>Danh mục</th>
                  <th>Màu</th>
                  <th>Kích cỡ</th>
                  <th>Số Lượng</th>
                  <th>Đơn hàng</th>
                  {order.status === 'delivered' && <th>Đánh giá</th>}
                </tr>
              </thead>
              <tbody>
                {order.products.map((p, index) => {
                  const detail = p.productDetailId;
                  const product = detail?.product;

                  return (
                    <tr key={index}>
                      <td>
                        <img
                          src={getImageSrc(product?.images, product?._id, productImages)}
                          alt={product?.name || ''}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.src.includes('data:image/svg+xml')) {
                              target.src = defaultImage;
                            }
                          }}
                        />
                      </td>
                      <td>{product?.name || 'Không rõ'}</td>
                      <td>{detail?.producttype?.name || '-'}</td>
                      <td>{detail?.category?.name || '-'}</td>
                      <td>{detail?.color?.name || '-'}</td>
                      <td>{detail?.size?.name || '-'}</td>
                      <td>{p.quantity}</td>
                      <td>{p.finalPrice.toLocaleString()}₫</td>

                      {order.status === 'delivered' && (
                        <td>
                          {productReviews && productReviews[detail._id] ? (
                            <div className="review-display">
                              <div className="review-stars">
                                {renderStars(productReviews[detail._id]?.rating || 0)}
                              </div>
                              <div className="review-content">
                                {productReviews[detail._id]?.content || ''}
                              </div>
                              <small className="review-date">
                                {productReviews[detail._id]?.createdAt
                                  ? new Date(productReviews[detail._id].createdAt).toLocaleDateString('vi-VN')
                                  : ''}
                              </small>
                            </div>
                          ) : (
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => handleReviewProduct(p)}
                            >
                              ⭐ Đánh giá
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT - Thông tin đơn hàng */}
        <div className="order-right">
          <div className="summary-box">
            <h4>PHƯƠNG THỨC THANH TOÁN</h4>
            <p>
              {order.paymentMethod === 'COD'
                ? 'Thanh toán khi nhận hàng (COD)'
                : order.paymentMethod === 'Online'
                ? 'Thanh toán trực tuyến (VN PAY)'
                : order.paymentMethod || 'Chưa có thông tin'}
            </p>

            {Array.isArray(order.paymentMethods) && order.paymentMethods.length > 0 && (
              <div className="payment-breakdown">
                {order.paymentMethods.map((pm, index) => (
                  <div className="row" key={index}>
                    <span>{pm.method}</span>
                    <span>{pm.amount.toLocaleString()}₫</span>
                  </div>
                ))}
              </div>
            )}

            <div className="row">
              <span>Tiền sản phẩm (gốc):</span>
              <span>{totalOriginalAmount.toLocaleString()}₫</span>
            </div>
            {totalProductDiscount > 0 && (
              <div className="row">
                <span>Giảm giá sản phẩm:</span>
                <span>-{totalProductDiscount.toLocaleString()}₫</span>
              </div>
            )}
            <div className="row">
              <span>Tạm tính:</span>
              <span>{totalProductAmount.toLocaleString()}₫</span>
            </div>
            {actualDiscountByVoucher > 0 && (
              <div className="row">
                <span>Voucher:</span>
                <span>-{actualDiscountByVoucher.toLocaleString()}₫</span>
              </div>
            )}
            {actualDiscountByOrder > 0 && (
              <div className="row">
                <span>Khuyến mãi hóa đơn:</span>
                <span>-{actualDiscountByOrder.toLocaleString()}₫</span>
              </div>
            )}
            <div className="row">
              <span>Phí vận chuyển:</span>
              <span>Miễn phí</span>
            </div>

            <div className="total">
              <span>Cần thanh toán:</span>
              <span>{order.totalAmount.toLocaleString()}₫</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal đánh giá (không upload ảnh) */}
      {showReviewModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Đánh giá sản phẩm</h3>
              <button className="close-btn" onClick={() => setShowReviewModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="product-info">
                <img
                  src={getImageSrc(
                    selectedProduct.productDetailId?.product?.images,
                    selectedProduct.productDetailId?.product?._id,
                    productImages
                  )}
                  alt={selectedProduct.productName}
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                />
                <div>
                  <h4>{selectedProduct.productName}</h4>
                  <p>
                    {selectedProduct.color} - {selectedProduct.size}
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label>Đánh giá của bạn:</label>
                {renderStars(reviewData.rating, true, (star) =>
                  setReviewData((prev) => ({ ...prev, rating: star }))
                )}
                <span className="rating-text">
                  {reviewData.rating === 1 && 'Rất tệ'}
                  {reviewData.rating === 2 && 'Tệ'}
                  {reviewData.rating === 3 && 'Bình thường'}
                  {reviewData.rating === 4 && 'Tốt'}
                  {reviewData.rating === 5 && 'Rất tốt'}
                </span>
              </div>

              <div className="form-group">
                <label>Nội dung đánh giá:</label>
                <textarea
                  value={reviewData.content}
                  onChange={(e) => setReviewData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  rows={4}
                  maxLength={500}
                />
                <small>{reviewData.content.length}/500 ký tự</small>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleSubmitReview}>
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
