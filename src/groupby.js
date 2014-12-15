swivel.groupBy = function(parent, fields) {
  var _groupBy = {
    groupAll: groupAll
  };

  function groupAll() {
    return swivel.tree(fields).insert(parent.rows);
  };

  return _groupBy;
};
