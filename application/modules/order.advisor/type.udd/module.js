'use strict';
angular.module('rc.prime.orderadvisor.type.udd', ['rc.prime.entity', 'common']);

angular.module('rc.prime.orderadvisor.type.udd').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var order_advisor_type_udd = {
        name: 'common.prime.orderadvisortypeudd',
        url: '/configure/orderadvisor/type/:advisor_type_id/udd',
        templateUrl: 'application/modules/order.advisor/type.udd/view.html',
        data: {
            displayName: 'Sale Order Advisor Type User Defined Data'
        },
        params: {
            advisor_type_id: null
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/order.advisor/type.udd/controller.js']);
            }]
        }
    };
    $stateProvider.state(order_advisor_type_udd);


    var new_order_advisor_type_udd = {
        name: 'common.prime.orderadvisortypeudd.new',
        url: '/new',
        templateUrl: 'application/modules/order.advisor/type.udd/panel.new.html',
    };
    $stateProvider.state(new_order_advisor_type_udd);

    var update_order_advisor_type_udd = {
        name: 'common.prime.orderadvisortypeudd.update',
        url: '/update/:id',
        templateUrl: 'application/modules/order.advisor/type.udd/panel.update.html',
    };
    $stateProvider.state(update_order_advisor_type_udd);

});