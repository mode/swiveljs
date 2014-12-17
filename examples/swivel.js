function swivel(rows) {
  var tree     = swivel.tree();
  var traveler = swivel.traveler(tree);

  if(typeof rows !== 'undefined') {
    traveler.data(rows);
  }

  return traveler;
};

swivel.traveler = function(tree, map) {
  var rows = [];
  var path = [];
  var aggs = [];

  // Return Object
  var _traveler = {
    all: all,
    data: data,
    group: group,
    pivot: pivot,
    aggregate: aggregate,
    count: count,
    countUnique: countUnique,
    sum: sum,
    average: average,
    median: median,
    stdDev: stdDev
  };

  // Public

  function data(newRows) {
    rows = rows.concat(newRows);

    return this;
  };

  function group() {
    var fields = [].concat(swivel.args(arguments));

    for(var i = 0; i < fields.length; i++) {
      tree.field(fields[i]);
      path.push({'type': 'group', 'name': fields[i]});
    }

    return this;
  }

  function pivot() {
    var fields = [].concat(swivel.args(arguments));

    for(var i = 0; i < fields.length; i++) {
      tree.field(fields[i]);
      path.push({'type': 'pivot', 'name': fields[i]});
    }

    return this;
  };

  function aggregate(type, field, opts) {
    aggs.push({
      'as': opts['as'] || field,
      'callback': swivel.aggregate(type, field, opts)
    });

    return this;
  };

  function count(field, opts) {
    return aggregate.call(this, 'count', field, opts);
  };

  function countUnique(field, opts) {
    return aggregate.call(this, 'countUnique', field, opts);
  };

  function sum(field, opts) {
    return aggregate.call(this, 'sum', field, opts);
  };

  function average(field, opts) {
    return aggregate.call(this, 'average', field, opts);
  };

  function median(field, opts) {
    return aggregate.call(this, 'median', field, opts);
  };

  function stdDev(field, opts) {
    return aggregate.call(this, 'stdDev', field, opts);
  };

  // get rid of filters?
  // should we provide some utility?
  function where(whereFn) {
    wheres.push(whereFn);

    return this;
  };

  function all() {
    insertAll();

    var result = {
      values: function(fieldName) {
        if(tree.isEmpty()) {
          return [];
        } else {
          return Object.keys(tree.getValues(fieldName));
        }
      }
    };

    // this isn't right, should be if the *first* field is a row

    if(tree.isEmpty()) {
      result['data'] = [];
    } else {
      if(path[0]['type'] == 'group') {
        result['data'] = visitRows(tree.getRoot(), 0);
      } else {
        result['data'] = visitColumn(tree.getRoot(), 0);
      }
    }

    return result;
  }

  // Private

  function insertAll() {
    for(var rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      var row = rows[rowIdx];

      // var included = true;
      // for(var i = 0; i < wheres.length; i++) {
      //   if(wheres[i](row) == false) {
      //     included = false;
      //     break;
      //   }
      // }
      //
      // if(included) {
        tree.insert(row, rowIdx);
      // }
    }
  }

  function getPathFields() {
    var names = [];
    for(var i = 0; i < path.length; i++) {
      names.push(path[i]['name']);
    }
    return names;
  };

  function visitValues(node) {
    var nodeRows = [];
    for(var i = 0; i < node.length; i++) {
      nodeRows.push(rows[node[i]]);
    }

    var values  = {};
    for(var i = 0; i < aggs.length; i++) {
      values[aggs[i]['as']] = aggs[i]['callback'](nodeRows);
    }

    return values;
  };

  function visitRows(node, fieldIdx) {
    var rows = [];

    var currFields   = [];
    var nextFieldIdx = fieldIdx;
    var fieldNames   = getPathFields();

    for(var i = fieldIdx; i < fieldNames.length; i++) {
      if(path[i]['type'] == 'group') {
        nextFieldIdx += 1;
        currFields.push(fieldNames[i]);
      } else {
        break;
      }
    }

    var nextField = path[nextFieldIdx];
    tree.eachBranch({}, node, currFields, 0, function(node, branch) {
      var row = {};
      swivel.merge(row, branch);

      // no more fields available
      if(nextFieldIdx == fieldNames.length) {
        swivel.merge(row, visitValues(node));
      } else if(nextField['type'] == 'pivot') {
        swivel.merge(row, visitColumn(node, nextFieldIdx));
      }

      rows.push(row);
    });

    return rows;
  };

  function visitColumn(node, fieldIdx) {
    var row = {};

    var nextFieldIdx = fieldIdx + 1;
    var fieldNames   = getPathFields();
    var nextField    = path[nextFieldIdx];

    tree.eachValue(node, fieldIdx, function(node, value) {
      var colValue = {};

      if(typeof(node) === 'undefined') { // No branch at this value
        colValue[value] = null;
      } else if(nextFieldIdx == fieldNames.length) { // No more fields
         var values = visitValues(node);

        // Lift single values up to the higher level (make optional)
        var valueKeys = Object.keys(values);
        if(valueKeys.length == 1) {
          colValue[value] = values[valueKeys[0]];
        } else {
          colValue[value] = values;
        }

      } else if(nextField['type'] == 'group') {
        colValue[value] = visitRows(node, nextFieldIdx);
      } else if(nextField['type'] == 'pivot') {
        colValue[value] = visitColumn(node, nextFieldIdx);
      }

      swivel.merge(row, colValue);
    });

    return row;
  };

  return _traveler;
};

swivel.tree = function() {
  var length = 0;
  var root   = {};
  var values = {};
  var fields = [];

  var _tree = {
    field: field,
    insert: insert,
    isEmpty: isEmpty,
    getRoot: getRoot,
    getValues: getValues,
    eachValue: eachValue,
    eachBranch: eachBranch
  };

  // Public

  function field(name) {
    fields.push(name);
  };

  function isEmpty() {
    return length == 0;
  };

  function getRoot() {
    return root;
  };

  function getValues(fieldName) {
    return values[fieldName];
  };

  function insert(row, rowIdx) {
    length += 1;
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

  function eachBranch(branch, node, path, depth, callback) {
    if(depth == path.length) {
      return callback(node, branch);
    }

    var field     = path[depth];
    var fValues   = values[field];
    var valueKeys = Object.keys(fValues);

    // add to group and recurse
    for(var v = 0; v < valueKeys.length; v++) {
      var valueKey = valueKeys[v];
      var childNode = node[valueKey];

      if(typeof childNode !== "undefined") {
        branch[field] = valueKey;
        eachBranch(branch, childNode, path, depth + 1, callback);
        delete branch[field];
      }
    }
  };

  // Private

  function insertOne(node, row, rowIdx, path, depth) {
    var field      = path[depth];
    var value      = row[field];
    var isLeafNode = (depth + 1 == path.length);

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
      insertOne(node[value], row, rowIdx, path, depth + 1);
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
