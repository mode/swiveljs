//
// this won't work because data and tree can be instantiated at different times
//
swivel.traveler = function(tree, map) {
  var _data = [];

  // Return Object
  var _traveler = {
    data: data,
    select: select,
    pivot: pivot,
    where: where,
    all: all,
  };

  // Public

  function data(rows) {
    _data = _data.concat(rows);

    return this;
  };

  function select() {
    map.select.apply(map, arguments);

    return this;
  };

  function pivot() {
    map.pivot.apply(map, arguments);

    return this;
  };

  function where() {
    map.where.apply(map, arguments);

    return this;
  };

  function all() {
    tree.insert(_data);

    if(map.hasRows()) {
      return visitRows(tree.getRoot(), 0);
    } else {
      return visitColumns(tree.getRoot(), 0);
    }
  }

  // Private

  function visitRows(node, fieldIdx) {
    var rows = [];

    var currFields   = [];
    var nextFieldIdx = fieldIdx;
    var fieldNames   = map.getFieldNames();

    for(var i = fieldIdx; i < fieldNames.length; i++) {
      if(map.getFieldByIndex(i).isRow()) {
        nextFieldIdx += 1;
        currFields.push(fieldNames[i]);
      } else {
        break;
      }
    }

    tree.eachGroup({}, node, currFields, 0, function(node, branch) {
      var row = {};
      $.extend(row, branch);

      // no more fields available
      if(nextFieldIdx == fieldNames.length) {
        console.log("Aggregating rows", node);
      } else if(map.getFieldByIndex(nextFieldIdx).isColumn()) {
        $.extend(row, visitColumn(node, nextFieldIdx));
      }
      // if next field is a column
      // if there is no next field
      console.log(branch);

      rows.push(row);
    });

    return rows;
  }

  function visitColumn(node, fieldIdx) {
    console.log("visiting column ", fieldIdx);
  }

  // fields needs to be only the fields we want to recurse on

  // function pivotLeft(pivotField, callback) {
  //   if(typeof callback === 'undefined') {
  //     callback = swivel.count();
  //   }
  //
  //   var flattened = [];
  //   var groups    = _groups;
  //
  //   // Bisect fields by the pivotField
  //   var fieldIdx    = fields.indexOf(pivotField);
  //   var leftFields  = fields.slice(0, fieldIdx);
  //   var rightFields = fields.slice(fieldIdx);
  //
  //   var self = this;
  //   var pivotKeys = Object.keys(_values[pivotField]);
  //   eachGroup({}, groups, leftFields, 0, function(groups, group) {
  //     var pivotRow = {};
  //
  //     for(var k = 0; k < pivotKeys.length; k++) {
  //       var groupNode = groups[pivotKeys[k]];
  //
  //       if(typeof groupNode === 'undefined') {
  //         pivotRow[pivotKeys[k]] = null;
  //       } else {
  //         //var rowIdxs   = self.collectIndexes(groupNode, rightFields, 0);
  //         var rowIdxs   = [];
  //         var values    = callback(fetchRows(rowIdxs), group);
  //         var valueKeys = Object.keys(values);
  //
  //         if(valueKeys.length == 1) {
  //           var firstKey = valueKeys[0];
  //           pivotRow[pivotKeys[k]] = values[firstKey];
  //         } else {
  //           pivotRow[pivotKeys[k]] = values
  //         }
  //       }
  //     }
  //
  //     var row = {};
  //     $.extend(row, group, pivotRow);
  //     flattened.push(row);
  //   });
  //
  //   return flattened;
  // };
  //
  //
  // function fetchRows(rowIndexes) {
  //   var rows = [];
  //   for(var i = 0; i < rowIndexes.length; i++) {
  //     var idx = rowIndexes[i];
  //     rows.push(parent.rows[idx]);
  //   }
  //   return rows;
  // };

  // DO THE TRAVELING

  return _traveler;
};
