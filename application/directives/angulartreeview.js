(function(angular) {
  "use strict";
  angular.module("angularTreeview", []).directive("treeModel", [
    "$compile",
    function($compile) {
      return {
        restrict: "A",
        link: function(scope, element, attrs) {
          var treeId = attrs.treeId;
          var treeModel = attrs.treeModel;
          var nodeId = attrs.nodeId;
          var nodeLabel = attrs.nodeLabel;
          var nodeChildren = attrs.nodeChildren;
          var searchQuery = attrs.searchQuery;
          var template =
            "<ul>" +
            '<li data-ng-repeat="node in ' +
            treeModel + "| orderBy:'short_description'" +
            '">' +
            '<i class="collapsed" data-ng-class="{nopointer: !node.' +
            nodeChildren +
            '.length}"' +
            'data-ng-show="!node.expanded && !node.fileicon" data-ng-click="' +
            treeId +
            '.selectNodeHead(node)"></i>' +
            '<i class="expanded" data-ng-class="{nopointer: !node.' +
            nodeChildren +
            '.length}"' +
            '" data-ng-show="node.expanded && !node.fileicon" data-ng-click="' +
            treeId +
            '.selectNodeHead(node)"></i>' +
            '<i class="normal" data-ng-show="node.fileicon"></i> ' +
            "<span " +
            ' title="{{node.' +
            nodeLabel +
            '}}" data-ng-class="{selected: node.selected, disabled: node.isDisabled}" ng-dblclick="' +
            treeId +
            '.selectNodeLabel(node,1)" single-click="' +
            treeId +
            '.selectNodeLabel(node,0)">{{node.' +
            nodeLabel +
            " | truncate : 50}} </span>" +
            '<div data-ng-show="node.expanded" data-tree-id="' +
            treeId +
            '" data-tree-model="node.' +
            nodeChildren +
            '" data-node-id=' +
            nodeId +
            " data-node-label=" +
            nodeLabel +
            " data-node-children=" +
            nodeChildren +
            " data-search-query=" +
            searchQuery +
            "></div>" +
            "</li>" +
            "</ul>";
          if (treeId && treeModel) {
            if (attrs.angularTreeview) {
              scope[treeId] = scope[treeId] || {};
              scope[treeId].doubleClick = false;
              scope[treeId].selectNodeHead =
                scope[treeId].selectNodeHead ||
                function(selectedNode) {
                  if (selectedNode[nodeChildren] !== undefined) {
                    selectedNode.expanded = !selectedNode.expanded;
                  }
                };
              scope[treeId].selectNodeLabel =
                scope[treeId].selectNodeLabel ||
                function(selectedNode, flag) {
                  if (flag === 1) {
                    scope[treeId].doubleClick = true;
                  } else {
                    scope[treeId].doubleClick = false;
                  }
                  if (
                    scope[treeId].currentNode &&
                    scope[treeId].currentNode.selected
                  ) {
                    scope[treeId].currentNode.selected = undefined;
                  }
                  selectedNode.selected = "selected";
                  scope[treeId].currentNode = selectedNode;
                };
            }
            element.html("").append($compile(template)(scope));
          }
        }
      };
    }
  ]);
})(angular);
