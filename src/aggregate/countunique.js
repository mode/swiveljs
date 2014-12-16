swivel.countUnique = function(field) {
  return function(rows) {
    var values = {};
    for(var r = 0; r < rows.length; r++) {
      var value = rows[r][field];

      if(!(value in values)) {
        values[value] = true
      }
    }

    return Object.keys(values).length;
  };
};
