"use strict";
angular.module("rc.prime.hierarchy", ["rc.prime.entity"]);

angular
  .module("rc.prime.hierarchy")
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var hierarchy = {
      name: "common.prime.hierarchy",
      url: "/hierarchy",
      templateUrl: "application/modules/hierarchy/hierarchy.html",
      params: {
        create: null
      },
      data: {
        displayName: "Hierarchy"
      },
      resolve: {
        loadFiles: [
          "$ocLazyLoad",
          function($ocLazyLoad) {
            return $ocLazyLoad.load([
              "./application/modules/hierarchy/hierarchy.controller.js"
            ]);
          }
        ]
      }
    };
    $stateProvider.state(hierarchy);

    //Add new attribute ui
    var new_hierarchy = {
      name: "common.prime.hierarchy.new",
      url: "/new",
      views: {
        operations: {
          templateUrl: "application/modules/hierarchy/hierarchy.new.html"
        }
      }
    };
    $stateProvider.state(new_hierarchy);

    //update attribute
    var update_hierarchy = {
      name: "common.prime.hierarchy.update",
      url: "/:id/update",
      params: {
        id: null
      },
      views: {
        operations: {
          templateUrl: "application/modules/hierarchy/hierarchy.update.html"
        }
      }
    };
    $stateProvider.state(update_hierarchy);
  });
