'use strict';
angular.module('rc.prime.interface', ['calculus.application']);
angular.module('rc.prime.interface').config(($stateProvider, $urlRouterProvider) => {
    $urlRouterProvider.otherwise("/login");

    let resync_sku_data = {
        name: 'common.prime.interface',
        url: '/interface/sku/resync',
        templateUrl: 'application/modules/AS400.interfaces/resync.interfaces.html',
        resolve: {
            loadMyFiles: [
              "$ocLazyLoad",
              function($ocLazyLoad) {
                return $ocLazyLoad.load([
                  "application/modules/AS400.interfaces/controller.js"
                ]);
              }
            ],
        }    
      }
    $stateProvider.state(resync_sku_data);

});