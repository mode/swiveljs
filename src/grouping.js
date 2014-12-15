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
  }
};
