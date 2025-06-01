(function() {
    'use strict';
    angular.module('rc.prime.login', ['calculus.application','ui.router']);

    angular.module('rc.prime.login')
        .config(function($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise("/login");

            let login = {
                name: 'login?:token?:sessionId?:item_id?:sku_id?:sub_type?:sku_type?:username?:email?:id',
                url: '/login',
                templateUrl: 'application/modules/login/login.html'
            };
            $stateProvider.state(login);
            
            

            let logout = {
                name: 'logout',
                url: '/logout',
                templateUrl: 'application/modules/login/logout.html',
                resolve: {
                    loadFiles: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(['./application/modules/login/controller.js']);
                    }]
                }
            };
            $stateProvider.state(logout);
        })
})();