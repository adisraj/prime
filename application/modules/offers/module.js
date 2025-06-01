'use strict';

angular
    .module('rc.prime.offers', ['calculus.application']);

angular
    .module('rc.prime.offers')
    .config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/login");

        let offer = {
            name: 'common.prime.offers',
            url: '/product/offers',
            templateUrl: 'application/modules/offers/offers.html',
            resolve: {
                loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                    return $ocLazyLoad.load(['./application/modules/offers/controller.js']);
                }]
            }
        };
        $stateProvider.state(offer);

        let newOffer = {
            name: 'common.prime.offers.new',
            url: '/new',
            templateUrl: 'application/modules/offers/offer.new.html'
        };
        $stateProvider.state(newOffer);


        let updateOffer = {
            name: 'common.prime.offers.update',
            url: '/:id/update',
            templateUrl: 'application/modules/offers/offer.update.html'
        };
        $stateProvider.state(updateOffer);

        let deleteOffer = {
            name: 'common.prime.offers.delete',
            url: '/:id/delete',
            templateUrl: 'application/modules/offers/offer.delete.html'
        };
        $stateProvider.state(deleteOffer);
    });