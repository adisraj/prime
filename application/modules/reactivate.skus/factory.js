(function () {
    "use strict";
    angular.module("rc.prime.reactivatesku").factory("ReactivateService", ReactivateService);
    ReactivateService.$inject = ["$http", "application_configuration"];

    function ReactivateService($http, application_configuration) {
        let API = {};
        let apiEndpoint = "/api/sku";
        API.ReActivateSKUs = reActivateSKUs;

        return {
            API
        };

        function reActivateSKUs(skuId, itemId) {
            let body = {
                sku_id: skuId,
                item_id: itemId
            }
            return $http.put(application_configuration.itemAndRetailService.url + apiEndpoint + "/reactivate/skus", body)
                .then((response) => {
                    return response;
                })
                .catch(error => {
                    console.log(error);
                })
        };


 

    }

})();