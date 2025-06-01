'use strict';
angular.module('rc.prime.company.department', []);

angular.module('rc.prime.company.department').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var company_view = {
        name: 'common.prime.company.department',
        templateUrl: 'application/modules/company/department/company_department.html',
        url: '/:company_id/department',
        data: {
            displayName: 'Company Departments',
            requireLogin: true
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    './application/modules/company/department/company.department.controller.js',
                    './application/templates/address.contacts.controller.js',
                    './application/templates/address.controller.js',
                    './application/templates/contacts.controller.js'
                ]);
            }]
        }
    };
    $stateProvider.state(company_view);

});