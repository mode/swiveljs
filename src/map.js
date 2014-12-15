swivel.map = function(fields) {
  var selects  = {};
  var fieldMap = {};

  var _map = {
    select: select,
    pivots: pivots,

    hasRows: hasRows,
    hasColumns: hasColumns,

    getField: getField,
    getSelects: getSelects,
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

  function select(aggFn, alias) {
    selects[alias] = aggFn;

    return this;
  };

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

  function getSelects() {
    return selects;
  }

  function getField(fieldName) {
    return fieldMap[fieldName];
  };

  function getFieldByIndex(fieldIndex) {
    return fieldMap[fields[fieldIndex]];
  };

  return _map;
};
