var SPREADSHEET_ID = '1_12l6pHB0YTSr-_QRQAFSqm8y02HdG2HgEbg6jO4-HI';
var SHEET_PIC = 'pic';
var SHEET_DATA = 'data';

function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  try {
    var body = JSON.parse(e.postData.contents);
    var result = dispatch(body);
    output.setContent(JSON.stringify(result));
  } catch (err) {
    output.setContent(JSON.stringify({ success: false, message: err.toString() }));
  }
  return output;
}

function doGet(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  try {
    var body = e.parameter;
    var result = dispatch(body);
    output.setContent(JSON.stringify(result));
  } catch (err) {
    output.setContent(JSON.stringify({ success: false, message: err.toString() }));
  }
  return output;
}

function dispatch(body) {
  var action = body.action;
  switch (action) {
    case 'login':
      return handleLogin(body.user, body.password);
    case 'getData':
      return handleGetData();
    case 'updateData':
      return handleUpdateData(body.data);
    case 'addData':
      return handleAddData(body.data);
    default:
      return { success: false, message: 'Hành động không hợp lệ: ' + action };
  }
}

function handleLogin(user, password) {
  if (!user || !password) {
    return { success: false, message: 'Vui lòng nhập đầy đủ thông tin' };
  }
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_PIC);
  var data = sheet.getDataRange().getValues();
  // Row 0 is header: user | password | tên
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[0]).trim() === String(user).trim() &&
        String(row[1]).trim() === String(password).trim()) {
      return { success: true, user: String(row[0]).trim(), name: String(row[2]).trim() };
    }
  }
  return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' };
}

function handleGetData() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_DATA);
  var values = sheet.getDataRange().getValues();
  if (values.length === 0) return { success: true, data: [] };

  var headers = values[0].map(function(h) { return String(h).trim(); });
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    if (!values[i][0]) continue; // bỏ qua dòng trống
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = values[i][j];
      if (val instanceof Date) {
        obj[headers[j]] = Utilities.formatDate(val, Session.getScriptTimeZone(), 'dd/MM/yyyy');
      } else {
        var strVal = val !== undefined && val !== null ? String(val) : '';
        // Chuẩn hóa string date dạng "Mon Jun 08 2026 00:00:00 GMT+0700..." → dd/MM/yyyy
        if (strVal && /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s/.test(strVal)) {
          var parsed = new Date(strVal);
          obj[headers[j]] = isNaN(parsed.getTime())
            ? strVal
            : Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'dd/MM/yyyy');
        } else {
          obj[headers[j]] = strVal;
        }
      }
    }
    rows.push(obj);
  }
  return { success: true, data: rows };
}

function handleUpdateData(data) {
  if (!data || !data['id']) {
    return { success: false, message: 'Thiếu thông tin ID sự vụ' };
  }
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_DATA);
  var values = sheet.getDataRange().getValues();
  if (values.length === 0) return { success: false, message: 'Sheet data trống' };

  var headers = values[0].map(function(h) { return String(h).trim(); });
  var targetId = String(data['id']).trim();

  var idColIndex = headers.indexOf('id');
  if (idColIndex === -1) return { success: false, message: 'Không tìm thấy cột id' };

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idColIndex]).trim() === targetId) {
      for (var j = 0; j < headers.length; j++) {
        var field = headers[j];
        if (data.hasOwnProperty(field)) {
          sheet.getRange(i + 1, j + 1).setValue(data[field]);
        }
      }
      return { success: true, message: 'Cập nhật thành công' };
    }
  }
  return { success: false, message: 'Không tìm thấy sự vụ với ID: ' + targetId };
}

function handleAddData(data) {
  if (!data) return { success: false, message: 'Không có dữ liệu' };
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_DATA);
  var values = sheet.getDataRange().getValues();
  if (values.length === 0) return { success: false, message: 'Sheet data trống' };

  var headers = values[0].map(function(h) { return String(h).trim(); });

  // Tự động tăng ID
  var maxId = 0;
  var idColIndex = headers.indexOf('id');
  if (idColIndex !== -1) {
    for (var i = 1; i < values.length; i++) {
      var val = parseInt(values[i][idColIndex], 10);
      if (!isNaN(val) && val > maxId) maxId = val;
    }
  }
  var newId = maxId + 1;
  data['id'] = String(newId);

  // Tạo dòng mới theo đúng thứ tự headers
  var newRow = headers.map(function(h) {
    return data.hasOwnProperty(h) ? data[h] : '';
  });

  sheet.appendRow(newRow);
  return { success: true, message: 'Thêm sự vụ thành công', id: newId };
}
