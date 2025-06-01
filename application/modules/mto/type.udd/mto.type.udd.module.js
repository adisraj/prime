'use strict';
angular.module('rc.prime.mto.type.udd', ['rc.prime.entity', 'common']);

angular.module('rc.prime.mto.type.udd').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var mtotype = {
        name: 'common.prime.mtotypeudd',
        url: '/configure/mto/type/:mto_type_id/udd',
        templateUrl: 'application/modules/mto/type.udd/mto.type.udd.html',
        data: {
            displayName: 'MTO Type User Defined Data'
        },
        params: {
            mto_type_id: null
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['application/modules/mto/type.udd/mto.type.udd.controller.js']);
            }]
        }
    };
    $stateProvider.state(mtotype);

    // Create new mto type udd UI
    var new_mtotypeudd = {
        name: 'common.prime.mtotypeudd.new',
        url: '/new',
        templateUrl: 'application/modules/mto/type.udd/mto.type.udd.new.html',
    };
    $stateProvider.state(new_mtotypeudd);

    // update mto type udd UI
    var update_mtotypeudd = {
        name: 'common.prime.mtotypeudd.update',
        url: '/:mto_type_udd_id/update',
        templateUrl: 'application/modules/mto/type.udd/mto.type.udd.update.html',
    };
    $stateProvider.state(update_mtotypeudd);


});