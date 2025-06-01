'use strict';
angular.module('rc.prime.tag', []);

angular.module('rc.prime.tag').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var tag = {
        name: 'common.prime.tag',
        url: '/hangtag',
        templateUrl: 'application/modules/hangtag/hangtag.html',
        data: {
            displayName: 'Hang Tags'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/hangtag/controller.js', './application/modules/hangtag/panel.department.template.directive.js']);
            }]
        }
    };
    $stateProvider.state(tag);

});