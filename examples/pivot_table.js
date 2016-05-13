var app = angular.module("PivotTable", []);

app.directive('fieldItem', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.draggable({
        helper: "clone",
        revert: "invalid"
      });
    }
  }
});

app.directive('fieldList', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.droppable({
        accept: '.field-item',
        drop: function(event, ui) {
          var groupName = attrs['fieldList'];

          var draggable = angular.element(ui.draggable)
          var draggableId = draggable.attr('id').split('-');
          var fieldName = draggableId[draggableId.length - 1];

          scope.selectField(fieldName, groupName);
        }
      });
    }
  }
});

app.controller("PivotTableController", ['$scope', function($scope) {
  $scope.data;
  $scope.fields = [
    {
      name: 'day',
      label: 'Day',
      type: 'datetime',
      selected: true,
      selection: {
        group: 'rows'
      }
    },
    {
      name: 'user_id',
      label: 'User ID',
      type: 'number',
      selected: false,
      selection: {}
    },
    {
      name: 'device',
      label: 'Device',
      type: 'string',
      selected: false,
      selection: {}
    },
    {
      name: 'location',
      label: 'Location',
      type: 'string',
      selected: false,
      selection: {}
    },
    {
      name: 'event_name',
      label: 'Event Name',
      type: 'string',
      selected: false,
      selection: {}
    },
    {
      name: 'events',
      label: 'Events',
      type: 'number',
      selected: true,
      selection: {
        group: 'values',
        valueFn: 'sum'
      }
    }
  ]

  var fieldsForGroup = function(groupName) {
    var filters = [];

    angular.forEach($scope.fields, function(field) {
      if(field.selection && field.selection.group == groupName) {
        filters.push(field);
      }
    });

    return filters;
  };

  $scope.selectField = function(fieldName, groupName) {
    $scope.$apply(function() {
      angular.forEach($scope.fields, function(field) {
        if(field.name == fieldName) {
          field.selected = true;
          field.selection = { group: groupName };
        }
      });

      renderTable();
    });
  }

  var dateFormat = d3.time.format("%Y-%m-%d");
  var dateParser = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;

  var renderTable = function() {
    var filters = fieldsForGroup('filters');
    var columns = fieldsForGroup('columns');
    var rows    = fieldsForGroup('rows');
    var values  = fieldsForGroup('values');

    var pivoted = swivel($scope.data);

    angular.forEach(rows, function(field) {
      pivoted = pivoted.group(field.name);
    });

    angular.forEach(columns, function(field) {
      pivoted = pivoted.pivot(field.name);
    });

    angular.forEach(values, function(field) {
      pivoted = pivoted.aggregate('sum', field.name);
    });

    pivoted = pivoted.all();

    console.log(pivoted);

    var sortedData = pivoted.data.sort(function(r1, r2) {
      var v1 = r1[$scope.rows];
      var v2 = r2[$scope.rows];

      if ( v1 < v2 ) {
        return -1;
      } else if ( v1 > v2 ) {
        return 1;
      } else {
        return 0;
      }
    });

    // pivoted.eachGroupValue(function(stack) {
    //   console.log("GOT A STACK!");
    // });

    pivoted.eachPivotValue(function(pathKey, values) {
      console.log(pathKey, values);
    });

    var columnValues = pivoted.values($scope.columns).sort();

    d3.select("#pivot-container table").remove(); // clean out old table

    var table = d3.select("#pivot-container").append("table").attr('class', 'table'),
      thead = table.append("thead"),
      tbody = table.append("tbody");

    // thead.append("tr")
    //   .selectAll("td")
    //     .data(function() {
    //       var columns = [];
    //
    //       for(var i = 0; i < rows.length; i++) {
    //         columns.push(rows[i]);
    //       }
    //
    //       if(columns.length == 0) {
    //         for(var i = 0; i < values.length; i++) {
    //           columns.push(values[i]);
    //         }
    //       } else {    //
    //         for(var i = 0; i < columnValues.length; i++) {
    //           columns.push(columnValues[i]);
    //         }
    //       }
    //
    //       return columns;
    //     }).enter().append("td")
    //   .text(function(column){ return column.name; });
    //
    // tbody.selectAll("tr")
    //   .data(sortedData)
    //   .enter().append("tr")
    // .selectAll("td")
    //   .data(function(row) {
    //     var values = [row[$scope.rows]];
    //
    //     for(var i = 0; i < columnValues.length; i++) {
    //       values.push(row[columnValues[i]]);
    //     }
    //     return values;
    //   }).enter().append("td")
    // .text(function(row){ return row; })
  }

  datasets.events(function(dataset) {
    $scope.data = dataset;
    renderTable();
  });
}]);
