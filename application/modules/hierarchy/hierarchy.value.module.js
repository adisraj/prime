"use strict";
angular.module("rc.prime.hierarchy.value", []);

angular
  .module("rc.prime.hierarchy.value")
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var hierarchy_value_view = {
      name: "common.prime.hierarchy.value",
      url: "/:hierarchy_id/values",
      views: {
        values: {
          templateUrl: "application/modules/hierarchy/hierarchy_values.html"
        }
      },
      data: {
        displayName: "Hierarchy Values"
      },
      params: {
        hierarchy_id: null
      },
      resolve: {
        loadFiles: [
          "$ocLazyLoad",
          function($ocLazyLoad) {
            return $ocLazyLoad.load([
              "./application/modules/hierarchy/hierarchy.value.controller.js"
            ]);
          }
        ]
      }
    };
    $stateProvider.state(hierarchy_value_view);
  });
