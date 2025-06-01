'use strict';
angular.module('rc.prime.item.function', ['calculus.application']);
angular.module('rc.prime.item.function').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    let new_item = {
        name: 'common.prime.itemMaintenance.new',
        url: ':type/new',
        views: {
            '': {
                templateUrl: 'application/modules/item/maintenance/new.item.html'
            }
        },
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
    }
    $stateProvider.state(new_item);

    let update_item = {
        name: 'common.prime.itemMaintenance.update',
        url: ':type/:id/update',
        views: {
            '': {
                templateUrl: 'application/modules/item/maintenance/update.item.html'
            }
        },
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
    }
    $stateProvider.state(update_item);

});
