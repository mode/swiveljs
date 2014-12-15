swivel.map = function(fields) {
  var values   = [];
  var fieldMap = {};

  var _map = {
    select: select,
    pivot: pivot,
    where: where,

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
      orientation: 'r', filters: [],
      isRow: function() { return this.orientation == 'r'; },
      isColumn: function() { return this.orientation == 'c'; }
    }
  }

  // Public

  function select() {
    values = values.concat(swivel.util.argArray(arguments));

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

  function getField(fieldName) {
    return fieldMap[fieldName];
  };

  function getFieldByIndex(fieldIndex) {
    return fieldMap[fields[fieldIndex]];
  };

  return _map;
};
