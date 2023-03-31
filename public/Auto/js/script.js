function autoCalcSetup() {
    $('form[name=cart]').jAutoCalc('destroy');
    $('form[name=cart] tr[name=line_items]').jAutoCalc({keyEventsFire: true, decimalPlaces: 2, emptyAsZero: true});
    $('form[name=cart]').jAutoCalc({decimalPlaces: 2});
}
autoCalcSetup();
$('button[name=remove]').click(function(e) {
    e.preventDefault();
    var form = $(this).parents('form')
    $(this).parents('tr').remove();
    autoCalcSetup();
});
$('button[name=add]').click(function(e) {
    e.preventDefault();
    var $table = $(this).parents('table');
    var $top = $table.find('tr[name=line_items]').first();
    var $new = $top.clone(true);
    $new.jAutoCalc('destroy');
    $new.insertBefore($top);
    $new.find('input[type=text]').val('');
    autoCalcSetup();
});

// function addRow(tableID) {

//     var table = document.getElementById(tableID);
  
//     var rowCount = table.rows.length;
  
//     var row = table.insertRow(rowCount);
  
//     var cell1 = row.insertCell(0);
//     var element1 = document.createElement("input");
//     element1.type = "checkbox";
//     element1.id = 'text' + rowCount + '';
//     element1.name = "chkbox[]";
//     cell1.appendChild(element1);
  
  
//     var cell2 = row.insertCell(1);
//     var selectList = table.rows[2].querySelector('select');
//     var element2 = document.createElement("select");
//      element2 = selectList.cloneNode(true);
//     element2.id = 'selected-item'+rowCount;
//     cell2.appendChild(element2);

//   }

//   function addRoo(tableID) {

//     var table = document.getElementById(tableID);
  
//     var rowCount = table.rows.length;
  
//     var row = table.insertRow(rowCount);
  
//     var cell1 = row.insertCell(0);
//     var element1 = document.createElement("input");
//     element1.type = "checkbox";
//     element1.id = 'text' + rowCount + '';
//     element1.name = "chkbox[]";
//     cell1.appendChild(element1);
  
  
//     var cell2 = row.insertCell(1);
//     var selectList = table.rows[2].querySelector('select');
//     var element2 = document.createElement("select");
//      element2 = selectList.cloneNode(true);
//     element2.id = 'selected-item'+rowCount;
//     cell2.appendChild(element2);

//   }
  
//   function deleteRow(tableID) {
//     try {
//       var table = document.getElementById(tableID);
//       var rowCount = table.rows.length;
  
//       for (var i = 0; i < rowCount; i++) {
//         var row = table.rows[i];
//         var chkbox = row.cells[0].childNodes[0];
//         if (null != chkbox && true == chkbox.checked) {
//           if (rowCount <= 3) {
//             alert("Cannot delete all the rows.");
//             break;
//           }
//           table.deleteRow(i);
//           rowCount--;
//           i--;
//         }
  
  
//       }
//     } catch (e) {
//       alert(e);
//     }
//   }

