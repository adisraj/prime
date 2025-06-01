"use strict";
angular.module("rc.prime.sku.inventory", ["calculus.application"]);

angular
  .module("rc.prime.sku.inventory")
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    //Update SKU
    let skuInventory = {
      name: "common.prime.itemMaintenance.sku.skuInventory",
      url: "/:id/inventory?:previous_state?:request_id?",
      views: {
        inventory: {
          templateUrl:
            "application/modules/item/sku/inventory-availability/panel.sku.availability.as400.form.html"
        }
      }
    };
    $stateProvider.state(skuInventory);
  });
