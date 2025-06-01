'use strict';
angular.module('rc.prime.authorisation', ['calculus.application']);

angular.module('rc.prime.authorisation').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    //Authorizations
    var authorization = {
        name: 'authorization',
        url: '/authorization',
        views: {
            '': {
                templateUrl: 'views/common.html'
            },
            'info@authorization': {
                templateUrl: 'application/templates/infopage.html'
            }
        },
        data: {
            displayName: false
        }
    };
    $stateProvider.state(authorization);

    /*Active Users*/
    var auth_master = {
        name: 'authorization.master',
        url: '/master',
        templateUrl: 'application/modules/authorization/dashboard.html',
        data: {
            displayName: false
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/authorization/controller.js']);
            }]
        }
    };
    $stateProvider.state(auth_master);

    /*Active Users*/
    var active_users = {
        name: 'authorization.master.activeusers',
        url: '/activeusers',
        templateUrl: 'application/modules/authorization/activeusers.html',
        params: {
            resetLogin: false
        },
        data: {
            displayName: 'Active Users'
        }
    };
    $stateProvider.state(active_users);

    /*User Profile*/
    var user_profile = {
        name: 'authorization.master.userprofiles',
        url: '/userprofiles',
        templateUrl: 'application/modules/authorization/userprofiles.html',
        params: {
            resetLogin: false
        },
        data: {
            displayName: 'User Profiles'
        }
    };
    $stateProvider.state(user_profile);

    /*User Permission*/
    var permissions = {
        name: 'authorization.master.permissions',
        url: '/permissions',
        templateUrl: 'application/modules/authorization/permissions.html',
        params: {
            resetLogin: false
        },
        data: {
            displayName: 'User Permissions'
        }
    };
    $stateProvider.state(permissions);

    /*User roles*/
    var roles = {
        name: 'authorization.master.roles',
        url: '/roles',
        templateUrl: 'application/modules/authorization/roles.html',
        params: {
            resetLogin: false
        },
        data: {
            displayName: 'User Roles'
        }
    };
    $stateProvider.state(roles);

    var uam_roles = {
        name: 'authorization.master.uamroles',
        url: '/uamroles',
        templateUrl: 'application/modules/authorization/uam.roles.html',
        data: {
            displayName: 'User Roles'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/authorization/uam.role.controller.js']);
            }]
        }
    };
    $stateProvider.state(uam_roles);

    var uam_roles = {
        name: 'authorization.master.uamusers',
        url: '/uamusers',
        templateUrl: 'application/modules/authorization/uam.users.html',
        data: {
            displayName: 'User Roles'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/authorization/controller.js']);
            }]
        }
    };
    $stateProvider.state(uam_roles);


    var uam_mfa = {
        name: 'authorization.master.uammfa',
        url: '/uammfa',
        templateUrl: 'application/modules/authorization/uam.mfa.html',
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/authorization/uam.mfa.controller.js']);
            }]
        }
    };
    $stateProvider.state(uam_mfa);

    var uam_roles = {
        name: 'authorization.master.uampermissions',
        url: '/uampermissions',
        templateUrl: 'application/modules/authorization/uam.permissions.html',
        data: {
            displayName: 'User Roles'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/authorization/uam.permission.controller.js']);
            }]
        }
    };
    $stateProvider.state(uam_roles);

    var uam_settings = {
        name: 'authorization.master.uamsettings',
        url: '/uamsettings',
        templateUrl: 'application/modules/authorization/uam.settings.html',
        data: {
            displayName: 'User Roles'
        }
    };
    $stateProvider.state(uam_settings);

});