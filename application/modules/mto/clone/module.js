'use strict';
angular.module('rc.prime.mto.clone', ['calculus.application']);
angular.module('rc.prime.mto.clone').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    let ChoiceClone = {
        name: 'common.prime.mtooptions.mtochoices.clone',
        url: '/:id/clone',
        params: {
            id: null
        },
        views: {
            'clone': {
                templateUrl: 'application/modules/mto/clone/panel.clone.choice.html'
            }
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/mto/clone/controller.js']);
            }]
        }
    }
    $stateProvider.state(ChoiceClone);

    let MTOClone = {
        name: 'common.prime.mtooptions.clone',
        url: '/:id/clone',
        params: {
            id: null
        },
        views: {
            'clone': {
                templateUrl: 'application/modules/mto/clone/panel.clone.option.html',
            }
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/mto/clone/controller.js']);
            }]
        }
    }
    $stateProvider.state(MTOClone);

});