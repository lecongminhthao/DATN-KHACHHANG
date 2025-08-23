import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface TestImage {
  _id: string;
  url: string;
  productId: string;
  productName?: string;
}

const CartImageTest: React.FC = () => {
  const [images, setImages] = useState<TestImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestImages = async () => {
      try {
        const response = await axios.get('http://localhost:3000/debug/check-images');
        console.log('Test images response:', response.data);
        setImages(response.data.sampleImages || []);
      } catch (error) {
        console.error('Error fetching test images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestImages();
  }, []);

  if (loading) {
    return <div>Loading test images...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>🧪 Test Hình Ảnh Sản Phẩm</h2>
      <p>Kiểm tra xem hình ảnh có hiển thị đúng không</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {images.map((image) => (
          <div key={image._id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Product:</strong> {image.productName || 'N/A'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>URL:</strong> {image.url}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Full URL:</strong> http://localhost:3000/{image.url}
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <img 
                src={`http://localhost:3000/${image.url}`}
                alt={image.productName || 'Product'}
                style={{ 
                  width: '100%', 
                  height: '150px', 
                  objectFit: 'cover',
                  border: '1px solid #eee',
                  borderRadius: '4px'
                }}
                onError={(e) => {
                  console.error('Image load error for:', image.url);
                  e.currentTarget.src = 'https://via.placeholder.com/150';
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', image.url);
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {images.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Không có hình ảnh nào để hiển thị
        </div>
      )}
    </div>
  );
};

export default CartImageTest;
