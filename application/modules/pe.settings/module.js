'use strict';
angular.module('rc.prime.template', []);

angular.module('rc.prime.template').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    var templates = {
        name: 'common.prime.templates',
        url: '/prime/pe/templates',
        templateUrl: 'application/modules/pe.settings/pe.templates.html',
        data: {
            displayName: 'Toolbar Templates'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/pe.settings/controller.js']);
            }]
        }
    };
    $stateProvider.state(templates);

});