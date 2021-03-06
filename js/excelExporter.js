define(['lib/jquery-1.12.0'], function(_jquery_placeHolder){
  "use strict";
  var exporter = function(selector, jsonObj){
    if(typeof jsonObj != 'object') return "It is not a json object";
    if(!jsonObj.hasOwnProperty('title') || 
        !jsonObj.hasOwnProperty('data') ||
        !jsonObj['data'].length > 0) return 'invalid json object format';

    var utilities = {
      'replaceSpecialChar': function(input){
        if(!input) return '';
        return input.replace(/\&/g, '&amp;')
                    .replace(/\"/g, '&quot;')
                    .replace(/\</g, '&lt;')
                    .replace(/\>/g, '&gt;');
      }
    };
    var column_spec = [];
    var header = '<?xml version="1.0"?>\n' + 
      '<ss:Workbook xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n' + 
      '<ss:Worksheet ss:Name="' + (jsonObj['title'] ? jsonObj['title'] : 'Sheet1') + '">\n' + 
      '<ss:Table>\n\n';

    header += '<ss:Row>\n';
    for(var property in jsonObj['data'][0]){
      header += '  <ss:Cell>\n';
      header += '    <ss:Data ss:Type="String">';
      header += utilities['replaceSpecialChar'](property) + '</ss:Data>\n';
      header += '  </ss:Cell>\n';

      column_spec.push(property);
    }
    header += '</ss:Row>\n';

    var footer = '\n</ss:Table>\n' + '</ss:Worksheet>\n' + '</ss:Workbook>\n';

    var content = '';

    var column_type_getter_class = function(){
      var column_map = {};
      column_spec.forEach(function(column){
        column_map[column] = (jsonObj.hasOwnProperty('column_map') && jsonObj['column_map'].hasOwnProperty(column)) 
                              ? jsonObj['column_map'][column] : 'String';
      });
      this.get_column_type = function(col){
        return column_map[col];
      };

      return this;
    };
    var column_type_getter = new column_type_getter_class();
    var data = jsonObj['data'];
    data.forEach(function(row){
      content += '<ss:Row>\n';
      column_spec.forEach(function(col){
        content += '  <ss:Cell>\n' + 
          '    <ss:Data ss:Type="' + column_type_getter.get_column_type(col) + '">' + 
          row[col] + '</ss:Data>\n' + 
          '  </ss:Cell>\n';
      });
      content += '</ss:Row>\n';
    });

    var ua = window.navigator.userAgent.toLowerCase();
    var msie = ua.indexOf('msie');
    if(msie > 0 && ua.indexOf('msie 9.0') > 0){
      var IEwindow = window.open();
      IEwindow.document.write(header + content + footer);
      IEwindow.document.close();
      IEwindow.document.execCommand('SaveAs', true, jsonObj['title'] + '.xls');
      IEwindow.close();
      return;
    }
    var blob = new Blob([header + content + footer], { 
      //type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      type: 'application/vnd.ms-excel'
    });

    if(msie > 0){
      window.navigator.msSaveBlob(blob, jsonObj['title'] + '.xls');
      return;
    }
    if(selector.nodeName == 'A'){
      jQuery(selector).attr('href', window.URL.createObjectURL(blob));
      jQuery(selector).attr('download', jsonObj['title'] + '.xls');
    } else if (selector.nodeName == 'INPUT'){
      jQuery(selector).click(function(){
        window.location.href = window.URL.createObjectURL(blob);
      });
    }
  };

  return exporter;
});
