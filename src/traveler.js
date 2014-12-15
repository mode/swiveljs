//
// this won't work because data and tree can be instantiated at different times
//
swivel.traveler = function(tree, map) {
  var _data = [];

  // Return Object
  var _traveler = {
    data: data,
    select: select,
    pivot: pivot,
    where: where,
    all: all,
  };

  // Public

  function data(rows) {
    _data = _data.concat(rows);

    return this;
  };

  function select() {
    map.select.apply(map, arguments);

    return this;
  };

  function pivot() {
    map.pivot.apply(map, arguments);

    return this;
  };

  function where() {
    map.where.apply(map, arguments);

    return this;
  };

  function all() {
    tree.insert(_data);

    if(map.hasRows()) {
      return visitRows(tree.getRoot(), 0);
    } else {
      return visitColumn(tree.getRoot(), 0);
    }
  }

  // Private

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
        swivel.merge(row, visitValues(node));
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
         var values = visitValues(node);

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

  function visitValues(node) {
    var rows = [];
    for(var i = 0; i < node.length; i++) {
      rows.push(_data[node[i]]);
    }

    var values     = {};
    var selections = map.getValues();
    var aliases    = Object.keys(selections);

    for(var i = 0; i < aliases.length; i++) {
      var alias = aliases[i];
      var aggFn = selections[alias];

      values[alias] = aggFn(rows);
    }

    return values;
  };

  return _traveler;
};
