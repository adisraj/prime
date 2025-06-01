'use strict';
angular.module('rc.prime.mto.choice', ['rc.prime.entity', 'rc.prime.codes', 'calculus.application']);

angular.module('rc.prime.mto.choice').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var MTOChoice = {
        name: 'common.prime.mtooptions.mtochoices',
        url: '/:mto_id/choice',
        params: {
            create: null,
            mto_id: null
        },
        templateUrl: 'application/modules/mto/choice/mto.choice.html',
        data: {
            displayName: 'MTO Choice'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['application/modules/mto/choice/mto.choice.controller.js']);
            }]
        }
    };
    $stateProvider.state(MTOChoice);

    //New Mto Choice
    var newmtochoice = {
        name: 'common.prime.mtooptions.mtochoices.new',
        url: '/new',
        views: {
            '': {
                templateUrl: 'application/modules/mto/choice/mto.choice.new.html'
            }
        }
    };
    $stateProvider.state(newmtochoice);

    //Update Mto Choice
    var updatemtochoice = {
        name: 'common.prime.mtooptions.mtochoices.update',
        url: '/:id/update',
        views: {
            '': {
                templateUrl: 'application/modules/mto/choice/mto.choice.update.html'
            }
        }
    };
    $stateProvider.state(updatemtochoice);
});