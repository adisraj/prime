'use strict';
angular.module('rc.prime.company.associate', ['rc.prime.individual', 'rc.prime.title']);

angular.module('rc.prime.company.associate').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var company_associate = {
        name: 'common.prime.company.department.associate',
        templateUrl: 'application/modules/company/associate/company_associate.html',
        url: '/:department_id/associates',
        data: {
            displayName: 'Company',
            requireLogin: true
        },
        params: {
            company_id: null,
            department_id: null
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    './application/modules/company/associate/company.associate.controller.js',
                    './application/templates/address.contacts.controller.js',
                    './application/templates/address.controller.js',
                    './application/templates/contacts.controller.js'
                ]);
            }]
        }
    };
    $stateProvider.state(company_associate);

});