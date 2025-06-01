'use strict';
angular.module('rc.prime.company', []);

angular.module('rc.prime.company').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var company_view = {
        name: 'common.prime.company',
        templateUrl: 'application/modules/company/company.html',
        url: '/reference/company',
        data: {
            displayName: 'Company',
            requireLogin: true
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    './application/modules/company/company.controller.js',
                    './application/templates/address.contacts.controller.js',
                    './application/templates/address.controller.js',
                    './application/templates/contacts.controller.js'
                ]);
            }]
        }
    };
    $stateProvider.state(company_view);

});