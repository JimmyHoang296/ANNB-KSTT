import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getData, updateData } from '../services/api';
import styles from './DetailPage.module.css';

const READ_ONLY_FIELDS = ['id', 'email', 'mã CH', 'tên CH', 'tóm tắt vấn đề', 'kstt phụ trách', 'annb phụ trách', 'ngày bắt đầu'];
const EDITABLE_FIELDS = ['trạng thái', 'ngày hoàn thành', 'cập nhật', 'Giá trị thất thoát', 'Giá trị thu hồi', 'Kết luận'];
const ALL_FIELDS = [...READ_ONLY_FIELDS, 'trạng thái', 'ngày hoàn thành', 'cập nhật', 'Giá trị thất thoát', 'Giá trị thu hồi', 'Kết luận'];

const FIELD_LABELS = {
  id: 'ID',
  email: 'Email',
  'trạng thái': 'Trạng thái',
  'mã CH': 'Mã CH',
  'tên CH': 'Tên CH',
  'tóm tắt vấn đề': 'Tóm tắt vấn đề',
  'kstt phụ trách': 'KSTT phụ trách',
  'annb phụ trách': 'ANNB phụ trách',
  'ngày bắt đầu': 'Ngày bắt đầu',
  'ngày hoàn thành': 'Ngày hoàn thành',
  'cập nhật': 'Nội dung cập nhật',
  'Giá trị thất thoát': 'Giá trị thất thoát',
  'Giá trị thu hồi': 'Giá trị thu hồi',
  'Kết luận': 'Kết luận',
};

const STATUS_OPTIONS = ['Đang xử lý', 'Hoàn thành', 'Chờ xử lý', 'Tạm dừng'];

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
            const editableValues = {};
            EDITABLE_FIELDS.forEach((f) => { editableValues[f] = row[f] || ''; });
            setForm(editableValues);
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

      <div className={styles.card}>
        <h3 className={styles.section}>Thông tin chung</h3>
        <div className={styles.grid}>
          {READ_ONLY_FIELDS.map((field) => (
            <div key={field} className={field === 'tóm tắt vấn đề' ? styles.fullWidth : ''}>
              <div className={styles.fieldLabel}>{FIELD_LABELS[field]}</div>
              <div className={styles.fieldValue}>{original?.[field] || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      <form className={styles.card} onSubmit={handleSave}>
        <h3 className={styles.section}>Thông tin cập nhật</h3>
        <div className={styles.grid}>
          <div>
            <label className={styles.fieldLabel}>Trạng thái</label>
            <select
              className={styles.input}
              value={form['trạng thái'] || ''}
              onChange={(e) => handleChange('trạng thái', e.target.value)}
            >
              <option value="">-- Chọn trạng thái --</option>
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className={styles.fieldLabel}>Ngày hoàn thành</label>
            <input
              className={styles.input}
              type="text"
              placeholder="dd/mm/yyyy"
              value={form['ngày hoàn thành'] || ''}
              onChange={(e) => handleChange('ngày hoàn thành', e.target.value)}
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>Giá trị thất thoát</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Nhập giá trị"
              value={form['Giá trị thất thoát'] || ''}
              onChange={(e) => handleChange('Giá trị thất thoát', e.target.value)}
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>Giá trị thu hồi</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Nhập giá trị"
              value={form['Giá trị thu hồi'] || ''}
              onChange={(e) => handleChange('Giá trị thu hồi', e.target.value)}
            />
          </div>

          <div className={styles.fullWidth}>
            <label className={styles.fieldLabel}>Nội dung cập nhật</label>
            <textarea
              className={styles.textarea}
              rows={4}
              placeholder="Nhập nội dung cập nhật..."
              value={form['cập nhật'] || ''}
              onChange={(e) => handleChange('cập nhật', e.target.value)}
            />
          </div>

          <div className={styles.fullWidth}>
            <label className={styles.fieldLabel}>Kết luận</label>
            <textarea
              className={styles.textarea}
              rows={4}
              placeholder="Nhập kết luận..."
              value={form['Kết luận'] || ''}
              onChange={(e) => handleChange('Kết luận', e.target.value)}
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
