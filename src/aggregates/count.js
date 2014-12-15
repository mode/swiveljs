swivel.count = function() {
  return function(rows, group) {
    return {'count': rows.length};
  }
};
