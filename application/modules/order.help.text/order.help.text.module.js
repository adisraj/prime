"user strict";
angular.module("rc.prime.orderhelptext", ["rc.prime.entity", "common"]);

angular
  .module("rc.prime.orderhelptext")
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    var orderhelptext = {
      name: "common.prime.orderhelptext",
      url: "/reference/orderhelptext",
      templateUrl: "application/modules/order.help.text/order.help.text.html",
      data: {
        displayName: "Order Help Text"
      },
      resolve: {
        loadFiles: [
          "$ocLazyLoad",
          function($ocLazyLoad) {
            return $ocLazyLoad.load([
              "./application/modules/order.help.text/order.help.text.controller.js"
            ]);
          }
        ]
      }
    };
    $stateProvider.state(orderhelptext);
  });
