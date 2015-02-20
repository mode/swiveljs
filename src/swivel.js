function swivel(initData) {
  var path    = [];
  var aggs    = [];
  var filters = [];
  var tree    = swivel.tree();
  var data    = initData || [];

  // Return Object
  var _swivel = {
    all: all,
    group: group,
    pivot: pivot,
    filter: filter,
    config: config,
    concat: concat,
    aggregate: aggregate,
    count: count,
    countUnique: countUnique,
    sum: sum,
    average: average,
    median: median,
    stdDev: stdDev
  };

  // Public

  function concat(rows) {
    data = data.concat(rows);

    return this;
  };

  function config(config) {
    if(typeof config['fields'] === 'undefined') {
      var cFields = [];
    } else {
      var cFields = config['fields'];
    }

    if(typeof config['transforms'] === 'undefined') {
      var cTransforms = [];
    } else {
      var cTransforms = config['transforms'];
    }

    if(typeof config['aggregates'] === 'undefined') {
      var cAggregates = [];
    } else {
      var cAggregates = config['aggregates'];
    }

    for(var i = 0; i < cFields.length; i++) {
      var f = cFields[i];

      this[f['type']](f['name']);
    }

    for(var i = 0; i < cTransforms.length; i++) {
      var t = cTransforms[i];

      if(t['type'] == 'filter') {
        filter(t['test']);
      }
    }

    for(var i = 0; i < cAggregates.length; i++) {
      var a = cAggregates[i];

      aggregate(a['type'], a['field'], { 'as': a['as'] });
    }

    return this;
  };

  function group() {
    var fields = [].concat(swivel.args(arguments));

    for(var i = 0; i < fields.length; i++) {
      tree.field(fields[i]);
      path.push({'type': 'group', 'name': fields[i]});
    }

    return this;
  }

  function pivot() {
    var fields = [].concat(swivel.args(arguments));

    for(var i = 0; i < fields.length; i++) {
      tree.field(fields[i]);
      path.push({'type': 'pivot', 'name': fields[i]});
    }

    return this;
  };

  function filter(expr) {
    filters.push(Function("row", "return " + expr + ";"));

    return this;
  };

  function aggregate(type, field, opts) {
    if(typeof opts === 'undefined') {
      opts = {};
    }

    aggs.push({
      'as': opts['as'] || field,
      'callback': swivel.aggregate(type, field, opts)
    });

    return this;
  };

  function count(field, opts) {
    return aggregate.call(this, 'count', field, opts);
  };

  function countUnique(field, opts) {
    return aggregate.call(this, 'countUnique', field, opts);
  };

  function sum(field, opts) {
    return aggregate.call(this, 'sum', field, opts);
  };

  function average(field, opts) {
    return aggregate.call(this, 'average', field, opts);
  };

  function median(field, opts) {
    return aggregate.call(this, 'median', field, opts);
  };

  function stdDev(field, opts) {
    return aggregate.call(this, 'stdDev', field, opts);
  };

  function all() {
    insertAll();

    var result = {
      values: function(fieldName) {
        if(tree.isEmpty()) {
          return [];
        } else {
          return Object.keys(tree.getValues(fieldName));
        }
      }
    };

    // this isn't right, should be if the *first* field is a row

    if(tree.isEmpty()) {
      result['data'] = [];
    } else {
      if(path[0]['type'] == 'group') {
        result['data'] = visitRows(tree.getRoot(), 0);
      } else {
        result['data'] = visitColumn(tree.getRoot(), 0);
      }
    }

    return result;
  }

  // Private

  function insertAll() {
    for(var rowIdx = 0; rowIdx < data.length; rowIdx++) {
      var row = data[rowIdx];

      var included = true;
      for(var i = 0; i < filters.length; i++) {
        if(filters[i](row) == false) {
          included = false;
          break;
        }
      }

      if(included) {
        tree.insert(row, rowIdx);
      }
    }
  }

  function getPathFields() {
    var names = [];
    for(var i = 0; i < path.length; i++) {
      names.push(path[i]['name']);
    }
    return names;
  };

  function visitValues(node) {
    var nodeRows = [];
    for(var i = 0; i < node.length; i++) {
      nodeRows.push(data[node[i]]);
    }

    var values  = {};
    for(var i = 0; i < aggs.length; i++) {
      var agg = aggs[i];
      values[agg['as']] = agg['callback'](nodeRows);
    }

    return values;
  };

  function visitRows(node, fieldIdx) {
    var rows = [];

    var currFields   = [];
    var nextFieldIdx = fieldIdx;
    var fieldNames   = getPathFields();

    for(var i = fieldIdx; i < fieldNames.length; i++) {
      if(path[i]['type'] == 'group') {
        nextFieldIdx += 1;
        currFields.push(fieldNames[i]);
      } else {
        break;
      }
    }

    var nextField = path[nextFieldIdx];
    tree.eachBranch({}, node, currFields, 0, function(node, branch) {
      var row = {};
      swivel.merge(row, branch);

      // no more fields available
      if(nextFieldIdx == fieldNames.length) {
        swivel.merge(row, visitValues(node));
      } else if(nextField['type'] == 'pivot') {
        swivel.merge(row, visitColumn(node, nextFieldIdx));
      }

      rows.push(row);
    });

    return rows;
  };

  function visitColumn(node, fieldIdx) {
    var row = {};

    var nextFieldIdx = fieldIdx + 1;
    var fieldNames   = getPathFields();
    var nextField    = path[nextFieldIdx];

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

      } else if(nextField['type'] == 'group') {
        colValue[value] = visitRows(node, nextFieldIdx);
      } else if(nextField['type'] == 'pivot') {
        colValue[value] = visitColumn(node, nextFieldIdx);
      }

      swivel.merge(row, colValue);
    });

    return row;
  };


  return _swivel;
};
