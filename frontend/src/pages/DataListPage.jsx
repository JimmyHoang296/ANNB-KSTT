import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getData } from '../services/api';
import styles from './DataListPage.module.css';

const SORT_FIELD = 'Ngày phân công /tiếp nhận';
const STATUS_FIELD = 'Tình trạng thực hiện';

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
        if (res.success) setData(res.data || []);
        else setError(res.message || 'Không thể tải dữ liệu');
      })
      .catch((err) => setError('Lỗi kết nối: ' + err.message))
      .finally(() => setLoading(false));
  }, []);

  const statuses = useMemo(() => {
    const unique = [...new Set(data.map((r) => r[STATUS_FIELD]).filter(Boolean))];
    return ['Tất cả', ...unique];
  }, [data]);

  const filtered = useMemo(() => {
    let rows = data;
    if (statusFilter !== 'Tất cả') {
      rows = rows.filter((r) => r[STATUS_FIELD] === statusFilter);
    }
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      rows = rows.filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(kw))
      );
    }
    rows = [...rows].sort((a, b) => {
      const da = parseDate(a[SORT_FIELD]);
      const db = parseDate(b[SORT_FIELD]);
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
  if (error) return <div className={`${styles.center} ${styles.error}`}>{error}</div>;

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
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className={styles.sortBtn} onClick={toggleSort}>
          Ngày phân công {sortDir === 'asc' ? '▲' : '▼'}
        </button>
      </div>

      <button className={styles.addBtn} onClick={() => navigate('/add')}>+ Thêm sự vụ</button>
      <div className={styles.count}>{filtered.length} sự vụ</div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Site</th>
              <th>Tên Cửa hàng</th>
              <th>Người vi phạm</th>
              <th>Phân loại hành vi</th>
              <th>Tình trạng</th>
              <th>KSTT</th>
              <th>Ngày phân công</th>
              <th>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className={styles.empty}>Không có dữ liệu</td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row['id']}
                  className={styles.row}
                  onClick={() => navigate(`/detail/${row['id']}`)}
                >
                  <td>{row['id']}</td>
                  <td>{row['Site']}</td>
                  <td>{row['Tên Cửa hàng']}</td>
                  <td>{row['Người vi phạm']}</td>
                  <td className={styles.summary}>{row['Phân loại hành vi']}</td>
                  <td>
                    <span className={`${styles.badge} ${styles['badge_' + (row[STATUS_FIELD] || '').replace(/[\s/()…]+/g, '_')]}`}>
                      {row[STATUS_FIELD]}
                    </span>
                  </td>
                  <td>{row['KSTT']}</td>
                  <td>{row['Ngày phân công /tiếp nhận']}</td>
                  <td>{row['Deadline thực hiện']}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
