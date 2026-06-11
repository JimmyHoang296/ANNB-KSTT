import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import styles from './Layout.module.css';

export default function Layout({ children }) {
  const { user, signOut } = useAuth();
  const { clearData } = useData();
  const navigate = useNavigate();

  function handleLogout() {
    clearData();
    signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.brand} onClick={() => navigate('/data')}>
          KSTT - ANNB <span>Quản lý sự vụ</span>
        </div>
        <div className={styles.userArea}>
          {user && <span className={styles.userName}>Xin chào, {user.name || user.user}</span>}
          <button className={styles.logoutBtn} onClick={handleLogout}>Đăng xuất</button>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
