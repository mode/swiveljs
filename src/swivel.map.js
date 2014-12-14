Swivel.Map = function(fields) {
  this.values   = [];
  this.fieldMap = {};
  this.fields   = fields;

  for(var i = 0; i < fields.length; i++) {
    this.fieldMap[fields[i]] = { orientation: 'r', filters: [] }
  }
};

Swivel.Map.prototype = {
  select: function() {
    var args = Swivel.Util.toArray(arguments);
    this.values = this.values.concat(args);
    return this;
  },

  pivotBy: function() {
    var pivotFields = [].concat(Array.prototype.slice.call(arguments, 0));

    // Reset Orientation
    for(var i = 0; i < this.fields.length; i++) {
      this.getField(this.fields[i]).orientation = 'r';
    }

    // Set Pivot Fields to 'c' (column)
    for(var i = 0; i < pivotFields.length; i++) {
      this.getField(pivotFields[i]).orientation = 'c';
    }

    return this;
  },

  where: function(fieldName, filter) {
    this.getField(fieldName).filters.push(filter);
    return this;
  },

  all: function() {
    // DO THE DAMN THANG
  },

  getField: function(fieldName) {
    return this.fieldMap[fieldName];
  },

  getFieldByIndex: function(fieldIndex) {
    return this.fieldMap[this.fields[fieldIndex]];
  }
}
