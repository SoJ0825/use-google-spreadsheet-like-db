function create() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastNewRow = sheet.getLastRow() + 1;
  var columns = sheet.getLastColumn();
  var range = sheet.getRange(lastNewRow, 1, 1, columns);
  // headers ['id', 'name', 'is_completed', 'created_at', 'updated_at']
  var values = [1, 'homework', false, '2020/05/14 14:00:00', '2020/05/14 14:00:00'];
  range.setValues([values]);
}

function find(data, header = 'id') {
	var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
	var headers = ['id', 'name', 'is_completed', 'created_at', 'updated_at'];
	var column = headers.indexOf(header) + 1;
	var row = findRowInColumn(sheet, column, data);
	if (row > 0) {
		return row;
	}
	return 'data not found';
}

function findRowInColumn(sheet, column, data, startRowIndex = 1) {
    var lastRow = sheet.getLastRow();
    var range = sheet.getRange(startRowIndex, column, lastRow, 1);
    var values = range.getValues();
    var row = 0;
    while (values[row] !== undefined && values[row][0] !== data && row < lastRow) {
      row++
    }
    if (row + startRowIndex <= lastRow) {
      return row + startRowIndex;
    } else {
      return -1;
    }
}

function update() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = find(1);
  var columns = sheet.getLastColumn();
  var range = sheet.getRange(row, 1, 1, columns);
  var values = [1, 'update', false, '2020/05/14 14:00:00', '2020/05/14 14:00:00'];
  range.setValues([values]);
}

function deleteRow() {
  var row = find(1);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.deleteRow(row);
}

function demo() {
//  create();
//  console.log(find(3));
//  update();
  deleteRow();
}

