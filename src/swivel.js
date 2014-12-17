function swivel(rows) {
  var _data = [];

  if(typeof rows !== 'undefined') {
    data(rows);
  }

  var _swivel = {
    data: data,
    fields: fields
  };

  // Public

  function data(rows) {
    _data = _data.concat(rows);
  };

  function fields() {
    var fields = swivel.args(arguments);

    var map  = swivel.map(fields);
    var tree = swivel.tree(fields);

    return swivel.traveler(tree, map).data(_data);
  };

  return _swivel;
};
