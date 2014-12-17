swivel.tree = function() {
  var length = 0;
  var root   = {};
  var values = {};
  var fields = [];

  var _tree = {
    field: field,
    insert: insert,
    isEmpty: isEmpty,
    getRoot: getRoot,
    getValues: getValues,
    eachValue: eachValue,
    eachBranch: eachBranch
  };

  // Public

  function field(name) {
    fields.push(name);
  };

  function isEmpty() {
    return length == 0;
  };

  function getRoot() {
    return root;
  };

  function getValues(fieldName) {
    return values[fieldName];
  };

  function insert(row, rowIdx) {
    length += 1;
    insertOne(root, row, rowIdx, fields, 0);
  };

  function eachValue(node, fieldIdx, callback) {
    var field     = fields[fieldIdx];
    var counts    = values[field];
    var valueKeys = Object.keys(counts);

    for(var v = 0; v < valueKeys.length; v++) {
      var valueKey = valueKeys[v];
      var childNode = node[valueKey];

      callback(childNode, valueKey);
    }
  };

  function eachBranch(branch, node, path, depth, callback) {
    if(depth == path.length) {
      return callback(node, branch);
    }

    var field     = path[depth];
    var fValues   = values[field];
    var valueKeys = Object.keys(fValues);

    // add to group and recurse
    for(var v = 0; v < valueKeys.length; v++) {
      var valueKey = valueKeys[v];
      var childNode = node[valueKey];

      if(typeof childNode !== "undefined") {
        branch[field] = valueKey;
        eachBranch(branch, childNode, path, depth + 1, callback);
        delete branch[field];
      }
    }
  };

  // Private

  function insertOne(node, row, rowIdx, path, depth) {
    var field      = path[depth];
    var value      = row[field];
    var isLeafNode = (depth + 1 == path.length);

    // Insert Field

    if(!(field in values)) {
      values[field] = {};
    }

    // Update Field Count

    if(!(value in values[field])) {
      values[field][value] = true;
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
      insertOne(node[value], row, rowIdx, path, depth + 1);
    }
  };

  return _tree;
}
