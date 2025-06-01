'use strict';
angular.module('rc.prime.reactivatesku', ['calculus.application']);
angular.module('rc.prime.reactivatesku').config(($stateProvider, $urlRouterProvider) => {
    $urlRouterProvider.otherwise("/login");

    let reactivate_sku_data = {
        name: 'common.prime.reactivatskus',
        url: '/sku/reactivate',
        templateUrl: 'application/modules/reactivate.skus/reactivate.sku.html',
        resolve: {
            loadMyFiles: [
              "$ocLazyLoad",
              function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  "application/modules/reactivate.skus/controller.js"
                ]);
              }
            ],
        }    
      }
    $stateProvider.state(reactivate_sku_data);

});