require(['excelExporter', 'lib/jquery-1.12.0'], function(excelExporter, _jquery_placeHolder){
  "use strict";

  excelExporter($('#test_download')[0], {
    'title': 'test',
    'column_map': {
      'id': 'Number',
      'name': 'String'
    },
    'data': [
      {
        'id': '0', 
        'name': '武田信玄'
      },
      {
        'id': '1', 
        'name': '上杉謙信'
      }
    ]
  });
});
