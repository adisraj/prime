'use strict';
angular.module('rc.prime.pricingchoices', ['rc.prime.entity']);

angular.module('rc.prime.pricingchoices').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var pricing_choices = {
        name: 'common.prime.pricingchoices',
        url: '/reference/pricingchoices',
        templateUrl: 'application/modules/pricing.choices/pricing.choices.html',
        data: {
            displayName: 'pricing choices'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load(['./application/modules/pricing.choices/pricing.choices.controller.js']);
            }]
        }
    };
    $stateProvider.state(pricing_choices);

});