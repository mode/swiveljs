swivel.map = function(fields) {
  var values   = [];
  var fieldMap = {};

  var _map = {
    select: select,
    pivot: pivot,
    where: where
  };

  for(var i = 0; i < fields.length; i++) {
    fieldMap[fields[i]] = { orientation: 'r', filters: [] }
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

  // Private

  function getField(fieldName) {
    return fieldMap[fieldName];
  };

  function getFieldByIndex(fieldIndex) {
    return fieldMap[fields[fieldIndex]];
  };

  return _map;
};
