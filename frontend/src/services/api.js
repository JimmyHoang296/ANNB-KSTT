// Điền URL Google Apps Script Web App sau khi deploy
const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL || '';

async function callAPI(body) {
  if (!SCRIPT_URL) {
    throw new Error('Chưa cấu hình SCRIPT_URL. Vui lòng điền URL vào file .env');
  }
  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
    redirect: 'follow',
  });
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return response.json();
}

export function login(user, password) {
  return callAPI({ action: 'login', user, password });
}

export function getData() {
  return callAPI({ action: 'getData' });
}

export function updateData(data) {
  return callAPI({ action: 'updateData', data });
}
