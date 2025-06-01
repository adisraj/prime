'use strict';
angular.module('rc.prime.mto', ['rc.prime.entity', 'rc.prime.codes', 'rc.prime.vendor', 'calculus.application']);

angular.module('rc.prime.mto').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var MTOOptions = {
        name: 'common.prime.mtooptions',
        url: '/maintenance/mto/options',
        params: {
            create: null
        },
        templateUrl: 'application/modules/mto/option/mto.options.maintenance.html',
        data: {
            displayName: 'MTO Options'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['application/modules/mto/option/mto.maintenance.controller.js']);
            }]
        }
    };
    $stateProvider.state(MTOOptions);

    //Create New MTO Options
    var new_mto_options = {
        name: 'common.prime.mtooptions.new',
        url: '/new',
        templateUrl: 'application/modules/mto/option/mto.options.maintenance.new.html'
    };
    $stateProvider.state(new_mto_options);

    //Update Mto Options
    var update_options = {
        name: 'common.prime.mtooptions.update',
        url: '/:id/update',
        templateUrl: 'application/modules/mto/option/mto.options.maintenance.update.html'

    };
    $stateProvider.state(update_options);
});