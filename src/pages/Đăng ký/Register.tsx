import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;

    try {
      // 👉 TODO: Gửi dữ liệu lên API để đăng ký (hiện tại chỉ giả lập)
      console.log('Đăng ký với:', { username, email, password });
      // Sau khi đăng ký thành công:
      navigate('/client/login');
    } catch (err) {
      console.error('Đăng ký thất bại:', err);
    }
  };

  return (
    <div className="register-container">
      <h2>Đăng ký</h2>
      <form onSubmit={handleRegister} className="register-form">
        <div className="input-group">
          <i className="bi bi-person-fill icon"></i>
          <input type="text" name="username" placeholder="Tên người dùng" required />
        </div>

        <div className="input-group">
          <i className="bi bi-envelope-fill icon"></i>
          <input type="email" name="email" placeholder="Email" required />
        </div>

        <div className="input-group">
          <i className="bi bi-lock-fill icon"></i>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Mật khẩu"
            required
          />
          <i
            className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} toggle-password`}
            onClick={() => setShowPassword(!showPassword)}
          ></i>
        </div>

        <button type="submit" className="register-btn">Đăng ký</button>
      </form>

      <p>Đã có tài khoản? <a href="/client/login">Đăng nhập</a></p>
    </div>
  );
};

export default Register;
