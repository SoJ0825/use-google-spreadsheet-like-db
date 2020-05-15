function doGet(e) {
  let params = e.parameter;
  console.log(params);
  let method = params.method;
  let fileId = '1_F4ufX54cIbiQWgfHoWYvJze2ZKojwR8ZYbHdxhRkcc';
  let tasks = new Database(fileId, 'tasks');
  var result = '';
  if (tasks.tableExist) {
    switch(method) {
//=============================================================================
      case 'all':
        result = tasks.valsByDataRange();
        break;
//=============================================================================
      case 'create':
        result = tasks.create({'name': params.name}).valByRow();
        break;
//=============================================================================
      case 'delete':
        if (! (params.id && Number(params.id))) {
          result = 'The id field is required and number.';
          break;
        }
        var id = Number(params.id);
        var task = tasks.find(id);
        if (task.range) {
          task.delete();
          result = task.valByRow();
        } else {
          result = 'The id is invalid.';
        }
        break;
//=============================================================================
      case 'one':
        if (! (params.id && Number(params.id))) {
          result = 'The id field is required and number.';
          break;
        }
        var id = Number(params.id);
        var task = tasks.find(id);
        if (task.range) {
          result = task.valByRow();
        } else {
          result = 'The id is invalid.';
        }
        break;
//=============================================================================
      case 'update':
        if (! (params.id && Number(params.id))) {
          result = 'The id field is required and number.';
          break;
        }
        var id = Number(params.id);
        var task = tasks.find(id);
        var data = {};
        if (task.range) {
          if (params.name) data['name'] = params.name;
          if (params.is_completed) data['is_completed'] = params.is_completed;
          task.update(data);
          result = task.valByRow();
        } else {
          result = 'The id is invalid.';
        }
        break;
//=============================================================================
       default:
        result = 'Something wrong!';
        break;
    }
    var JSONString = JSON.stringify(result);
    console.log(JSONString);
    return ContentService.createTextOutput(JSONString).setMimeType(ContentService.MimeType.JSON);
  } else {
    return ContentService.createTextOutput('table not found').setMimeType(ContentService.MimeType.JSON);
  }
}

function test(){
    e = { parameter: { 
          name: 'one1', 
          id: '27', 
          method: 'update' 
        }
      };
  doGet(e);
}

