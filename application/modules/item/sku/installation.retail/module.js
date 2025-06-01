"use strict";
angular.module("rc.prime.sku.installation.retail", ["calculus.application"]);
angular
  .module("rc.prime.sku.installation.retail")
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    let SKUInstallationRetail = {
      name: "common.prime.itemMaintenance.sku.installation",
      url: "/:id/installation/retail",
      params: {
        id: null
      },
      views: {
        installation_retail: {
          templateUrl:
            "application/modules/item/sku/installation.retail/panel.installation.retail.html"
        }
      },
      resolve: {
        loadFiles: [
          "$ocLazyLoad",
          $ocLazyLoad => {
            return $ocLazyLoad.load([
              "./application/modules/item/sku/installation.retail/controller.js"
            ]);
          }
        ]
      }
    };
    $stateProvider.state(SKUInstallationRetail);
  });
