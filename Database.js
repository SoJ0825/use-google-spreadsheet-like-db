class Database {

  constructor(fileId, tableName) { // class constructor
    this.exists = false;
    this.range = null;
    this.ss = SpreadsheetApp.openById(fileId);
    this.idTableName = 'id_count';
    this.tempTableName = 'temporary';
    this.table = this.ss.getSheetByName(tableName);
    this.id = this.maxId();
    this.headers = this.headers();  
    if (this.table === null) {
      this.tableExist = false;
    } else {
      this.tableExist = true;
    }
  }
  
  /**
   * Insert data into sheet
   *
   * @param {Object} data
   * @returns {Object}
   */
  
  create(data) {
    this.id = this.id + 1;
    data['id'] = this.id;
    data['is_completed'] = false;
    data['created_at'] = this.now();
    data['updated_at'] = this.now();
    var lastNewRow = this.table.getLastRow() + 1;
    var columns = this.table.getLastColumn();
    this.range = this.table.getRange(lastNewRow, 1, 1, columns);
    var values = this.fillHeaders(data);
    this.exists = true;
    this.range.setValues([values]);
    this.updateIdTable();
    
    return this;
  }
  
  /**
   * Delete row from this.range
   *
   * @returns {Boolean}
   */
  
  delete() {
    this.table.deleteRow(this.range.getRowIndex());
  }
  
  /**
   * Fill all attribute from header
   *
   * @param {Object} data
   * @returns {Array}
   */
  
  fillHeaders(data) {
    var values = this.range.getValues()[0];
    this.headers.forEach( (header, index) => {
      if(data[header] || typeof(data[header]) === 'boolean') {
        values[index] = data[header];
      }
    });
    return values;
  }
  
  /**
   * Get values by header
   * 
   * @param {String} data
   * @param {String} header
   * @returns {Array}
   */
  
   find(data, header = 'id') {
     var column = this.headers.indexOf(header) + 1;
     var row = this.findRowInColumn(this.table, column, data);
     if (row > 0) {
       this.range = this.table.getRange(row, 1, 1, this.headers.length);
       this.exists = true;
     }
     return this;
   }
  
  /**
   * Find data row number in one column
   *
   * @param {Sheet} sheet
   * @param {Number} column
   * @param {Mixed} data
   * @param {Number} startRowIndex
   * @returns {Number}
   */
  
  findRowInColumn(sheet, column, data, startRowIndex = 1) {
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
  
  
  /**
   * Returns the column number for hear
   *
   * @param {String} header
   * @returns {Number}
   */
  
  headerToCol(header) {
    var num = this.headers.indexOf(header) + 1;
    if (num > 0) {
      return this.numToCol(num);
    } else {
      return 'header not found';
    }
  }
  
  /**
   * Returns the headers values for this table.
   *
   * @returns {Array}
   */

  headers() {
    var dataRange = this.table.getDataRange().getA1Notation();
    var split = dataRange.split(":");
    var col0  = split[0].match(/\D/g,'');
    var col1  = split[1].match(/\D/g,'');
    var row   = split[0].match(/\d+/g);
    var a1    = col0 + row + ":" + col1 + row;
    return this.table.getRange(a1).getValues()[0];
  }
  
  /**
   * Returns the max id number for this table.
   *
   * @returns {number}
   */
  
  maxId() {
    var idSheet= this.ss.getSheetByName(this.idTableName);
    var tempSheet = this.ss.getSheetByName(this.tempTableName);
    var dataRangeNotation = idSheet.getDataRange().getA1Notation();
    tempSheet.getRange('A1').setFormula(`Query(${this.idTableName}!${dataRangeNotation}, "SELECT B WHERE A = '${this.table.getName()}'",0)`);
    return tempSheet.getRange('A1').getValue();
  }
  
  /**
   * Get now dataTime
   *
   * @returns {string} Y/m/d H:i:s
   */
  now() {
    var now = new Date();
    var date = now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate();
    var time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
    return date+' '+time;
  }
  
  /**
   * Returns the column number as a alphabetical column value.
   * Columns are indexed from 1, not from 0.
   * "CZ" (104) is the highest supported value.
   *
   * @param {number} number
   * @returns {string}
   */

  numToCol(number) {
    var num = number - 1, chr;
    if (num <= 25) {
      chr = String.fromCharCode(97 + num).toUpperCase();
      return chr;
    } else if (num >= 26 && num <= 51) {
      num -= 26;
      chr = String.fromCharCode(97 + num).toUpperCase();
      return "A" + chr;
    } else if (num >= 52 && num <= 77) {
      num -= 52;
      chr = String.fromCharCode(97 + num).toUpperCase();
      return "B" + chr;
    } else if (num >= 78 && num <= 103) {
      num -= 78;
      chr = String.fromCharCode(97 + num).toUpperCase();
      return "C" + chr;
    }
  }
    
  /**
   * Update the max id number in id_count table.
   *
   * @returns void
   */
  
  updateIdTable() {
    var idSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.idTableName);
    var inWhichRow = this.findRowInColumn(idSheet, 1, this.table.getName(), 2);
    idSheet.getRange(inWhichRow, 2).setValue(this.id);
  }
  
  /**
   * Update range values
   *
   * @param {Object} data
   * @returns {Boolean}
   */
  update(data) {
    if ( ! this.exists) {
      return false;
    }
    data['updated_at'] = this.now();
    var values = this.fillHeaders(data);
    this.range.setValues([values]);
    return true;
  }
  
  /**
   * Returns an array of objects representing a range.
   *
   * @returns {Object}
   */

  valByRow(){
    var height = this.range.getHeight();
    var width  = this.range.getWidth();
    var vals   = this.range.getValues();
    for (var i = 0; i < height; i++) {
      var row = {};
      for (var j = 0; j < width; j++) {
        var prop = this.headers[j];
        var val  = vals[i][j];
        if (val !== "") {
          row[prop] = val;
        } 
      }
    }  
    return row;
  }
  
  /**
   * Returns an array of objects representing a range.
   *
   * @returns {Object[]}
   */

  valsByDataRange(){
    var dataRange = this.table.getDataRange();
    var height = dataRange.getHeight();
    var width  = dataRange.getWidth();
    var vals   = dataRange.getValues();
    var arr  = [];
    for (var i = 1; i < height; i++) {
      var row = {};
      for (var j = 0; j < width; j++) {
        var prop = this.headers[j];
        var val  = vals[i][j];
        if (val !== "") {
          row[prop] = val;
        } 
      }
      arr.push(row);
    }  
    return arr;
  }
}

