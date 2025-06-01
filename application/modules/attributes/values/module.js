"use strict";
angular.module("rc.prime.attribute.values", [
  "rc.prime.entity",
  "rc.prime.codes"
]);

angular
  .module("rc.prime.attribute.values")
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    //View all attribute values
    var attribute_values_view = {
      name: "common.prime.attributes.values",
      url: "/:attribute_id/values",
      params: {
        attribute_id: null
      },
      views: {
        values: {
          templateUrl: "application/modules/attributes/values/values.html"
        }
      },
      resolve: {
        loadMyFiles: [
          "$ocLazyLoad",
          function($ocLazyLoad) {
            return $ocLazyLoad.load([
              "./application/modules/attributes/values/controller.js"
            ]);
          }
        ]
      }
    };
    $stateProvider.state(attribute_values_view);

    //Add new attribute value
    var new_attribute_value = {
      name: "common.prime.attributes.values.new",
      url: "/new",
      templateUrl: "application/modules/attributes/values/value.new.html"
    };
    $stateProvider.state(new_attribute_value);

    //update attribute value
    var update_attribute_value = {
      name: "common.prime.attributes.values.update",
      url: "/:id/update",
      params: {
        id: null
      },
      templateUrl: "application/modules/attributes/values/value.update.html"
    };
    $stateProvider.state(update_attribute_value);
  });
