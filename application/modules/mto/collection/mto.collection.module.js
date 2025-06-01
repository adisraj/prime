'use strict';
angular.module('rc.prime.mto.collection', ['rc.prime.entity', 'rc.prime.codes', 'rc.prime.vendor', 'calculus.application']);

angular.module('rc.prime.mto.collection').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var made_to_order_collection = {
        name: 'common.prime.mtocollections',
        url: '/reference/mto/collections',
        templateUrl: 'application/modules/mto/collection/mto.collection.html',
        data: {
            displayName: 'MTO Collections'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/mto/collection/mto.collection.controller.js']);
            }]
        }
    };
    $stateProvider.state(made_to_order_collection);

});