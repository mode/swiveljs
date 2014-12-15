//
// this won't work because data and tree can be instantiated at different times
//
swivel.traveler = function(tree, map) {
  // Map
  var _data     = [];

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

    // iterate and return the things
  }

  // Private

  function visitRow() {

  }

  function visitColumn() {

  }

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
  // function eachGroup(group, groups, fields, fieldIdx, callback) {
  //   if(fieldIdx == fields.length) {
  //     return callback(groups, group);
  //   }
  //
  //   var field  = fields[fieldIdx];
  //   var counts = _values[field];
  //   var values = Object.keys(counts).sort();
  //
  //   // add to group and recurse
  //   for(var v = 0; v < values.length; v++) {
  //     var value = values[v];
  //     var groupValue = groups[value];
  //
  //     if(typeof groupValue !== "undefined") {
  //       group[field] = value;
  //       eachGroup(group, groupValue, fields, fieldIdx + 1, callback);
  //       delete group[field];
  //     }
  //   }
  // };
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
