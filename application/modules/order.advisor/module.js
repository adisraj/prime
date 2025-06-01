'use strict';
angular.module('rc.prime.orderadvisor', ['rc.prime.entity', 'common']);

angular.module('rc.prime.orderadvisor').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    // State navigation and its UI link for order advisor view module
    var orderadvisor = {
        name: 'common.prime.orderadvisor',
        url: '/maintenance/orderadvisors',
        templateUrl: 'application/modules/order.advisor/maintenance/view.html',
        data: {
            displayName: 'Order Advisors'
        },
        resolve: {
            // Lazy load type controller function, on navigating to the given state  
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load([
                    './application/modules/order.advisor/maintenance/controller.js',
                ]);
            }]
        }
    };
    $stateProvider.state(orderadvisor);

    // State navigation and its corresponding UI link to create new order advisor type
    var new_order_advisor = {
        name: 'common.prime.orderadvisor.new',
        url: '/new',
        templateUrl: 'application/modules/order.advisor/maintenance/new.html',
    };
    $stateProvider.state(new_order_advisor);

    // State navigation and its corresponding UI link to update existing order advisor type
    var update_order_advisor = {
        name: 'common.prime.orderadvisor.update',
        url: '/:id/update',
        templateUrl: 'application/modules/order.advisor/maintenance/update.html',
    };
    $stateProvider.state(update_order_advisor);

});