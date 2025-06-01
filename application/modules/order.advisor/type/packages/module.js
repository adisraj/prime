'use strict';
angular.module('rc.prime.orderadvisor.type.packages', ['rc.prime.entity', 'common']);

angular.module('rc.prime.orderadvisor.type.packages').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    // State navigation and its UI link for order advisor type view module
    var orderadvisorpackage = {
        name: 'common.prime.orderadvisortypepackages',
        url: '/configure/orderadvisor/type/:type_id/packages',
        templateUrl: 'application/modules/order.advisor/type/packages/packages.html',
        resolve: {
            // Lazy load type controller function, on navigating to the given state  
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load([
                    './application/modules/order.advisor/type/packages/controller.js',
                ]);
            }]
        }
    };
    $stateProvider.state(orderadvisorpackage);

});