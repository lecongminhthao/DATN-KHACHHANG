import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Test component để kiểm tra hình ảnh trong order detail
const TestOrderDetail: React.FC = () => {
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function để xử lý đường dẫn hình ảnh
  const getImageSrc = (images: any[] | undefined): string => {
    const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ci8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNEMUQ1REIiLz4KPHN2Zz4K';
    
    if (!images || images.length === 0) {
      console.log('No images found, using default');
      return defaultImage;
    }
    
    const firstImage = images[0];
    console.log('Processing first image:', firstImage, 'Type:', typeof firstImage);
    
    // Nếu là object có thuộc tính url
    if (typeof firstImage === 'object' && firstImage && firstImage.url) {
      const imagePath = `/${firstImage.url}`;
      console.log('Using object.url path:', imagePath);
      return imagePath;
    }
    
    // Nếu là string trực tiếp
    if (typeof firstImage === 'string') {
      const imagePath = `/${firstImage}`;
      console.log('Using string path:', imagePath);
      return imagePath;
    }
    
    console.log('No valid image format found, using default');
    return defaultImage;
  };

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        console.log('🧪 Fetching test order data...');
        const response = await axios.get('http://localhost:3000/client/test-order-detail');
        
        if (response.data.success) {
          setOrderData(response.data.order);
          console.log('✅ Order data loaded:', response.data.order);
        } else {
          setError('Không thể tải dữ liệu test');
        }
      } catch (err: any) {
        console.error('❌ Error fetching test data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>🔄 Đang tải dữ liệu test...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>❌ Lỗi: {error}</div>;
  if (!orderData) return <div style={{ padding: '20px' }}>❌ Không có dữ liệu</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 TEST HÌNH ẢNH TRONG ORDER DETAIL</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h2>📦 Thông tin đơn hàng</h2>
        <p><strong>Mã đơn:</strong> {orderData.code}</p>
        <p><strong>Khách hàng:</strong> {orderData.user?.name}</p>
        <p><strong>Tổng tiền:</strong> {orderData.totalAmount?.toLocaleString()}₫</p>
        <p><strong>Số sản phẩm:</strong> {orderData.products?.length || 0}</p>
      </div>

      <h2>🛍️ Danh sách sản phẩm và hình ảnh</h2>
      
      {orderData.products && orderData.products.length > 0 ? (
        <div style={{ display: 'grid', gap: '20px' }}>
          {orderData.products.map((productItem: any, index: number) => {
            const detail = productItem.productDetailId;
            const product = detail?.product;
            
            // Debug log
            console.log(`Product ${index}:`, {
              productName: product?.name,
              hasImages: !!product?.images,
              imagesLength: product?.images?.length,
              firstImageType: typeof product?.images?.[0],
              firstImageUrl: product?.images?.[0]?.url,
              firstImageDirect: product?.images?.[0],
              finalImageSrc: getImageSrc(product?.images),
            });

            return (
              <div key={index} style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '15px',
                backgroundColor: 'white'
              }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  {/* Hình ảnh */}
                  <div style={{ flexShrink: 0 }}>
                    <img
                      src={getImageSrc(product?.images)}
                      alt={product?.name || ''}
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        backgroundColor: '#f8f9fa'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('data:image/svg+xml')) {
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ci8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNEMUQ1REIiLz4KPHN2Zz4K';
                        }
                      }}
                    />
                  </div>

                  {/* Thông tin sản phẩm */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                      {product?.name || 'Không rõ tên sản phẩm'}
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '14px' }}>
                      <div><strong>Thể loại:</strong> {detail?.producttype?.name || '-'}</div>
                      <div><strong>Danh mục:</strong> {detail?.category?.name || '-'}</div>
                      <div><strong>Màu:</strong> {detail?.color?.name || '-'}</div>
                      <div><strong>Kích cỡ:</strong> {detail?.size?.name || '-'}</div>
                      <div><strong>Số lượng:</strong> {productItem.quantity}</div>
                      <div><strong>Thành tiền:</strong> {productItem.finalPrice?.toLocaleString()}₫</div>
                    </div>

                    {/* Debug info */}
                    <details style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                      <summary>🔍 Debug Info</summary>
                      <pre style={{ fontSize: '11px', backgroundColor: '#f8f9fa', padding: '8px', borderRadius: '4px', overflow: 'auto' }}>
                        {JSON.stringify({
                          hasImages: !!product?.images,
                          imagesCount: product?.images?.length || 0,
                          firstImage: product?.images?.[0],
                          imageSrc: getImageSrc(product?.images)
                        }, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          ❌ Không có sản phẩm nào trong đơn hàng
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e8f4fd', borderRadius: '8px' }}>
        <h3>💡 Hướng dẫn kiểm tra:</h3>
        <ol>
          <li>Mở Developer Tools (F12)</li>
          <li>Vào tab Console để xem debug logs</li>
          <li>Kiểm tra tab Network để xem các request hình ảnh</li>
          <li>Nếu hình ảnh không hiển thị, kiểm tra đường dẫn và file có tồn tại không</li>
        </ol>
      </div>
    </div>
  );
};

export default TestOrderDetail;
