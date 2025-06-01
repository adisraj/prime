'use strict';
angular.module('rc.prime.mto.type', ['rc.prime.entity', 'common']);

angular.module('rc.prime.mto.type').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    // mto types list UI
    var mtotype = {
        name: 'common.prime.mtotype',
        url: '/configure/mto/type',
        templateUrl: 'application/modules/mto/type/mto.type.html',
        data: {
            displayName: 'MTO Type'
        },
        resolve: {
            //load required files on loading of module
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load([
                    './application/modules/mto/type/mto.type.controller.js',
                    './application/modules/mto/parameter/mto.parameter.controller.js'
                ]);
            }]
        }
    };
    $stateProvider.state(mtotype);

    // Create new mto type UI
    var new_mto_type = {
        name: 'common.prime.mtotype.new',
        url: '/new',
        templateUrl: 'application/modules/mto/type/mto.type.new.html',
    };
    $stateProvider.state(new_mto_type);

    // update mto type UI
    var update_mto_type = {
        name: 'common.prime.mtotype.update',
        url: '/:mto_type_id/update',
        templateUrl: 'application/modules/mto/type/mto.type.update.html',
    };
    $stateProvider.state(update_mto_type);


});