'use strict';
angular.module('rc.prime.codes', ['rc.prime.entity']);

angular.module('rc.prime.codes').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    var codes = {
        name: 'common.prime.codelist',
        url: '/reference/codelist',
        templateUrl: 'application/modules/codelist//codelist.html',
        data: {
            displayName: 'Codes'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load(['./application/modules/codelist/codelist.controller.js']);
            }]
        }
    };
    $stateProvider.state(codes);

});