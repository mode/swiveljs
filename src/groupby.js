swivel.groupBy = function(parent, fields) {
  var _groups = {};
  var _values = {};

  var _groupBy = {
    select: select,
    groupAll: groupAll,
    pivotLeft: pivotLeft,
  };

  function select() {
    var map = swivel.map(fields)
    return map.select.apply(map, arguments);
  };

  function groupAll() {
    var groups = _groups;
    var rows   = parent.rows;

    for(var rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      insertRow(groups, rows[rowIdx], rowIdx, fields, 0);
    }

    return this;
  };

  function pivotLeft(pivotField, callback) {
    if(typeof callback === 'undefined') {
      callback = swivel.count();
    }

    var flattened = [];
    var groups    = _groups;

    // Bisect fields by the pivotField
    var fieldIdx    = fields.indexOf(pivotField);
    var leftFields  = fields.slice(0, fieldIdx);
    var rightFields = fields.slice(fieldIdx);

    var self = this;
    var pivotKeys = Object.keys(_values[pivotField]);
    eachGroup({}, groups, leftFields, 0, function(groups, group) {
      var pivotRow = {};

      for(var k = 0; k < pivotKeys.length; k++) {
        var groupNode = groups[pivotKeys[k]];

        if(typeof groupNode === 'undefined') {
          pivotRow[pivotKeys[k]] = null;
        } else {
          //var rowIdxs   = self.collectIndexes(groupNode, rightFields, 0);
          var rowIdxs   = [];
          var values    = callback(fetchRows(rowIdxs), group);
          var valueKeys = Object.keys(values);

          if(valueKeys.length == 1) {
            var firstKey = valueKeys[0];
            pivotRow[pivotKeys[k]] = values[firstKey];
          } else {
            pivotRow[pivotKeys[k]] = values
          }
        }
      }

      var row = {};
      $.extend(row, group, pivotRow);
      flattened.push(row);
    });

    return flattened;
  };

  function insertRow(groups, row, rowIdx, fields, fieldIdx) {
    var field      = fields[fieldIdx];
    var value      = row[fields[fieldIdx]];
    var isLeafNode = (fieldIdx + 1 == fields.length);

    // Insert Field

    if(!(field in _values)) {
      _values[field] = {};
    }

    // Update Field Count

    if(!(value in _values[field])) {
      _values[field][value] = 1;
    } else {
      _values[field][value] += 1;
    }

    // Insert Group

    if(!(value in groups)) {
      if(isLeafNode) {
        groups[value] = [];
      } else {
        groups[value] = {};
      }
    }

    // Terminate: Insert Row Index
    // Continue:  Recurse Into Field List

    if(isLeafNode) {
      groups[value].push(rowIdx);
    } else {
      insertRow(groups[value], row, rowIdx, fields, fieldIdx + 1);
    }
  };

  function eachGroup(group, groups, fields, fieldIdx, callback) {
    if(fieldIdx == fields.length) {
      return callback(groups, group);
    }

    var field  = fields[fieldIdx];
    var counts = _values[field];
    var values = Object.keys(counts).sort();

    // add to group and recurse
    for(var v = 0; v < values.length; v++) {
      var value = values[v];
      var groupValue = groups[value];

      if(typeof groupValue !== "undefined") {
        group[field] = value;
        eachGroup(group, groupValue, fields, fieldIdx + 1, callback);
        delete group[field];
      }
    }
  };

  function fetchRows(rowIndexes) {
    var rows = [];
    for(var i = 0; i < rowIndexes.length; i++) {
      var idx = rowIndexes[i];
      rows.push(parent.rows[idx]);
    }
    return rows;
  };

  return _groupBy;
};
