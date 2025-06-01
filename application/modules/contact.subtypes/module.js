"use strict";
angular.module("rc.prime.contactsubtypes", []);

angular
  .module("rc.prime.contactsubtypes")
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    var contact_subtypes = {
      name: "common.prime.contactsubtypes",
      url: "/reference/contactsubtypes",
      templateUrl: "application/modules/contact.subtypes/contactsubtypes.html",
      data: {
        displayName: "Contact Sub Types"
      },
      resolve: {
        loadFiles: [
          "$ocLazyLoad",
          function($ocLazyLoad) {
            return $ocLazyLoad.load([
              "./application/modules/contact.subtypes/contactsubtypes.controller.js"
            ]);
          }
        ]
      }
    };
    $stateProvider.state(contact_subtypes);
  });
