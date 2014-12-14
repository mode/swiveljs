Swivel.Map = function(grouping) {
  this.fields = [];
  this.fieldMap = {};
};

Swivel.Map.prototype = {
  select: function(values) {
    return this;
  },

  pivotBy: function(fields) {
    return this;
  },

  where: function(field, filter) {
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
