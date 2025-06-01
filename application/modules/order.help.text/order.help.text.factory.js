(function () {
    'use strict'
    angular.module('rc.prime.orderhelptext').factory('OrderHelpTextService', OrderHelpTextService);
    OrderHelpTextService.$inject = [
        '$http',
        'application_configuration'
    ]

    function OrderHelpTextService($http, application_configuration) {
        let API = {};

        API.GetOrderHelpTextList = getOrderHelpTextList;
        API.InsertOrderHelpText = insertOrderHelpText;
        API.UpdateOrderHelpText = updateOrderHelpText;
        API.DeleteOrderHelpText = deleteOrderHelpText;

        return {
            API
        };

        function getOrderHelpTextList() {
            return $http.get(application_configuration.orderadvisorService.url + '/api/order-adviser/help-text/headers')
                .then(function (response) {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        }

        function insertOrderHelpText(orderTextDetails) {
            return $http.post(application_configuration.orderadvisorService.url + '/api/order-adviser/help-text/headers', orderTextDetails);
        }

        function updateOrderHelpText(orderTextDetails) {
            return $http.put(application_configuration.orderadvisorService.url + '/api/order-adviser/help-text/headers/' + orderTextDetails.id, orderTextDetails);
        }

        function deleteOrderHelpText(orderTextDetails) {
            return $http.delete(application_configuration.orderadvisorService.url + '/api/order-adviser/help-text/headers/' + orderTextDetails.id, orderTextDetails);
        }

    }

})();