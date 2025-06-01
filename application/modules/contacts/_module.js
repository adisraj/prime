'use strict';
angular.module('rc.prime.contact', ['rc.prime.entity', 'rc.prime.country', 'rc.prime.codes']);

angular.module('rc.prime.contact').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var contacts_view = {
        name: 'common.prime.contacts',
        templateUrl: 'application/modules/contacts/contacts.html',
        url: '/contacts',
        data: {
            displayName: 'Contacts',
            requireLogin: true
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load(['./application/modules/contacts/contact.controller.js']);
            }]
        }
    };
    $stateProvider.state(contacts_view);
});