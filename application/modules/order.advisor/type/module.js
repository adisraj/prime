'use strict';
angular.module('rc.prime.orderadvisor.type', ['rc.prime.entity', 'common']);

angular.module('rc.prime.orderadvisor.type').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    // State navigation and its UI link for order advisor type view module
    var orderadvisor = {
        name: 'common.prime.orderadvisortype',
        url: '/configure/orderadvisor/type',
        templateUrl: 'application/modules/order.advisor/type/view.html',
        resolve: {
            // Lazy load type controller function, on navigating to the given state  
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load([
                    './application/modules/order.advisor/type/controller.js',
                ]);
            }]
        }
    };
    $stateProvider.state(orderadvisor);

    // State navigation and its corresponding UI link to create new order advisor type
    var new_order_advisor_type = {
        name: 'common.prime.orderadvisortype.new',
        url: '/new',
        templateUrl: 'application/modules/order.advisor/type/panel.new.html',
    };
    $stateProvider.state(new_order_advisor_type);

    // State navigation and its corresponding UI link to update existing order advisor type
    var update_order_advisor_type = {
        name: 'common.prime.orderadvisortype.update',
        url: '/:id/update',
        templateUrl: 'application/modules/order.advisor/type/panel.update.html',
    };
    $stateProvider.state(update_order_advisor_type);

});