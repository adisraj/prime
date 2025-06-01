'use strict';
angular.module('rc.prime.entity', []);

angular.module('rc.prime.entity').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var entity = {
        name: 'common.prime.entity',
        url: '/entity',
        templateUrl: 'application/modules/entity/entity.html',
        data: {
            displayName: 'Entities'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['application/modules/entity/entity.controller.js']);
            }]
        }
    };
    $stateProvider.state(entity);

    var entity_details = {
        name: 'common.prime.entitydetails',
        url: '/entitydetails',
        templateUrl: 'application/modules/entity/entity_details.html',
        data: {
            displayName: 'Entity Details'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['application/modules/entity/entitydetails.controller.js']);
            }]
        }
    };
    $stateProvider.state(entity_details);
});