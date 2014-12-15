swivel.groupBy = function(parent, fields) {
  var _groupBy = {
    groupAll: groupAll
  };

  function groupAll() {
    return swivel.tree(fields).insert(parent.rows);
  };

  return _groupBy;
};

swivel.map = function(parent, fields) {
  var values   = [];
  var fieldMap = {};

  var _map = {
    select: select,
    pivotBy: pivotBy,
    where: where,
    all: all
  };

  for(var i = 0; i < fields.length; i++) {
    fieldMap[fields[i]] = { orientation: 'r', filters: [] }
  }

  function getField(fieldName) {
    return fieldMap[fieldName];
  };

  function getFieldByIndex(fieldIndex) {
    return fieldMap[fields[fieldIndex]];
  };

  function select() {
    values = values.concat(swivel.util.argArray(arguments));

    return this;
  };

  function pivotBy() {
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

  function all() {
    return swivel.traveler(parent.groupAll(), this).visitAll();
  };

  return _map;
};

/*

  Usage:

  1. Create a new swivel

    var swizzle = swivel(dataset);

  2. Group the swivel by a subset of available fields

    var byFields = swizzle.groupBy(<fieldName1>[, <fieldName2>, ...]);

  3. Pivot the grouping by a given field by flattening all fields to the left

    var pivotByField = byFields.pivotLeft(<fieldName>[, <callback>]);

    <callback>(rows)
      A function that takes as its arguments an array of rows for each distinct
      group of field values in the grouping. Second parameter is an object with
      the group fields and values for those fields.

      Returns a javascript object representing the set of values to be included
      in the flattened row.

      Defaults to swivel.count

  Example:

    d3.json('dataset.json', function(dataset) {
      var swizzle = swivel(dataset.content);
      var byTeamSeason = swizzle.groupBy('team', 'season');
      var pivotByTeamSeason = byTeamSeason.pivotLeft('season');

      console.log("pivotByTeamSeason", pivotByTeamSeason);
    });

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

function swivel(rows) {
  var swizzle = {
    rows: rows,
    groupBy: groupBy
  };

  function groupBy() {
    var fields = swivel.util.argArray(arguments);
    return swivel.groupBy(this, fields).groupAll();
  }

  return swizzle;
};

swivel.traveler = function(groupby, map) {
  var _traveler = {
    visitAll: visitAll
  };

  function visitAll() {
    // go through each map
  };

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

swivel.tree = function(fields) {
  var root   = {};
  var values = {};

  var _tree = {
    select: select,
    insert: insertAll
  };

  // Public

  function select() {
    var map = swivel.map(this, fields)
    return map.select.apply(map, arguments);
  };

  // add in where, pivotBy, etc.

  function insertAll(rows) {
    for(var rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      insert(root, rows[rowIdx], rowIdx, fields, 0);
    }

    return this;
  }

  // Private

  function insert(node, row, rowIdx, fields, fieldIdx) {
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
      insert(node[value], row, rowIdx, fields, fieldIdx + 1);
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
