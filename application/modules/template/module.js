'use strict';
angular.module('rc.prime.templatesku', []);

angular.module('rc.prime.templatesku').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    var template = {
        name: 'common.prime.templatesku',
        url: '/templates',
        templateUrl: 'application/modules/template/templates.html',
        data: {
            displayName: 'Template'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/template/controller.js']);
            }]
        }
    };
    $stateProvider.state(template);

});