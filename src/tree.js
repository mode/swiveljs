swivel.tree = function(fields) {
  var root   = {};
  var values = {};

  var _tree = {
    getRoot: getRoot,
    insert: insert,
    eachGroup: eachGroup,
  };

  // Public
  function getRoot() {
    return root;
  };

  function insert(rows) {
    for(var rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      insertOne(root, rows[rowIdx], rowIdx, fields, 0);
    }

    return this;
  };

  function eachGroup(branch, node, fields, fieldIdx, callback) {
    if(fieldIdx == fields.length) {
      return callback(node, branch);
    }

    var field     = fields[fieldIdx];
    var counts    = values[field];
    var valueKeys = Object.keys(counts);

    // add to group and recurse
    for(var v = 0; v < valueKeys.length; v++) {
      var valueKey = valueKeys[v];
      var childNode = node[valueKey];

      if(typeof childNode !== "undefined") {
        branch[field] = valueKey;
        eachGroup(branch, childNode, fields, fieldIdx + 1, callback);
        delete branch[field];
      }
    }
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
      insertOne(node[value], row, rowIdx, fields, fieldIdx + 1);
    }
  };

  return _tree;
}