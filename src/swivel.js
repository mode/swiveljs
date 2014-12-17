function swivel(rows) {
  var _data = [];

  var _swivel = {
    data: data,
    fields: fields
  };

  // Public

  function data(data) {
    _data.concat(data);
  };

  function fields() {
    var fields = swivel.args(arguments);

    var map  = swivel.map(fields);
    var tree = swivel.tree(fields);

    return swivel.traveler(tree, map).data(_rows);
  };


  if(typeof rows !== 'undefined') {
    data(rows);
  }

  return _swivel;
};
