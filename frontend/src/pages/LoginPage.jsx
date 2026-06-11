import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login } from '../services/api';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(user.trim(), password);
      if (result.success) {
        signIn({ user: result.user, name: result.name });
        navigate('/data', { replace: true });
      } else {
        setError(result.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>KSTT - ANNB</h1>
        <p className={styles.subtitle}>Quản lý sự vụ</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Tên đăng nhập
            <input
              className={styles.input}
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
              autoFocus
              placeholder="Nhập tên đăng nhập"
            />
          </label>
          <label className={styles.label}>
            Mật khẩu
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu"
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
