'use strict';
angular.module('rc.prime.financingchoices', []);

angular.module('rc.prime.financingchoices').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var financing_choices_instance = {
        name: 'common.prime.financingchoices',
        url: '/reference/financingchoices',
        templateUrl: 'application/modules/financingchoices/financingchoices.html',
        data: {
            displayName: 'Financing Choices'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load(['./application/modules/financingchoices/financingchoices.controller.js']);
            }]
        }
    };
    $stateProvider.state(financing_choices_instance);
});