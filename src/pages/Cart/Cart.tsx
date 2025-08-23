import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Cart.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

interface CartItem {
  _id: string;
  productDetail: {
    _id: string;
    product: { _id: string; name: string; salePrice: number; imageUrl?: string };
    color: { name: string };
    size: { name: string };
    quantity: number; // Thêm số lượng tồn kho
  };
  quantity: number;
  unitPrice: number;
  finalPrice: number;
  productImage: string;
}

interface StockCheckItem {
  productDetailId: string;
  quantity: number;
}

interface StockCheckResult {
  productDetailId: string;
  ok: boolean;
  available: number;
  productName?: string;
  colorName?: string;
  sizeName?: string;
}

interface Voucher {
  _id: string;
  code: string;
  discountAmount: number;
  endDate: string;
  minOrderAmount: number;
  status: string;
}

interface DecodedToken {
  userId: string;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucherIds, setSelectedVoucherIds] = useState<string[]>([]);
  const [discountTotal, setDiscountTotal] = useState<number>(0);
  const [selectedCartItemIds, setSelectedCartItemIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('user');
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setUserId(decoded.userId);
      } catch (error) {
        console.error('Invalid token');
      }
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    axios.get(`http://localhost:3000/client/cart?userId=${userId}&page=1&limit=1000`)
      .then(res => {
        setCartItems(res.data.data.items);
        setTotalPrice(res.data.data.cartTotal);
        setSelectedCartItemIds([]);
        setSelectAll(false);
      })
      .catch(err => console.error('Error fetching cart:', err));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    axios.get(`http://localhost:3000/client/vouchers/${userId}`)
      .then(res => setVouchers(res.data.vouchers || []))
      .catch(err => console.error('Error fetching vouchers:', err));
  }, [userId]);

  useEffect(() => {
    const today = new Date();
    const total = vouchers
      .filter(v =>
        selectedVoucherIds.includes(v._id) &&
        totalPrice >= v.minOrderAmount &&
        v.status === 'active' &&
        new Date(v.endDate) >= today
      )
      .reduce((sum, v) => sum + v.discountAmount, 0);
    setDiscountTotal(total);
  }, [totalPrice, selectedVoucherIds, vouchers]);

  useEffect(() => {
    setSelectAll(selectedCartItemIds.length === cartItems.length && cartItems.length > 0);
  }, [selectedCartItemIds, cartItems]);

  const handleVoucherToggle = (id: string) => {
    setSelectedVoucherIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const checkStock = async (items: StockCheckItem[]): Promise<StockCheckResult[]> => {
    try {
      const response = await axios.post('http://localhost:3000/client/cart/check-stock', { items });
      return response.data.results as StockCheckResult[];
    } catch (error) {
      console.error('Lỗi khi kiểm tra tồn kho:', error);
      toast.error('Đã xảy ra lỗi khi kiểm tra tồn kho.');
      return [];
    }
  };

  const handleRemoveItem = (itemId: string, productName: string) => {
    if (!userId) return;

    confirmAlert({
      title: 'Xác nhận xóa sản phẩm',
      message: `Bạn có chắc chắn muốn xóa "${productName}" khỏi giỏ hàng?`,
      buttons: [
        {
          label: 'Có, xóa',
          onClick: () => {
            axios.delete(`http://localhost:3000/client/cart/${userId}/item/${itemId}`)
              .then(() => {
                toast.success('Xóa sản phẩm thành công!', { autoClose: 2000 });
                return axios.get(`http://localhost:3000/client/cart?userId=${userId}&page=1&limit=1000`);
              })
              .then(res => {
                setCartItems(res.data.data.items);
                setTotalPrice(res.data.data.cartTotal);
                setSelectedCartItemIds([]);
                setSelectAll(false);
              })
              .catch(err => {
                toast.error('Xóa sản phẩm thất bại!');
                console.error(err);
              });
          }
        },
        {
          label: 'Hủy',
          onClick: () => {
            // Không làm gì
          }
        }
      ]
    });
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedCartItemIds([]);
    } else {
      setSelectedCartItemIds(cartItems.map(item => item._id));
    }
  };

  const fetchCartAgain = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:3000/client/cart?userId=${userId}&page=1&limit=1000`);
      console.log('Raw cart data from API:', res.data.data.items);
      setCartItems(res.data.data.items);
      setTotalPrice(res.data.data.cartTotal);
      setSelectedCartItemIds([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Lỗi khi reload giỏ hàng:', error);
    }
  };

  const selectedItems = cartItems.filter(item => selectedCartItemIds.includes(item._id));

  // Debug: Log selected items and their prices
  console.log('selectedCartItemIds:', selectedCartItemIds);
  console.log('cartItems length:', cartItems.length);
  console.log('Selected items:', selectedItems);
  selectedItems.forEach(item => {
    console.log(`Item: ${item.productDetail?.product?.name}, Color: ${item.productDetail?.color?.name}, Size: ${item.productDetail?.size?.name}, finalPrice: ${item.finalPrice}, quantity: ${item.quantity}, total: ${item.finalPrice * item.quantity}, ID: ${item._id}`);
  });

  // Debug log để kiểm tra tất cả cartItems
  console.log('All cart items:', cartItems);
  cartItems.forEach((item, index) => {
    console.log(`CartItem[${index}]: ${item.productDetail?.product?.name}, Color: ${item.productDetail?.color?.name}, Size: ${item.productDetail?.size?.name}, ID: ${item._id}`);
  });

  const selectedTotalPrice = selectedItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
  console.log('Calculated selectedTotalPrice:', selectedTotalPrice);

  const finalPrice = Math.max(selectedTotalPrice - discountTotal, 0);

  return cartItems.length === 0 ? (
    <p>Giỏ hàng của bạn đang trống!</p>
  ) : (
    <div className="shopee-cart-container">
      <h2 className="shopee-cart-title">Giỏ Hàng</h2>

      <div className="cart-layout">
        <div className="cart-left">
          <div className="shopee-cart-header">
            <input type="checkbox" checked={selectAll} onChange={handleSelectAllChange} style={{ marginRight: 8 }} />
            <div className="col-product">Sản Phẩm</div>
            <div className="col-price">Đơn Giá</div>
            <div className="col-quantity">Số Lượng</div>
            <div className="col-total">Số Tiền</div>
            <div className="col-action">Thao Tác</div>
          </div>

          {cartItems.map((item, index) => {
            const pricePerItem = item.productDetail.product.salePrice || 0;
            const priceTotal = pricePerItem * item.quantity;
            const priceFinalTotal = item.finalPrice * item.quantity;
            const isDiscounted = priceFinalTotal < priceTotal;

            return (
              <div key={`${item._id}-${item.productDetail._id}-${index}`} className="shopee-cart-item">
                <input
                  type="checkbox"
                  checked={selectedCartItemIds.includes(item._id)}
                  onChange={() => {
                    if (selectedCartItemIds.includes(item._id)) {
                      setSelectedCartItemIds(prev => prev.filter(id => id !== item._id));
                    } else {
                      setSelectedCartItemIds(prev => [...prev, item._id]);
                    }
                  }}
                  style={{ marginRight: 8 }}
                />
                <div className="col-product">
                  <div className="shopee-cart-image">
                    <img
                      src={item.productImage && !item.productImage.startsWith('http') ? `http://localhost:3000/${item.productImage}` : item.productImage || 'https://via.placeholder.com/150'}
                      alt={item.productDetail.product.name}
                      onError={(e) => {
                        console.error('Image load error for:', item.productImage);
                        e.currentTarget.src = 'https://via.placeholder.com/150';
                      }}
                    />
                  </div>
                  <div className="shopee-cart-info">
                    <div className="shopee-cart-name">{item.productDetail.product.name}</div>
                    <div className="shopee-cart-variant">
                      {item.productDetail.color.name} / {item.productDetail.size.name}
                    </div>
                  </div>
                </div>

                <div className="col-price">
                  {isDiscounted ? (
                    <>
                      <span className="shopee-cart-old-price">
                        {pricePerItem.toLocaleString('vi-VN').replaceAll(',', '.')} ₫
                      </span>
                      <br />
                      <span className="shopee-cart-sale-price">
                        {item.finalPrice.toLocaleString('vi-VN').replaceAll(',', '.')} ₫
                      </span>
                    </>
                  ) : (
                    <span className="shopee-cart-sale-price">
                      {pricePerItem.toLocaleString('vi-VN').replaceAll(',', '.')} ₫
                    </span>
                  )}
                </div>

                <div className="col-quantity">
                  <button onClick={async () => {
                    const newQ = item.quantity - 1;
                    if (newQ >= 1) {
                      await axios.put(`http://localhost:3000/client/cart/${userId}/item/${item._id}`, { quantity: newQ });
                      fetchCartAgain();
                    }
                  }}>-</button>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={async e => {
                      let val = parseInt(e.target.value);
                      if (isNaN(val) || val < 1) val = 1;

                      // Kiểm tra số lượng tồn kho trước khi cập nhật
                      if (val > item.productDetail.quantity) {
                        toast.error(`Số lượng tối đa có thể mua là ${item.productDetail.quantity}!`);
                        return;
                      }

                      try {
                        await axios.put(`http://localhost:3000/client/cart/${userId}/item/${item._id}`, { quantity: val });
                        fetchCartAgain();
                      } catch (error: any) {
                        toast.error(error.response?.data?.message || 'Lỗi cập nhật số lượng!');
                      }
                    }}
                  />

                  <button onClick={async () => {
                    const newQ = item.quantity + 1;

                    // Kiểm tra số lượng tồn kho trước khi tăng
                    if (newQ > item.productDetail.quantity) {
                      toast.error(`Số lượng tối đa có thể mua là ${item.productDetail.quantity}!`);
                      return;
                    }

                    try {
                      await axios.put(`http://localhost:3000/client/cart/${userId}/item/${item._id}`, { quantity: newQ });
                      fetchCartAgain();
                    } catch (error: any) {
                      toast.error(error.response?.data?.message || 'Lỗi tăng số lượng!');
                    }
                  }}>+</button>
                </div>

                <div className="col-total">
                  {priceFinalTotal.toLocaleString('vi-VN').replaceAll(',', '.')} ₫
                </div>

                <div className="col-action">
                  <button onClick={() => handleRemoveItem(item._id, item.productDetail.product.name)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-right">
          <div className="shopee-cart-summary">
            <div className="shopee-cart-total-label">Tổng tiền:</div>
            <div className="shopee-cart-total-value">
              {selectedTotalPrice.toLocaleString('vi-VN').replaceAll(',', '.')} ₫
            </div>
            {discountTotal > 0 && (
              <>
                <div className="shopee-cart-total-label">Voucher:</div>
                <div className="shopee-cart-total-value" style={{ color: 'green' }}>
                  -{discountTotal.toLocaleString('vi-VN').replaceAll(',', '.')} ₫
                </div>
              </>
            )}
            <div className="shopee-cart-total-label">Thanh toán:</div>
            <div className="shopee-cart-total-value">
              {finalPrice.toLocaleString('vi-VN').replaceAll(',', '.')} ₫
            </div>

            <button
              className="shopee-cart-checkout"
              onClick={async () => {
                if (selectedCartItemIds.length === 0) {
                  toast.warn('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!');
                  return;
                }

                const itemsToCheck: StockCheckItem[] = cartItems
                  .filter(item => selectedCartItemIds.includes(item._id))
                  .map(item => ({
                    productDetailId: item.productDetail._id,
                    quantity: item.quantity,
                  }));

                const stockResults = await checkStock(itemsToCheck);

                const stockResultsWithDetails = stockResults.map(result => {
                  if (result.productName && result.colorName && result.sizeName) return result;
                  const matchedItem = cartItems.find(item => item.productDetail._id === result.productDetailId);
                  return {
                    ...result,
                    productName: result.productName || matchedItem?.productDetail.product.name || 'Sản phẩm không rõ',
                    colorName: result.colorName || matchedItem?.productDetail.color.name || '',
                    sizeName: result.sizeName || matchedItem?.productDetail.size.name || '',
                  };
                });

                const insufficientStockItems = stockResultsWithDetails.filter(item => !item.ok);
                if (insufficientStockItems.length > 0) {
                  insufficientStockItems.forEach(item => {
                    toast.error(`Sản phẩm ${item.productName} - Màu: ${item.colorName} - Size: ${item.sizeName} không đủ số lượng. Tồn kho: ${item.available}`);
                  });
                } else {
                  console.log('🛒 BEFORE NAVIGATE - selectedCartItemIds:', selectedCartItemIds);
                  console.log('🛒 BEFORE NAVIGATE - selectedVoucherIds:', selectedVoucherIds);
                  localStorage.setItem('selectedVouchers', JSON.stringify(selectedVoucherIds));
                  localStorage.setItem('selectedCartItems', JSON.stringify(selectedCartItemIds));
                  console.log('💾 SAVED TO LOCALSTORAGE - selectedCartItems:', JSON.stringify(selectedCartItemIds));
                  // Truyền cả originalAmount và voucherDiscount
                  navigate(`/client/checkoutform?amount=${selectedTotalPrice}&voucherDiscount=${discountTotal}`);
                }
              }}
            >
              <i className="bi bi-credit-card"></i> Thanh toán
            </button>
          </div>

          {/* Danh sách voucher */}
          <div className="voucher-list-container" style={{ marginTop: '20px' }}>
            <h4>Chọn voucher</h4>
            {vouchers.length === 0 ? (
              <p>Bạn không có voucher nào.</p>
            ) : (
              <ul>
                {vouchers.map(voucher => {
                  const isDisabled = selectedTotalPrice < voucher.minOrderAmount || voucher.status !== 'active' || new Date(voucher.endDate) < new Date();
                  return (
                    <li key={voucher._id}>
                      <label style={{ color: isDisabled ? '#aaa' : '#000' }}>
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={selectedVoucherIds.includes(voucher._id)}
                          onChange={() => handleVoucherToggle(voucher._id)}
                        />{' '}
                        <strong>{voucher.code}</strong> – Giảm {voucher.discountAmount.toLocaleString('vi-VN').replaceAll(',', '.')} ₫
                        <br />
                        <span>
                          Đơn tối thiểu: {voucher.minOrderAmount.toLocaleString('vi-VN').replaceAll(',', '.')} ₫ | HSD: {new Date(voucher.endDate).toLocaleDateString()}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Cart;
