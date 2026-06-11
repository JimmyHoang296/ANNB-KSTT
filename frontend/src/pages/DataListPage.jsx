import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getData } from '../services/api';
import styles from './DataListPage.module.css';

const STATUS_OPTIONS = ['Tất cả', 'Đang xử lý', 'Hoàn thành', 'Chờ xử lý', 'Tạm dừng'];

function parseDate(str) {
  if (!str) return null;
  const parts = str.split('/');
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  return new Date(str);
}

export default function DataListPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [sortDir, setSortDir] = useState('desc');
  const navigate = useNavigate();

  useEffect(() => {
    getData()
      .then((res) => {
        if (res.success) {
          setData(res.data || []);
        } else {
          setError(res.message || 'Không thể tải dữ liệu');
        }
      })
      .catch((err) => setError('Lỗi kết nối: ' + err.message))
      .finally(() => setLoading(false));
  }, []);

  const statuses = useMemo(() => {
    const unique = [...new Set(data.map((r) => r['trạng thái']).filter(Boolean))];
    return ['Tất cả', ...unique];
  }, [data]);

  const filtered = useMemo(() => {
    let rows = data;
    if (statusFilter !== 'Tất cả') {
      rows = rows.filter((r) => r['trạng thái'] === statusFilter);
    }
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      rows = rows.filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(kw))
      );
    }
    rows = [...rows].sort((a, b) => {
      const da = parseDate(a['ngày bắt đầu']);
      const db = parseDate(b['ngày bắt đầu']);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return sortDir === 'asc' ? da - db : db - da;
    });
    return rows;
  }, [data, keyword, statusFilter, sortDir]);

  function toggleSort() {
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
  }

  if (loading) return <div className={styles.center}>Đang tải dữ liệu...</div>;
  if (error) return <div className={styles.center + ' ' + styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          type="text"
          placeholder="Tìm kiếm theo từ khóa..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select
          className={styles.select}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className={styles.sortBtn} onClick={toggleSort}>
          Ngày bắt đầu {sortDir === 'asc' ? '▲' : '▼'}
        </button>
      </div>

      <div className={styles.count}>{filtered.length} sự vụ</div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã CH</th>
              <th>Tên CH</th>
              <th>Tóm tắt vấn đề</th>
              <th>Trạng thái</th>
              <th>KSTT phụ trách</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày hoàn thành</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.empty}>Không có dữ liệu</td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row['id']}
                  className={styles.row}
                  onClick={() => navigate(`/detail/${row['id']}`)}
                >
                  <td>{row['id']}</td>
                  <td>{row['mã CH']}</td>
                  <td>{row['tên CH']}</td>
                  <td className={styles.summary}>{row['tóm tắt vấn đề']}</td>
                  <td>
                    <span className={`${styles.badge} ${styles['badge_' + (row['trạng thái'] || '').replace(/\s+/g, '_')]}`}>
                      {row['trạng thái']}
                    </span>
                  </td>
                  <td>{row['kstt phụ trách']}</td>
                  <td>{row['ngày bắt đầu']}</td>
                  <td>{row['ngày hoàn thành']}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
