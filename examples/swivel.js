swivel.map = function(fields) {
  var fieldMap = {};

  var _map = {
    pivots: pivots,

    hasRows: hasRows,
    hasColumns: hasColumns,

    getField: getField,
    getFieldNames: getFieldNames,
    getRowFieldNames: getRowFieldNames,
    getColumnFieldNames: getColumnFieldNames,
    getFieldByIndex: getFieldByIndex
  };

  for(var i = 0; i < fields.length; i++) {
    fieldMap[fields[i]] = {
      column: false,
      isRow: function() { return !this.column; },
      isColumn: function() { return this.column; }
    }
  }

  // Public

  function pivots() {
    var args = swivel.args(arguments);
    var pivotFields = [].concat(args);

    // Reset Orientation
    for(var i = 0; i < fields.length; i++) {
      getField(fields[i]).column = false;
    }

    // Set Pivot Fields to 'c' (column)
    for(var i = 0; i < pivotFields.length; i++) {
      getField(pivotFields[i]).column = true;
    }

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

  function getField(fieldName) {
    return fieldMap[fieldName];
  };

  function getFieldByIndex(fieldIndex) {
    return fieldMap[fields[fieldIndex]];
  };

  return _map;
};

function swivel(rows) {
  var _data = [];

  if(typeof rows !== 'undefined') {
    data(rows);
  }

  var _swivel = {
    data: data,
    fields: fields
  };

  // Public

  function data(rows) {
    _data = _data.concat(rows);
  };

  function fields() {
    var fields = swivel.args(arguments);

    var map  = swivel.map(fields);
    var tree = swivel.tree(fields);

    return swivel.traveler(tree, map).data(_data);
  };

  return _swivel;
};

swivel.traveler = function(tree, map) {
  var rows    = [];
  var wheres  = [];
  var selects = {};

  // Return Object
  var _traveler = {
    all: all,
    data: data,
    where: where,
    select: select,
    pivots: pivots
  };

  // Public

  function pivots() {
    map.pivots.apply(map, arguments);

    return this;
  };

  function data(newRows) {
    rows = rows.concat(newRows);

    return this;
  };

  function where(whereFn) {
    wheres.push(whereFn);

    return this;
  };

  function select(aggFn, alias) {
    selects[alias] = aggFn;

    return this;
  };

  function all() {
    insertAll();

    var result = {
      values: function(fieldName) {
        return Object.keys(tree.getValues(fieldName));
      }
    };

    // this isn't right, should be if the *first* field is a row

    if(map.getFieldByIndex(0).isRow()) {
      result['data'] = visitRows(tree.getRoot(), 0);
    } else {
      result['data'] = visitColumn(tree.getRoot(), 0);
    }

    return result;
  }

  // Private

  function insertAll() {
    for(var rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      var row = rows[rowIdx];

      var included = true;
      for(var i = 0; i < wheres.length; i++) {
        if(wheres[i](row) == false) {
          included = false;
          break;
        }
      }

      if(included) {
        tree.insert(row, rowIdx);
      }
    }
  }

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
      swivel.merge(row, branch);

      // no more fields available
      if(nextFieldIdx == fieldNames.length) {
        swivel.merge(row, aggregateValues(node));
      } else if(nextField.isColumn()) {
        swivel.merge(row, visitColumn(node, nextFieldIdx));
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
         var values = aggregateValues(node);

        // Lift single values up to the higher level (make optional)
        var valueKeys = Object.keys(values);
        if(valueKeys.length == 1) {
          colValue[value] = values[valueKeys[0]];
        } else {
          colValue[value] = values;
        }

      } else if(nextField.isRow()) {
        colValue[value] = visitRows(node, nextFieldIdx);
      } else if(nextField.isColumn()) {
        colValue[value] = visitColumn(node, nextFieldIdx);
      }

      swivel.merge(row, colValue);
    });

    return row;
  };

  function aggregateValues(node) {
    var nodeRows = [];
    for(var i = 0; i < node.length; i++) {
      nodeRows.push(rows[node[i]]);
    }

    var values  = {};
    var aliases = Object.keys(selects);

    for(var i = 0; i < aliases.length; i++) {
      var alias = aliases[i];
      var aggFn = selects[alias];

      values[alias] = aggFn(nodeRows);
    }

    return values;
  };

  return _traveler;
};

swivel.tree = function(fields) {
  var root   = {};
  var values = {};

  var _tree = {
    insert: insert,
    getRoot: getRoot,
    getValues: getValues,
    eachValue: eachValue,
    eachGroup: eachGroup
  };

  // Public
  function getRoot() {
    return root;
  };

  function getValues(fieldName) {
    return values[fieldName];
  };

  function insert(row, rowIdx) {
    insertOne(root, row, rowIdx, fields, 0);
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
    var fValues   = values[field];
    var valueKeys = Object.keys(fValues);

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
    var value      = row[field];
    var isLeafNode = (fieldIdx + 1 == fields.length);

    // Insert Field

    if(!(field in values)) {
      values[field] = {};
    }

    // Update Field Count

    if(!(value in values[field])) {
      values[field][value] = true;
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

swivel.args = function(args) {
  return Array.prototype.slice.call(args, 0);
};

swivel.merge = function(target, source) {
  for (var attr in source) {
    target[attr] = source[attr];
  }
};

swivel.aggregate = function(fnName, fieldName) {
  switch(fnName) {
    case 'sum':
      return swivel.sum(fieldName);
    case 'count':
      return swivel.count(fieldName);
    case 'countUnique':
      return swivel.countUnique(fieldName);
    case 'average':
      return swivel.average(fieldName);
    case 'median':
      return swivel.median(fieldName);
    case 'stdDev':
      return swivel.stdDev(fieldName);
    default:
      return swivel.sum(fieldName);
    };
};

swivel.average = function(field) {
  return function(rows, group) {
    var value = NaN;

    if(rows.length > 0) {
      var sum = 0;
      for(var r = 0; r < rows.length; r++) {
        sum += rows[r][field];
      }

      value = sum / rows.length;
    }

    return value;
  };
};

swivel.count = function() {
  return function(rows) {
    return rows.length;
  };
};

swivel.countUnique = function(field) {
  return function(rows) {
    var values = {};
    for(var r = 0; r < rows.length; r++) {
      var value = +rows[r][field];

      if(!(value in values)) {
        values[value] = true
      }
    }

    return Object.keys(values).length;
  };
};

swivel.median = function(field) {
  return function(rows) {
    var values = [];
    for(var r = 0; r < rows.length; r++) {
      values.push(+rows[r][field]);
    }

    var value = NaN;

    values.sort( function(a,b) { return a - b; } );
    var midPoint = Math.floor(values.length / 2);

    if(values.length % 2) {
      value = values[midPoint];
    } else {
      value = values[midPoint - 1] + values[midPoint] / 2.0;
    }

    return value;
  };
};

swivel.stdDev = function(field) {
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

    return Math.sqrt(avgSqDiff);
  };
};

swivel.sum = function(field) {
  return function(rows) {
    var sum = 0;

    for(var r = 0; r < rows.length; r++) {
      var value = +rows[r][field];

      if(value === NaN) {
        return NaN;
        break;
      } else if(typeof value !== 'number') {
        return NaN;
        break;
      } else {
        sum += value;
      }
    }

    return sum;
  };
};
