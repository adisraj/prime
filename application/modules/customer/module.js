'use strict';
angular.module('rc.prime.customer', []);

angular.module('rc.prime.customer').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    var customer = {
        name: 'common.prime.customer',
        url: '/customers',
        templateUrl: 'application/modules/customer/customers.html',
        data: {
            displayName: 'Customer'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/customer/controller.js']);
            }]
        }
    };
    $stateProvider.state(customer);

});