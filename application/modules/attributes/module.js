"use strict";
angular.module("rc.prime.attributes", ["rc.prime.entity", "rc.prime.codes"]);

angular
  .module("rc.prime.attributes")
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    //View all attributes
    var attribute_view = {
      name: "common.prime.attributes",
      url: "/attributes",
      templateUrl: "application/modules/attributes/attributes.html",
      resolve: {
        loadMyFiles: [
          "$ocLazyLoad",
          function($ocLazyLoad) {
            return $ocLazyLoad.load([
              "application/modules/attributes/controller.js"
            ]);
          }
        ],
          }
    };
    $stateProvider.state(attribute_view);

    //Add new attribute ui
    var new_attribute = {
      name: "common.prime.attributes.new",
      url: "/new",
      views: {
        operations: {
          templateUrl: "application/modules/attributes/attribute.new.html"
        }
      }
    };
    $stateProvider.state(new_attribute);

    //update attribute
    var update_attribute = {
      name: "common.prime.attributes.update",
      url: "/:id/update",
      params: {
        id: null
      },
      views: {
        operations: {
          templateUrl: "application/modules/attributes/attribute.update.html"
        }
      }
    };
    $stateProvider.state(update_attribute);
  });
