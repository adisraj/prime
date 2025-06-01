'use strict';
angular.module('rc.prime.import', ['ngFileUpload']);
angular.module('rc.prime.import').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    var imports = {
        name: 'common.prime.import',
        url: '/import',
        templateUrl: 'application/modules/import/import.html',
        data: {
            displayName: 'Import'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/import/_controller.js']);
            }]
        }
    };
    $stateProvider.state(imports);
});