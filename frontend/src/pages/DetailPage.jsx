import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getData, updateData } from '../services/api';
import styles from './DetailPage.module.css';

const READ_ONLY_FIELDS = [
  'id', 'Nguồn tiếp nhận', 'Site', 'Tên Cửa hàng',
  'Người vi phạm', 'Chức vụ/Chức danh', 'Mã nhân viên',
  'ANCS', 'KSTT', 'ANNB', 'Phân loại hành vi',
  'Tóm tắt nội dung', 'Ngày phân công /tiếp nhận',
];

const EDITABLE_FIELDS = [
  'Tình trạng thực hiện', 'Deadline thực hiện', 'Ngày hoàn thành(thực tế)',
  'Giá trị chiếm đoạt', 'Thất thoát(mất hàng, CLKK…)', 'Tổng thiệt hại',
  'Số tiền ANNB đã thu hồi', 'Phương án xử lý',
  'Quyết định của Bản án', 'Link Bản án', 'Cập nhật chi tiết',
];

const FULL_WIDTH_FIELDS = new Set([
  'Tóm tắt nội dung', 'Phương án xử lý', 'Quyết định của Bản án', 'Cập nhật chi tiết',
]);

const TEXTAREA_FIELDS = new Set([
  'Phương án xử lý', 'Quyết định của Bản án', 'Cập nhật chi tiết',
]);

const STATUS_OPTIONS = ['Đang thực hiện', 'Đã hoàn thành', 'Chưa thực hiện', 'Tạm dừng'];

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [original, setOriginal] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getData()
      .then((res) => {
        if (res.success) {
          const row = (res.data || []).find((r) => String(r['id']) === String(id));
          if (row) {
            setOriginal(row);
            const init = {};
            EDITABLE_FIELDS.forEach((f) => { init[f] = row[f] || ''; });
            setForm(init);
          } else {
            setError('Không tìm thấy sự vụ với ID: ' + id);
          }
        } else {
          setError(res.message || 'Không thể tải dữ liệu');
        }
      })
      .catch((err) => setError('Lỗi kết nối: ' + err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = { ...original, ...form };
      const result = await updateData(payload);
      if (result.success) {
        setSuccess('Đã lưu thành công!');
        setOriginal(payload);
      } else {
        setError(result.message || 'Lưu không thành công');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className={styles.center}>Đang tải...</div>;
  if (error && !original) return (
    <div className={styles.center}>
      <div>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.backBtn} onClick={() => navigate('/data')}>← Quay lại</button>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/data')}>← Danh sách</button>
        <h2 className={styles.title}>Chi tiết sự vụ #{id}</h2>
      </div>

      {/* Thông tin chung - chỉ đọc */}
      <div className={styles.card}>
        <h3 className={styles.section}>Thông tin chung</h3>
        <div className={styles.grid}>
          {READ_ONLY_FIELDS.map((field) => (
            <div key={field} className={FULL_WIDTH_FIELDS.has(field) ? styles.fullWidth : ''}>
              <div className={styles.fieldLabel}>{field}</div>
              <div className={styles.fieldValue}>{original?.[field] || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Thông tin cập nhật - có thể chỉnh sửa */}
      <form className={styles.card} onSubmit={handleSave}>
        <h3 className={styles.section}>Thông tin xử lý & cập nhật</h3>
        <div className={styles.grid}>

          <div>
            <label className={styles.fieldLabel}>Tình trạng thực hiện</label>
            <select
              className={styles.input}
              value={form['Tình trạng thực hiện'] || ''}
              onChange={(e) => handleChange('Tình trạng thực hiện', e.target.value)}
            >
              <option value="">-- Chọn tình trạng --</option>
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className={styles.fieldLabel}>Deadline thực hiện</label>
            <input
              className={styles.input}
              type="text"
              placeholder="dd/mm/yyyy"
              value={form['Deadline thực hiện'] || ''}
              onChange={(e) => handleChange('Deadline thực hiện', e.target.value)}
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>Ngày hoàn thành (thực tế)</label>
            <input
              className={styles.input}
              type="text"
              placeholder="dd/mm/yyyy"
              value={form['Ngày hoàn thành(thực tế)'] || ''}
              onChange={(e) => handleChange('Ngày hoàn thành(thực tế)', e.target.value)}
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>Giá trị chiếm đoạt</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Nhập giá trị"
              value={form['Giá trị chiếm đoạt'] || ''}
              onChange={(e) => handleChange('Giá trị chiếm đoạt', e.target.value)}
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>Thất thoát (mất hàng, CLKK…)</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Nhập giá trị"
              value={form['Thất thoát(mất hàng, CLKK…)'] || ''}
              onChange={(e) => handleChange('Thất thoát(mất hàng, CLKK…)', e.target.value)}
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>Tổng thiệt hại</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Nhập giá trị"
              value={form['Tổng thiệt hại'] || ''}
              onChange={(e) => handleChange('Tổng thiệt hại', e.target.value)}
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>Số tiền ANNB đã thu hồi</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Nhập giá trị"
              value={form['Số tiền ANNB đã thu hồi'] || ''}
              onChange={(e) => handleChange('Số tiền ANNB đã thu hồi', e.target.value)}
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>Link Bản án</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Nhập link"
              value={form['Link Bản án'] || ''}
              onChange={(e) => handleChange('Link Bản án', e.target.value)}
            />
          </div>

          <div className={styles.fullWidth}>
            <label className={styles.fieldLabel}>Phương án xử lý</label>
            <textarea
              className={styles.textarea}
              rows={4}
              placeholder="Nhập phương án xử lý..."
              value={form['Phương án xử lý'] || ''}
              onChange={(e) => handleChange('Phương án xử lý', e.target.value)}
            />
          </div>

          <div className={styles.fullWidth}>
            <label className={styles.fieldLabel}>Quyết định của Bản án</label>
            <textarea
              className={styles.textarea}
              rows={4}
              placeholder="Nhập quyết định..."
              value={form['Quyết định của Bản án'] || ''}
              onChange={(e) => handleChange('Quyết định của Bản án', e.target.value)}
            />
          </div>

          <div className={styles.fullWidth}>
            <label className={styles.fieldLabel}>Cập nhật chi tiết</label>
            <textarea
              className={styles.textarea}
              rows={5}
              placeholder="Nhập nội dung cập nhật chi tiết..."
              value={form['Cập nhật chi tiết'] || ''}
              onChange={(e) => handleChange('Cập nhật chi tiết', e.target.value)}
            />
          </div>

        </div>

        {error && <p className={styles.errorText}>{error}</p>}
        {success && <p className={styles.successText}>{success}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={() => navigate('/data')}>
            Hủy
          </button>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
