'use strict';

angular
    .module('rc.prime.benefits', ['calculus.application']);

angular
    .module('rc.prime.benefits')
    .config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/login");

        let benefits = {
            name: 'common.prime.benefits',
            url: '/product/offers/:id/benefits',
            templateUrl: 'application/modules/offers/benefits/benefits.html',
            resolve: {
                loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                    return $ocLazyLoad.load(['./application/modules/offers/benefits/controller.js']);
                }]
            }
        };
        $stateProvider.state(benefits);

        let new_benefit = {
            name: 'common.prime.benefits.new',
            url: '/new',
            templateUrl: 'application/modules/offers/benefits/benefit.new.html'
        };
        $stateProvider.state(new_benefit);

        let update_benefit = {
            name: 'common.prime.benefits.update',
            url: '/:benefit_id/update',
            templateUrl: 'application/modules/offers/benefits/benefit.update.html'
        };
        $stateProvider.state(update_benefit);

        let delete_benefit = {
            name: 'common.prime.benefits.delete',
            url: '/:benefit_id/delete',
            templateUrl: 'application/modules/offers/benefits/benefit.delete.html'
        };
        $stateProvider.state(delete_benefit);

    });