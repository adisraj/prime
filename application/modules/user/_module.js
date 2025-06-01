'use strict';
angular.module('rc.prime.user', ['calculus.application']);

angular.module('rc.prime.user').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var profile_profile = {
        name: 'pages.profile',
        url: '/profile',
        templateUrl: 'application/modules/user/profile.html',
        data: {
            displayName: false
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/user/userprofile.controller.js']);
            }]
        }
    };
    $stateProvider.state(profile_profile);

    var profile_about = {
        name: 'pages.profile.profile-about',
        url: '/profile-about',
        templateUrl: 'application/modules/user/profile.details.html',
        data: {
            displayName: 'About'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/user/userprofile.controller.js']);
            }]
        }
    };
    $stateProvider.state(profile_about);

    var profile_access_control = {
        name: 'pages.profile.profile-access-control',
        url: '/access-control',
        templateUrl: 'application/modules/user/profile-access-control.html',
        data: {
            displayName: 'Access Control'
        }
    };
    $stateProvider.state(profile_access_control);

    var preferences = {
        name: 'pages.profile.preferences',
        url: '/preferences',
        templateUrl: 'application/modules/preferences/preferences.html',
        data: {
            displayName: 'Preferences'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/preferences/preference.controller.js']);
            }]
        }
    };
    $stateProvider.state(preferences);

    var profile_photos = {
        name: 'pages.profile.profile-photos',
        url: '/profile-photos',
        templateUrl: 'application/modules/user/profile-photos.html',
        data: {
            displayName: 'Messages'
        }
    };
    $stateProvider.state(profile_photos);

    var profile_security = {
        name: 'pages.profile.profile-security',
        url: '/profile-security/:id',
        templateUrl: 'application/modules/user/profile-security.html',
        params: {
            resetLogin: false
        },
        data: {
            displayName: 'Security'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/user/_controller.js']);
            }]
        }
    };
    $stateProvider.state(profile_security);

});