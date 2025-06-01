'use strict';
angular.module('rc.prime.tickets', []);

angular.module('rc.prime.tickets').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var tickets_instance = {
        name: 'common.prime.tickets',
        url: '/tickets',
        templateUrl: 'application/modules/tickets//tickets.html',
        data: {
            displayName: 'Tickets'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load(['./application/modules/tickets/tickets.controller.js']);
            }]
        }
    };
    $stateProvider.state(tickets_instance);
});