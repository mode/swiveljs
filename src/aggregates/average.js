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
