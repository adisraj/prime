"user strict";
angular.module("rc.prime.corporatecontrol", ["rc.prime.entity", "common"]);

angular
  .module("rc.prime.corporatecontrol")
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    var orderhelptext = {
      name: "common.prime.corporatecontrol",
      url: "/reference/corporatecontrol",
      templateUrl: "application/modules/corporate.control/corporate.control.html",
      data: {
        displayName: "Order Help Text"
      },
      resolve: {
        loadFiles: [
          "$ocLazyLoad",
          function($ocLazyLoad) {
            return $ocLazyLoad.load([
              "./application/modules/corporate.control/corporate.control.controller.js"
            ]);
          }
        ]
      }
    };
    $stateProvider.state(orderhelptext);
  });
