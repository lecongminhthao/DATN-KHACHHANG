import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import './CommentSection.css';

interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  content: string;
  rating: number;
  createdAt: string;
}

interface CommentSectionProps {
  productId: string;
  onRatingUpdate?: (average: number, total: number) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ productId, onRatingUpdate }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [canComment, setCanComment] = useState(false);
  const [newComment, setNewComment] = useState({
    content: '',
    rating: 5
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalComments, setTotalComments] = useState(0);

  // Avatar paths giống như trong Navbar
  const defaultAvatar = '/avatar.png';
  const loggedInAvatar = '/login.jpg';
  const [userAvatar, setUserAvatar] = useState<string>(defaultAvatar);

  const getUserId = () => {
    const token = localStorage.getItem('user');
    if (!token) {
      setUserAvatar(defaultAvatar);
      return null;
    }
    try {
      const decoded: any = jwtDecode(token);
      // Cập nhật currentUser và avatar giống như Navbar
      if (!currentUser) {
        setCurrentUser(decoded);
        setUserAvatar(loggedInAvatar); // Khi login → lấy ảnh từ public
      }
      return decoded.userId;
    } catch {
      setUserAvatar(defaultAvatar);
      return null;
    }
  };

  // Kiểm tra quyền bình luận
  const checkCommentEligibility = async () => {
    const userId = getUserId();
    if (!userId) {
      setCanComment(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/can-comment/${userId}/${productId}`);
      const data = await response.json();

      if (data.success) {
        setCanComment(data.canComment);
      }
    } catch (error) {
      console.error('Error checking comment eligibility:', error);
    }
  };

  // Lấy danh sách bình luận
  const fetchComments = async () => {
    try {
      console.log('🔍 Fetching comments for productId:', productId); // Debug log

      const response = await fetch(`http://localhost:3000/api/comments/product/${productId}`);

      console.log('📡 Response status:', response.status); // Debug log
      console.log('📡 Response ok:', response.ok); // Debug log

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📤 API Response:', data); // Debug log

      if (data.success) {
        setComments(data.data || []);
        const avgRating = data.meta?.averageRating || 0;
        const totalCount = data.meta?.totalComments || 0;

        console.log('⭐ Rating data:', { avgRating, totalCount }); // Debug log

        setAverageRating(avgRating);
        setTotalComments(totalCount);

        // Gửi dữ liệu rating lên component cha
        if (onRatingUpdate) {
          console.log('📤 Sending rating to parent:', avgRating, totalCount); // Debug log
          onRatingUpdate(avgRating, totalCount);
        }
      } else {
        console.log('❌ API returned success: false', data);
      }
    } catch (error) {
      console.error('💥 Error fetching comments:', error);
      console.error('💥 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        productId: productId,
        url: `http://localhost:3000/api/comments/product/${productId}`
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    checkCommentEligibility();
  }, [productId]);

  // Gửi bình luận
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.content.trim()) {
      toast.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: getUserId(),
          productId: productId,
          content: newComment.content,
          rating: newComment.rating
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Bình luận đã được gửi và đang chờ duyệt!');
        setNewComment({ content: '', rating: 5 });
        // Refresh comments
        fetchComments();
      } else {
        toast.error(data.message || 'Có lỗi xảy ra khi gửi bình luận');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Lỗi kết nối server');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="comment-section loading">Đang tải bình luận...</div>;
  }

  return (
    <div className="comment-section">
      <div className="comment-header">
        <h3>Đánh giá khách hàng</h3>
        <div className="rating-summary">
          {totalComments > 0 && (
            <div className="average-rating">
              {renderStars(Math.round(averageRating))}
              <span className="rating-text">
                {averageRating.toFixed(1)}/5 ({totalComments} đánh giá)
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment._id} className="comment-item">
            <div className="comment-header">
              <div className="user-info">
                <strong>{comment.user.name}</strong>
                {renderStars(comment.rating)}
              </div>
              <div className="comment-date">
                {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
            <div className="comment-content">
              {comment.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
