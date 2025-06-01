'use strict';
angular.module('rc.prime.discount', []);

angular.module('rc.prime.discount').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    var discount = {
        name: 'common.prime.discount',
        url: '/discount/types',
        templateUrl: 'application/modules/discount/discount.types.html',
        data: {
            displayName: 'Disount types'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/discount/controller.js']);
            }]
        }
    };
    $stateProvider.state(discount);


    // Create new discount type UI
    var new_discount_type = {
        name: 'common.prime.discount.new',
        url: '/new',
        templateUrl: 'application/modules/discount/discount.type.new.html',
    };
    $stateProvider.state(new_discount_type);


    // Create new discount type UI
    var update_discount_type = {
        name: 'common.prime.discount.update',
        url: '/:discount_type_id/update',
        templateUrl: 'application/modules/discount/discount.type.update.html',
    };
    $stateProvider.state(update_discount_type);
    
     // Create new discount type UI
     var new_discount_type_value = {
        name: 'common.prime.discount.newvalue',
        url: '/:discount_type_id/value/new?:discount_type_value_id',
        templateUrl: 'application/modules/discount/discount.type.value.new.html',
    };
    $stateProvider.state(new_discount_type_value);


    // Create new discount type UI
    var update_discount_type_value = {
        name: 'common.prime.discount.updatevalue',
        url: '/:discount_type_id/value/:discount_type_value_id/update',
        templateUrl: 'application/modules/discount/discount.type.value.update.html',
    };
    $stateProvider.state(update_discount_type_value);

});