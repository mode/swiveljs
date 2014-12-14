Swivel.Grouping = function(pivot, fields) {
  this._groups = {};
  this._values = {};
  this._parent = pivot;
  this.fields  = fields;
};

Swivel.Grouping.prototype = {
  select: function() {
    var map = new Swivel.Map(this.fields);
    return map.select.apply(map, arguments);
  },

  groupAll: function() {
    var fields = this.fields;
    var groups = this._groups;
    var rows   = this._parent.rows;

    for(var rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      this.insertRow(groups, rows[rowIdx], rowIdx, fields, 0);
    }

    return this;
  },

  flattenAll: function(callback) {
    var flattened = [];
    var fields    = this.fields;
    var groups    = this._groups;

    var self = this;
    this.eachGroup({}, groups, fields, 0, function(rows, group) {
      var row = {};
      var values = callback(self.fetchRows(rows), group);
      $.extend(row, group, values);
      flattened.push(row);
    });
    return flattened;
  },

  pivotLeft: function(pivotField, callback) {
    if(typeof callback === 'undefined') {
      callback = Swivel.Grouping.Count();
    }

    var flattened = [];
    var fields    = this.fields;
    var groups    = this._groups;

    // Bisect fields by the pivotField
    var fieldIdx    = fields.indexOf(pivotField);
    var leftFields  = fields.slice(0, fieldIdx);
    var rightFields = fields.slice(fieldIdx);

    var self = this;
    var pivotKeys = Object.keys(self._values[pivotField]);
    this.eachGroup({}, groups, leftFields, 0, function(groups, group) {
      var pivotRow = {};

      for(var k = 0; k < pivotKeys.length; k++) {
        var groupNode = groups[pivotKeys[k]];

        if(typeof groupNode === 'undefined') {
          pivotRow[pivotKeys[k]] = null;
        } else {
          var rowIdxs   = self.collectIndexes(groupNode, rightFields, 0);
          var values    = callback(self.fetchRows(rowIdxs), group);
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
  },

  insertRow: function(groups, row, rowIdx, fields, fieldIdx) {
    var field      = fields[fieldIdx];
    var value      = row[fields[fieldIdx]];
    var isLeafNode = (fieldIdx + 1 == fields.length);

    // Insert Field

    if(!(field in this._values)) {
      this._values[field] = {};
    }

    // Update Field Count

    if(!(value in this._values[field])) {
      this._values[field][value] = 1;
    } else {
      this._values[field][value] += 1;
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
      this.insertRow(groups[value], row, rowIdx, fields, fieldIdx + 1);
    }
  },

  eachGroup: function(group, groups, fields, fieldIdx, callback) {
    if(fieldIdx == fields.length) {
      return callback(groups, group);
    }

    var field  = fields[fieldIdx];
    var counts = this._values[field];
    var values = Object.keys(counts).sort();

    // add to group and recurse
    for(var v = 0; v < values.length; v++) {
      var value = values[v];
      var groupValue = groups[value];

      if(typeof groupValue !== "undefined") {
        group[field] = value;
        this.eachGroup(group, groupValue, fields, fieldIdx + 1, callback);
        delete group[field];
      }
    }
  },

  fetchRows: function(rowIndexes) {
    var rows = [];
    for(var i = 0; i < rowIndexes.length; i++) {
      var idx = rowIndexes[i];
      rows.push(this._parent.rows[idx]);
    }
    return rows;
  },

  // Returns: A list of row indices contained in every subtree of a node
  collectIndexes: function(groups, fields, fieldIdx) {
    if(fieldIdx == fields.length - 1) {
      return groups;
    }

    var collected = [];

    var groupKeys = Object.keys(groups);
    for(var k = 0; k < groupKeys.length; k++) {
      var groupNode = groups[groupKeys[k]];
      collected.concat(this.collectIndexes(groupNode, fields, fieldIdx + 1));
    }

    return collected;
  }
};


Swivel.Grouping.count = function() {
  return function(rows, group) {
    return {'count': rows.length};
  }
};

Swivel.Grouping.countUnique = function(field, fieldName) {
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

Swivel.Grouping.sum = function(field, fieldName) {
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

Swivel.Grouping.average = function(field, fieldName) {
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

Swivel.Grouping.median = function(field, fieldName) {
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
  }
};

Swivel.Grouping.stdDev = function(field, fieldName) {
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
  }
};
