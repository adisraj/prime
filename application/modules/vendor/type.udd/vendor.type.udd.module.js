'use strict';
angular.module('rc.prime.vendor.type.udd', ['rc.prime.entity', 'common']);

angular.module('rc.prime.vendor.type.udd').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var vendorudd = {
        name: 'common.prime.vendortypeudd',
        url: '/configure/vendor/type/:vendor_type_id/udd',
        templateUrl: 'application/modules/vendor/type.udd/vendor.type.udd.html',
        data: {
            displayName: 'Vendor Type User Defined Data'
        },
        params: {
            vendor_type_id: null
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/vendor/type.udd/vendor.type.udd.controller.js']);
            }]
        }
    };
    $stateProvider.state(vendorudd);

    //Create new vendor type udd UI
    var new_vendortypeudd = {
        name: 'common.prime.vendortypeudd.new',
        url: '/new',
        templateUrl: 'application/modules/vendor/type.udd/vendor.type.udd.new.html'
    };
    $stateProvider.state(new_vendortypeudd);

    //Update vendor type udd by id UI
    var update_vendortypeudd = {
        name: 'common.prime.vendortypeudd.update',
        url: '/:vendor_type_udd_id/update',
        templateUrl: 'application/modules/vendor/type.udd/vendor.type.udd.update.html'
    };
    $stateProvider.state(update_vendortypeudd);

});