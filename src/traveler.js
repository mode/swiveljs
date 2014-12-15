//
// this won't work because data and tree can be instantiated at different times
//
swivel.traveler = function(tree, map) {
  var rows = [];
  var wheres = [];

  // Return Object
  var _traveler = {
    select: select,
    pivots: pivots,
    data: data,
    where: where,
    all: all,
  };

  // Public

  function select() {
    map.select.apply(map, arguments);

    return this;
  };

  function pivots() {
    map.pivots.apply(map, arguments);

    return this;
  };


  function data(newRows) {
    rows = rows.concat(newRows);

    return this;
  };

  function where(whereFn) {
    wheres.push(whereFn);

    return this;
  };

  function all() {
    insertAll();

    if(map.hasRows()) {
      return visitRows(tree.getRoot(), 0);
    } else {
      return visitColumn(tree.getRoot(), 0);
    }
  }

  // Private

  function insertAll() {
    for(var rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      var row = rows[rowIdx];

      var included = true;
      for(var i = 0; i < wheres.length; i++) {
        if(wheres[i](row) == false) {
          included = false;
          break;
        }
      }

      if(included) {
        tree.insert(row, rowIdx);
      }
    }
  }

  function visitRows(node, fieldIdx) {
    var rows = [];

    var currFields   = [];
    var nextFieldIdx = fieldIdx;
    var fieldNames   = map.getFieldNames();

    for(var i = fieldIdx; i < fieldNames.length; i++) {
      if(map.getFieldByIndex(i).isRow()) {
        nextFieldIdx += 1;
        currFields.push(fieldNames[i]);
      } else {
        break;
      }
    }

    var nextField = map.getFieldByIndex(nextFieldIdx);
    tree.eachGroup({}, node, currFields, 0, function(node, branch) {
      var row = {};
      $.extend(row, branch);

      // no more fields available
      if(nextFieldIdx == fieldNames.length) {
        swivel.merge(row, aggregateValues(node));
      } else if(nextField.isColumn()) {
        swivel.merge(row, visitColumn(node, nextFieldIdx));
      }

      rows.push(row);
    });

    return rows;
  };

  function visitColumn(node, fieldIdx) {
    var row = {};

    var nextFieldIdx = fieldIdx + 1;
    var fieldNames   = map.getFieldNames();
    var nextField    = map.getFieldByIndex(nextFieldIdx);

    tree.eachValue(node, fieldIdx, function(node, value) {
      var colValue = {};

      if(typeof(node) === 'undefined') { // No branch at this value
        colValue[value] = null;
      } else if(nextFieldIdx == fieldNames.length) { // No more fields
         var values = aggregateValues(node);

        // Lift single values up to the higher level (make optional)
        var valueKeys = Object.keys(values);
        if(valueKeys.length == 1) {
          colValue[value] = values[valueKeys[0]];
        } else {
          colValue[value] = values;
        }

      } else if(nextField.isRow()) {
        colValue[value] = visitRows(node, nextFieldIdx);
      } else if(nextField.isColumn()) {
        colValue[value] = visitColumn(node, nextFieldIdx);
      }

      swivel.merge(row, colValue);
    });

    return row;
  };

  function aggregateValues(node) {
    var nodeRows = [];
    for(var i = 0; i < node.length; i++) {
      nodeRows.push(rows[node[i]]);
    }

    var values     = {};
    var selections = map.getValues();
    var aliases    = Object.keys(selections);

    for(var i = 0; i < aliases.length; i++) {
      var alias = aliases[i];
      var aggFn = selections[alias];

      values[alias] = aggFn(nodeRows);
    }

    return values;
  };

  return _traveler;
};
