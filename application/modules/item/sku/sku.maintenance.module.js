"use strict";
angular.module("rc.prime.sku", ["calculus.application"]);

angular
  .module("rc.prime.sku")
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    let skuPage = {
      name: "common.prime.itemMaintenance.sku",
      url: "item/:item_id/maintenance/sku",
      reload: true,
      params: {
        item_id: null,
        item: null
      },
      views: {
        abstract: true,
        "": { templateUrl: "application/modules/item/sku/sku.maintenance.html" }
      },
      resolve: {
        loadFiles: [
          "$ocLazyLoad",
          $ocLazyLoad => {
            return $ocLazyLoad.load([
              "application/modules/item/sku/sku.maintenance.controller.js"
            ]);
          }
        ]
      }
    };
    $stateProvider.state(skuPage);
    //New SKU
    let newSku = {
      name: "common.prime.itemMaintenance.sku.new",
      url: "/:skutype/:subtype/new",
      templateUrl: "application/modules/item/sku/new.sku.maintenance.html",
      reload: true,
      resolve: {
        loadFiles: [
          "$ocLazyLoad",
          $ocLazyLoad => {
            return $ocLazyLoad.load([
              "./application/modules/item/sku/clone/controller.js"
            ]);
          }
        ]
      }
    };
    $stateProvider.state(newSku);

    //Update SKU
    let updateSku = {
      name: "common.prime.itemMaintenance.sku.update",
      url: "/:id/:skutype/:subtype/update?:returnUrl?:navigateTo",
      templateUrl: "application/modules/item/sku/update.sku.maintenance.html",
      reload: true,
      resolve: {
        loadFiles: [
          "$ocLazyLoad",
          $ocLazyLoad => {
            return $ocLazyLoad.load([
              "./application/modules/item/sku/clone/controller.js"
            ]);
          }
        ]
      }
    };
    $stateProvider.state(updateSku);

  });
