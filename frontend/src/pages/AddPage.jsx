import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addData } from '../services/api';
import styles from './DetailPage.module.css';

const INITIAL_FORM = {
  'Nguồn tiếp nhận': '',
  'Site': '',
  'Tên Cửa hàng': '',
  'Người vi phạm': '',
  'Chức vụ/Chức danh': '',
  'Mã nhân viên': '',
  'ANCS': '',
  'KSTT': '',
  'ANNB': '',
  'Phân loại hành vi': '',
  'Giá trị chiếm đoạt': '',
  'Thất thoát(mất hàng, CLKK…)': '',
  'Tổng thiệt hại': '',
  'Số tiền ANNB đã thu hồi': '',
  'Tóm tắt nội dung': '',
  'Phương án xử lý': '',
  'Quyết định của Bản án': '',
  'Link Bản án': '',
  'Ngày phân công /tiếp nhận': '',
  'Deadline thực hiện': '',
  'Ngày hoàn thành(thực tế)': '',
  'Tình trạng thực hiện': '',
  'Cập nhật chi tiết': '',
};

const STATUS_OPTIONS = ['Đang thực hiện', 'Đã hoàn thành', 'Chưa thực hiện', 'Tạm dừng'];
const NGUON_OPTIONS = ['ANCS', 'KSTT', 'VH', 'Tố cáo', 'Khác'];

const TEXTAREA_FIELDS = new Set(['Tóm tắt nội dung', 'Phương án xử lý', 'Quyết định của Bản án', 'Cập nhật chi tiết']);
const FULL_WIDTH_FIELDS = new Set(['Tóm tắt nội dung', 'Phương án xử lý', 'Quyết định của Bản án', 'Cập nhật chi tiết']);

const SECTIONS = [
  {
    title: 'Thông tin cơ bản',
    fields: ['Nguồn tiếp nhận', 'Site', 'Tên Cửa hàng', 'Người vi phạm', 'Chức vụ/Chức danh', 'Mã nhân viên'],
  },
  {
    title: 'Phân công',
    fields: ['ANCS', 'KSTT', 'ANNB', 'Ngày phân công /tiếp nhận', 'Deadline thực hiện', 'Tình trạng thực hiện'],
  },
  {
    title: 'Nội dung vi phạm',
    fields: ['Phân loại hành vi', 'Tóm tắt nội dung'],
  },
  {
    title: 'Giá trị thiệt hại',
    fields: ['Giá trị chiếm đoạt', 'Thất thoát(mất hàng, CLKK…)', 'Tổng thiệt hại', 'Số tiền ANNB đã thu hồi'],
  },
  {
    title: 'Kết quả xử lý',
    fields: ['Ngày hoàn thành(thực tế)', 'Link Bản án', 'Phương án xử lý', 'Quyết định của Bản án', 'Cập nhật chi tiết'],
  },
];

const FIELD_PLACEHOLDERS = {
  'Ngày phân công /tiếp nhận': 'dd/mm/yyyy',
  'Deadline thực hiện': 'dd/mm/yyyy',
  'Ngày hoàn thành(thực tế)': 'dd/mm/yyyy',
  'Link Bản án': 'https://...',
};

export default function AddPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form['Tên Cửa hàng'] && !form['Người vi phạm']) {
      setError('Vui lòng nhập ít nhất Tên Cửa hàng hoặc Người vi phạm');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const result = await addData(form);
      if (result.success) {
        navigate(`/detail/${result.id}`);
      } else {
        setError(result.message || 'Thêm không thành công');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function renderField(field) {
    const isFullWidth = FULL_WIDTH_FIELDS.has(field);
    const isTextarea = TEXTAREA_FIELDS.has(field);
    const placeholder = FIELD_PLACEHOLDERS[field] || '';

    return (
      <div key={field} className={isFullWidth ? styles.fullWidth : ''}>
        <label className={styles.fieldLabel}>{field}</label>
        {field === 'Nguồn tiếp nhận' ? (
          <select
            className={styles.input}
            value={form[field]}
            onChange={(e) => handleChange(field, e.target.value)}
          >
            <option value="">-- Chọn nguồn --</option>
            {NGUON_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        ) : field === 'Tình trạng thực hiện' ? (
          <select
            className={styles.input}
            value={form[field]}
            onChange={(e) => handleChange(field, e.target.value)}
          >
            <option value="">-- Chọn tình trạng --</option>
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        ) : isTextarea ? (
          <textarea
            className={styles.textarea}
            rows={4}
            placeholder={placeholder || `Nhập ${field.toLowerCase()}...`}
            value={form[field]}
            onChange={(e) => handleChange(field, e.target.value)}
          />
        ) : (
          <input
            className={styles.input}
            type="text"
            placeholder={placeholder || `Nhập ${field.toLowerCase()}`}
            value={form[field]}
            onChange={(e) => handleChange(field, e.target.value)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/data')}>← Danh sách</button>
        <h2 className={styles.title}>Thêm sự vụ mới</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {SECTIONS.map((section) => (
          <div key={section.title} className={styles.card}>
            <h3 className={styles.section}>{section.title}</h3>
            <div className={styles.grid}>
              {section.fields.map(renderField)}
            </div>
          </div>
        ))}

        {error && <p className={styles.errorText} style={{ margin: '0 0 1rem' }}>{error}</p>}

        <div className={styles.card}>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate('/data')}>
              Hủy
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Thêm sự vụ'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
