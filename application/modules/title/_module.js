'use strict';
angular.module('rc.prime.title', ['rc.prime.entity']);

angular.module('rc.prime.title').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var title_view = {
        name: 'common.prime.title',
        url: '/reference/title',
        templateUrl: 'application/modules/title/title.html',
        data: {
            displayName: 'Titles'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load(['./application/modules/title/title.controller.js']);
            }]
        }
    };
    $stateProvider.state(title_view);

});