import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Cart.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface CartItem {
  _id: string;
  productDetail: {
    _id: string;
    product: { _id: string; name: string; salePrice: number; imageUrl?: string };
    color: { name: string };
    size: { name: string };
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

interface DecodedToken { userId: string; }

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [selectedVoucherIds, setSelectedVoucherIds] = useState<string[]>([]);
  const [discountTotal, setDiscountTotal] = useState<number>(0);
  const [selectedCartItemIds, setSelectedCartItemIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(true);
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
        setSelectedCartItemIds(res.data.data.items.map((item: CartItem) => item._id));
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
    const total = vouchers
      .filter(v => selectedVoucherIds.includes(v._id)
        && totalPrice >= v.minOrderAmount && v.status === 'active')
      .reduce((sum, v) => sum + v.discountAmount, 0);
    setDiscountTotal(total);
  }, [totalPrice, selectedVoucherIds, vouchers]);

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
    toast.error('Đã xảy ra lỗi khi kiểm tra tồn kho.', {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'light',
    });
    return [];
  }
};


  const handleRemoveItem = (itemId: string) => {
    if (!userId) return;
    axios.delete(`http://localhost:3000/client/cart/${userId}/item/${itemId}`)
      .then(() => {
        toast.success('Xóa sản phẩm thành công!', { autoClose: 2000 });
        return axios.get(`http://localhost:3000/client/cart?userId=${userId}&page=1&limit=1000`);
      })
      .then(res => {
        setCartItems(res.data.data.items);
        setTotalPrice(res.data.data.cartTotal);
        setSelectedCartItemIds(res.data.data.items.map((item: CartItem) => item._id));
      })
      .catch(err => {
        toast.error('Xóa sản phẩm thất bại!');
        console.error(err);
      });
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedCartItemIds([]);
    } else {
      setSelectedCartItemIds(cartItems.map(item => item._id));
    }
    setSelectAll(!selectAll);
  };
  const fetchCartAgain = async () => {
  if (!userId) return;
  try {
    const res = await axios.get(`http://localhost:3000/client/cart?userId=${userId}&page=1&limit=1000`);
    setCartItems(res.data.data.items);
    setTotalPrice(res.data.data.cartTotal);
    setSelectedCartItemIds(res.data.data.items.map((item: CartItem) => item._id));
  } catch (error) {
    console.error('Lỗi khi reload giỏ hàng:', error);
  }
};


  const selectedItems = cartItems.filter(item => selectedCartItemIds.includes(item._id));
  const selectedTotalPrice = selectedItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
  const finalPrice = Math.max(selectedTotalPrice - discountTotal, 0);

  return cartItems.length === 0 ? (
    <p>Giỏ hàng của bạn đang trống!</p>
  ) : (
    <div className="shopee-cart-container">
      <h2 className="shopee-cart-title">Giỏ Hàng</h2>

      <div className="shopee-cart-header">
        <input type="checkbox" checked={selectAll} onChange={handleSelectAllChange} style={{ marginRight: 8 }} />
        <div className="col-product">Sản Phẩm</div>
        <div className="col-price">Đơn Giá</div>
        <div className="col-quantity">Số Lượng</div>
        <div className="col-total">Số Tiền</div>
        <div className="col-action">Thao Tác</div>
      </div>

      {cartItems.map(item => {
      const pricePerItem = item.productDetail?.product?.salePrice || 0;
  const priceTotal = pricePerItem * item.quantity;
  const priceFinalTotal = item.finalPrice * item.quantity;
  const isDiscounted = priceFinalTotal < priceTotal;

  const productName = item.productDetail?.product?.name || 'Sản phẩm không xác định';
  const colorName = item.productDetail?.color?.name || '';
  const sizeName = item.productDetail?.size?.name || '';

        return (
          <div key={item._id} className="shopee-cart-item">
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
                <img src={item.productImage ? `/${item.productImage}` : 'https://via.placeholder.com/150'} alt={item.productDetail.product.name} />
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

<input type="number" value={item.quantity} onChange={async e => {
  const val = parseInt(e.target.value) || 1;
  await axios.put(`http://localhost:3000/client/cart/${userId}/item/${item._id}`, { quantity: val });
  fetchCartAgain();
}} />

<button onClick={async () => {
  const newQ = item.quantity + 1;
  await axios.put(`http://localhost:3000/client/cart/${userId}/item/${item._id}`, { quantity: newQ });
  fetchCartAgain();
}}>+</button>
            </div>

            <div className="col-total">
              {priceFinalTotal.toLocaleString('vi-VN').replaceAll(',', '.')} ₫
            </div>

            <div className="col-action">
              <button onClick={() => handleRemoveItem(item._id)}>
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </div>
        );
      })}

      <button
        className="btn btn-secondary"
        onClick={() => setShowVoucherList(!showVoucherList)}
        style={{ marginTop: '20px' }}
      >
        {showVoucherList ? 'Đóng voucher' : 'Chọn voucher giảm giá'}
      </button>

      {showVoucherList && (
        <div className="voucher-list-container">
          <h3>Voucher khả dụng</h3>
          {vouchers.length === 0 ? (
            <p>Bạn không có voucher nào.</p>
          ) : (
            <ul>
              {vouchers.map(voucher => {
                const isDisabled = selectedTotalPrice < voucher.minOrderAmount || voucher.status !== 'active';
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
                        Đơn tối thiểu: {voucher.minOrderAmount.toLocaleString('vi-VN').replaceAll(',', '.')} ₫ | Hết hạn: {new Date(voucher.endDate).toLocaleDateString()}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <div className="shopee-cart-summary">
        <div className="shopee-cart-total-label">Tổng tiền gốc:</div>
        <div className="shopee-cart-total-value">
          {selectedTotalPrice.toLocaleString('vi-VN').replaceAll(',', '.')} ₫
        </div>
        <div className="shopee-cart-total-label">Giảm voucher:</div>
        <div className="shopee-cart-total-value" style={{ color: 'green' }}>
          -{discountTotal.toLocaleString('vi-VN').replaceAll(',', '.')} ₫
        </div>
        <div className="shopee-cart-total-label">Tổng thanh toán:</div>
        <div className="shopee-cart-total-value">
          {finalPrice.toLocaleString('vi-VN').replaceAll(',', '.')} ₫
        </div>

        {/* Nút Thanh toán với kiểm tra tồn kho */}
        <button
  className="shopee-cart-checkout"
  onClick={async () => {
    const itemsToCheck: StockCheckItem[] = cartItems
      .filter(item => selectedCartItemIds.includes(item._id))
      .map(item => ({
        productDetailId: item.productDetail._id,
        quantity: item.quantity,
      }));

    const stockResults = await checkStock(itemsToCheck);

    // stockResults đã có sẵn productName, colorName, sizeName từ backend rồi,
    // nếu không có thì lấy từ cartItems để backup
    const stockResultsWithDetails = stockResults.map(result => {
      if (result.productName && result.colorName && result.sizeName) return result;

      const matchedItem = cartItems.find(
        item => item.productDetail._id === result.productDetailId
      );

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
        toast.error(
          `Sản phẩm ${item.productName} - Màu: ${item.colorName} - Size: ${item.sizeName} không đủ số lượng. Tồn kho: ${item.available}`, {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'light',
          }
        );
      });
    } else {
      localStorage.setItem('selectedVouchers', JSON.stringify(selectedVoucherIds));
      localStorage.setItem('selectedCartItems', JSON.stringify(selectedCartItemIds));
      navigate(`/client/checkoutform?amount=${finalPrice}`);
    }
  }}
>
  <i className="bi bi-credit-card"></i> Thanh toán
</button>

      </div>

      <ToastContainer />
    </div>
  );
};

export default Cart;
