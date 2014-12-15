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
