swivel.tree = function(fields) {
  var root   = {};
  var values = {};

  var _tree = {
    insert: insert
  };

  // Public

  function insert(rows) {
    for(var rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      insertOne(root, rows[rowIdx], rowIdx, fields, 0);
    }

    return this;
  };

  // Private

  function insertOne(node, row, rowIdx, fields, fieldIdx) {
    var field      = fields[fieldIdx];
    var value      = row[fields[fieldIdx]];
    var isLeafNode = (fieldIdx + 1 == fields.length);

    // Insert Field

    if(!(field in values)) {
      values[field] = {};
    }

    // Update Field Count

    if(!(value in values[field])) {
      values[field][value] = 1;
    } else {
      values[field][value] += 1;
    }

    // Insert Group

    if(!(value in node)) {
      if(isLeafNode) {
        node[value] = [];
      } else {
        node[value] = {};
      }
    }

    // Terminate: Insert Row Index
    // Continue:  Recurse Into Field List

    if(isLeafNode) {
      node[value].push(rowIdx);
    } else {
      insert(node[value], row, rowIdx, fields, fieldIdx + 1);
    }
  };

  return _tree;
}
