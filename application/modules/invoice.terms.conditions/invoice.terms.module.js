"user strict";
angular.module("rc.prime.invoicetermsandconditions", ["rc.prime.entity", "common"]);

angular
  .module("rc.prime.invoicetermsandconditions")
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    var invoicetermsandconditions = {
      name: "common.prime.invoicetermsandconditions",
      url: "/reference/invoicetermsandconditions",
      templateUrl: "application/modules/invoice.terms.conditions/invoice.terms.condition.html",
      data: {
        displayName: "Invoice terms & conditions"
      },
      resolve: {
        loadFiles: [
          "$ocLazyLoad",
          function($ocLazyLoad) {
            return $ocLazyLoad.load([
              "./application/modules/invoice.terms.conditions/invoice.terms.condition.js"
            ]);
          }
        ]
      }
    };
    $stateProvider.state(invoicetermsandconditions);
  });
