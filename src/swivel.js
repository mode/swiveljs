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
    sum: sum,
    count: count,
    countUnique: countUnique,
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

    var allFieldValues = function(fieldName) {
      if(tree.isEmpty()) {
        return [];
      } else {
        return Object.keys(tree.getValues(fieldName));
      }
    };

    var traverseFields = function(fieldType, tOrder, callback) {
      var stack = [];

      if(typeof(fieldType) === 'undefined')
        fieldType = 'all'

      if(typeof(tOrder) === 'undefined')
        tOrder = 'depth'

      var initStack = function() {
        stack.push({
          depth: -1, path: [],
          node: tree.getRoot()
        });
      }

      var fieldValues = {}
      for(var i = 0; i < path.length; i++) {
        var fieldName = path[i].name;
        fieldValues[fieldName] = allFieldValues(fieldName).sort();
      }

      initStack();
      while(stack.length > 0) {
        if(tOrder === 'depth') {
          var currElem = stack.pop();
        } else if(tOrder === 'breadth') {
          var currElem = stack.shift();
        } else {
          throw "Unknown Traversal Order " + tOrder
        }

        var currNode  = currElem.node;
        var currPath  = currElem.path;
        var currDepth = currElem.depth;

        var pIndex = currDepth + 1;
        if(pIndex >= path.length) {
          callback(currPath, currNode);
        } else {
          var fValues = fieldValues[path[pIndex].name];

          for(var j = 0; j < fValues.length; j++) {
            var fieldValue = fValues[j];
            var nextPath = currPath.slice();
            if(fieldType === 'all' || path[pIndex].type === fieldType) {
              nextPath.push(fieldValue);
            }

            if(!(fieldValue in currNode)) {
              callback(nextPath, [])
            } else {
              stack.push({ depth: pIndex, path: nextPath, node: currNode[fieldValue] });
            }
          }
        }
      }
    }

    var result = {
      values: function(fieldName) {
        if(tree.isEmpty()) {
          return [];
        } else {
          return Object.keys(tree.getValues(fieldName));
        }
      },

      pivotFieldValues: function() {
        var fieldValues = [];

        for(var i = 0; i < path.length; i++) {
          if(path[i].type === 'pivot')
            fieldValues[i] = this.values(path[i].name).sort();
        }

        return fieldValues;
      },

      /*
       * @param fType  Field Type either 'group', 'pivot', or 'all'
       * @param tOrder Traversal order either 'depth' or 'breadth'
       */
      pathValues: function(fieldType, tOrder) {
        var pathValues = {};

        traverseFields(fieldType, tOrder, function(pathKey, values) {
          if(pathKey in pathValues) {
            pathValues[pathKey].values.concat(values);
          } else {
            pathValues[pathKey] = { path: pathKey, values: values };
          }
        });

        return pathValues;
      },

      pathCounts: function(fieldType, tOrder) {
        var pathCounts = { depth: -1, name: 'root', children: {} };

        traverseFields(fieldType, tOrder, function(pathKey, values) {
          var currNode = pathCounts;

          for(var i = 0; i < pathKey.length; i++) {
            var pathVal = pathKey[i];
            if(!(pathVal in currNode.children)) {
              currNode.children[pathVal] = { depth: i, name: pathVal, children: {} };
            }

            currNode = currNode.children[pathVal];
          }
        });

        return pathCounts;
      },

      prefixValues: function(fieldType, tOrder) {
        var prefixVals = {};

        // build a prefix trie with counts here

        traverseFields(fieldType, tOrder, function(pathKey, values) {
          for(var i = 0; i < pathKey.length; i++) {
            var prefixLen = i + 1;
            var prefixKey = pathKey.slice(0, prefixLen);

            if(!(prefixLen in prefixVals)) {
              prefixVals[prefixLen] = {};
            }

            if(prefixKey in prefixVals) {
              prefixVals[prefixLen][prefixKey].values.concat(values);
            } else {
              prefixVals[prefixLen][prefixKey] = { prefix: prefixKey, values: values };
            }
          }
        });

        for(prefixLen in prefixVals) {
          for(prefixKey in prefixVals[prefixLen]) {
            var values = prefixVals[prefixLen][prefixKey].values;
            prefixVals[prefixLen][prefixKey].values = swivel.uniq(values);
          }
        }

        return prefixVals;
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

    console.log(tree.getRoot())
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

//Export to CommonJS/Node format
if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = swivel;
  }
  exports.swivel = swivel;
} else if (typeof define === 'function' && define.amd) {
  define('swivel', function() {
    return swivel;
  });
} else {
  // no exports so attach to global
  this['swivel'] = swivel;
}
