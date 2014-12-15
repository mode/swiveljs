swivel.data = function(data) {
  var _data = {
    fields: fields
  };

  // Public

  function fields() {
    var fields = swivel.util.argArray(arguments);

    var map  = swivel.map(fields);
    var tree = swivel.tree(fields);

    return swivel.traveler(tree, map).data(data);
  };

  return _data;
}

swivel.map = function(fields) {
  var values   = {};
  var fieldMap = {};

  var _map = {
    select: select,
    pivot: pivot,
    where: where,

    hasRows: hasRows,
    hasColumns: hasColumns,

    getField: getField,
    getValues: getValues,
    getFieldNames: getFieldNames,
    getRowFieldNames: getRowFieldNames,
    getColumnFieldNames: getColumnFieldNames,
    getFieldByIndex: getFieldByIndex
  };

  for(var i = 0; i < fields.length; i++) {
    fieldMap[fields[i]] = {
      orientation: 'r', filters: [],
      isRow: function() { return this.orientation == 'r'; },
      isColumn: function() { return this.orientation == 'c'; }
    }
  }

  // Public

  function select(aggregate, alias) {
    values[alias] = aggregate;
    return this;
  };

  function pivot() {
    var pivotFields = [].concat(swivel.util.argArray(arguments));

    // Reset Orientation
    for(var i = 0; i < fields.length; i++) {
      getField(fields[i]).orientation = 'r';
    }

    // Set Pivot Fields to 'c' (column)
    for(var i = 0; i < pivotFields.length; i++) {
      getField(pivotFields[i]).orientation = 'c';
    }

    return this;
  };

  function where(fieldName, filter) {
    getField(fieldName).filters.push(filter);

    return this;
  };

  // Accessors

  function hasRows() {
    return getRowFieldNames().length > 0;
  };

  function hasColumns() {
    return getColumnFieldNames().length > 0;
  };

  function getFieldNames() {
    return fields;
  };

  function getRowFieldNames() {
    var fieldNames = [];
    for(var i = 0; i < fields.length; i++) {
      var fieldName = fields[i];
      if(getField(fieldName).isRow()) {
        fieldNames.push(fieldName);
      }
    }
    return fieldNames;
  };

  function getColumnFieldNames() {
    var fieldNames = [];
    for(var i = 0; i < fields.length; i++) {
      var fieldName = fields[i];
      if(getField(fieldName).isColumn()) {
        fieldNames.push(fieldName);
      }
    }
    return fieldNames;
  }

  // Basic Accessors

  function getValues() {
    return values;
  }

  function getField(fieldName) {
    return fieldMap[fieldName];
  };

  function getFieldByIndex(fieldIndex) {
    return fieldMap[fields[fieldIndex]];
  };

  return _map;
};

/*

  Usage:

  Built-in Aggregates:

    swivel.count()
    swivel.countUnique(<field>[, <alias>])

    swivel.sum(<field>[, <alias>])
    swivel.average(<field>[, <alias>])
    swivel.median(<field>[, <alias>])
    swivel.stdDev(<field>[, <alias>])

    <field>
      the field in the dataset that you want to aggregate over

    <alias>
      The name of the field in the swivelled result, defaults to <field>
*/

function swivel() {}

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

    var nextField = map.getFieldByIndex(nextFieldIdx);
    tree.eachGroup({}, node, currFields, 0, function(node, branch) {
      var row = {};
      $.extend(row, branch);

      // no more fields available
      if(nextFieldIdx == fieldNames.length) {
        $.extend(row, visitValues(node));
      } else if(nextField.isColumn()) {
        $.extend(row, visitColumn(node, nextFieldIdx));
      }

      rows.push(row);
    });

    return rows;
  };

  function visitColumn(node, fieldIdx) {
    var row = {};

    var nextFieldIdx = fieldIdx + 1;
    var fieldNames   = map.getFieldNames();
    var nextField    = map.getFieldByIndex(nextFieldIdx);

    tree.eachValue(node, fieldIdx, function(node, value) {
      var colValue = {};

      if(typeof(node) === 'undefined') { // No branch at this value
        colValue[value] = null;
      } else if(nextFieldIdx == fieldNames.length) { // No more fields
        colValue[value] = visitValues(node);
      } else if(nextField.isRow()) {
        colValue[value] = visitRow(node, nextFieldIdx);
      } else if(nextField.isColumn()) {
        colValue[value] = visitColumn(node, nextFieldIdx);
      }

      $.extend(row, colValue);
    });

    return row;
  };

  function visitValues(node) {
    var rows = [];
    for(var i = 0; i < node.length; i++) {
      rows.push(_data[node[i]]);
    }

    var values = {};
    var selections = map.getValues();
    var aliases    = Object.keys(selections);

    for(var i = 0; i < aliases.length; i++) {
      var alias = aliases[i];
      var aggregate = selections[alias];

      values[alias] = aggregate(rows);
    }

    return values;
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

swivel.tree = function(fields) {
  var root   = {};
  var values = {};

  var _tree = {
    insert: insert,
    getRoot: getRoot,
    eachValue: eachValue,
    eachGroup: eachGroup
  };

  // Public
  function getRoot() {
    return root;
  };

  function insert(rows) {
    for(var rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      insertOne(root, rows[rowIdx], rowIdx, fields, 0);
    }

    return this;
  };

  function eachValue(node, fieldIdx, callback) {
    var field     = fields[fieldIdx];
    var counts    = values[field];
    var valueKeys = Object.keys(counts);

    for(var v = 0; v < valueKeys.length; v++) {
      var valueKey = valueKeys[v];
      var childNode = node[valueKey];

      callback(childNode, valueKey);
    }
  };

  function eachGroup(branch, node, fields, fieldIdx, callback) {
    if(fieldIdx == fields.length) {
      return callback(node, branch);
    }

    var field     = fields[fieldIdx];
    var counts    = values[field];
    var valueKeys = Object.keys(counts);

    // add to group and recurse
    for(var v = 0; v < valueKeys.length; v++) {
      var valueKey = valueKeys[v];
      var childNode = node[valueKey];

      if(typeof childNode !== "undefined") {
        branch[field] = valueKey;
        eachGroup(branch, childNode, fields, fieldIdx + 1, callback);
        delete branch[field];
      }
    }
  };

  // Private

  function insertOne(node, row, rowIdx, fields, fieldIdx) {
    var field      = fields[fieldIdx];
    var value      = row[fields[fieldIdx]];
    var isLeafNode = (fieldIdx + 1 == fields.length);

    // Insert Field

    if(!(field in values)) {
      values[field] = {};
    }

    // Update Field Count

    if(!(value in values[field])) {
      values[field][value] = 1;
    } else {
      values[field][value] += 1;
    }

    // Insert Group

    if(!(value in node)) {
      if(isLeafNode) {
        node[value] = [];
      } else {
        node[value] = {};
      }
    }

    // Terminate: Insert Row Index
    // Continue:  Recurse Into Field List

    if(isLeafNode) {
      node[value].push(rowIdx);
    } else {
      insertOne(node[value], row, rowIdx, fields, fieldIdx + 1);
    }
  };

  return _tree;
}

swivel.util = {};
swivel.util.argArray = function(args) {
  return Array.prototype.slice.call(args, 0);
};

swivel.average = function(field, fieldName) {
  if(typeof fieldName === 'undefined') {
    fieldName = field;
  }

  return function(rows, group) {
    var value = {}

    if(rows.length == 0) {
      value[fieldName] = NaN;
    } else {
      var sum = 0;
      for(var r = 0; r < rows.length; r++) {
        sum += rows[r][field];
      }

      value[fieldName] = sum / rows.length;
    }

    return value;
  };
};

swivel.count = function() {
  return function(rows, group) {
    return {'count': rows.length};
  }
};

swivel.countUnique = function(field, fieldName) {
  if(typeof fieldName === 'undefined') {
    fieldName = field;
  }

  return function(rows, group) {
    var values = {};
    for(var r = 0; r < rows.length; r++) {
      var value = rows[r][field];

      if(!(value in values)) {
        values[value] = true
      }
    }

    var value = {};
    value[fieldName] = Object.keys(values).length;
    return value;
  };
};

swivel.median = function(field, fieldName) {
  if(typeof fieldName === 'undefined') {
    fieldName = field;
  }

  return function(rows, group) {
    var values = [];
    for(var r = 0; r < rows.length; r++) {
      values.push(rows[r][field]);
    }

    var value = {};

    values.sort( function(a,b) { return a - b; } );
    var midPoint = Math.floor(values.length / 2);

    if(values.length % 2) {
      value[fieldName] = values[midPoint];
    } else {
      value[fieldName] = values[midPoint - 1] + values[midPoint] / 2.0;
    }

    return value;
  };
};

swivel.stddev = function(field, fieldName) {
  if(typeof fieldName === 'undefined') {
    fieldName = field;
  }
  
  var average = function(rows) {
    var sum = 0;
    for(var i = 0; i < rows.length; i++) {
      sum += rows[i][field];
    }
    return sum / rows.length;
  };

  var sqDiffs = function(avg, rows) {
    var diffs = []
    for(var i = 0; i < rows.length; i++) {
      var diff = rows[i][field] - avg;
      diffs.push(diff * diff);
    }
    return diffs;
  };

  return function(rows, group) {
    if(rows.length == 0) {
      return NaN;
    };

    var avg = average(rows);

    var diffs = sqDiffs(avg, rows);

    var sqDiffSum = 0;
    for(var i = 0; i < diffs.length; i++) {
      sqDiffSum += diffs[i];
    }
    var avgSqDiff = sqDiffSum / diffs.length;

    var value = {}
    value[fieldName] = Math.sqrt(avgSqDiff);
    return value;
  };
};

swivel.sum = function(field, fieldName) {
  if(typeof fieldName === 'undefined') {
    fieldName = field;
  }

  return function(rows, group) {
    var sum = 0;
    for(var r = 0; r < rows.length; r++) {
      var value = rows[r][field];

      if(value === NaN) {
        sum = NaN;
        break;
      } else if(typeof value !== 'number') {
        sum = NaN;
        break;
      } else {
        sum += value;
      }
    }

    var value = {}
    value[fieldName] = sum;
    return value;
  };
};
