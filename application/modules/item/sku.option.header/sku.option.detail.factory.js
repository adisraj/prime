(function() {
    angular.module('rc.prime.item').factory('SkuOptionDetailService', SkuOptionDetailService);
    SkuOptionDetailService.$inject = [
        '$http',
        'application_configuration'
    ]

    function SkuOptionDetailService($http, application_configuration) {
        let API = {};
        let apiEndpoint = "/api/sku/detail";

        API.GetSkuOptionDetails = getSkuOptionDetails;
        API.InsertSkuOptionDetail = insertSkuOptionDetail;
        API.SearchSkuOptionDetail = searchSkuOptionDetail;
        API.UpdateSkuOptionDetail = updateSkuOptionDetail;
        API.DeleteSkuOptionDetail = deleteSkuOptionDetail;
        API.DeleteSkuOptionDetailBySKU = deleteSkuOptionDetailBySKU;

        return {
            API
        };



        function getSkuOptionDetails() {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint)
                .then((response) => {
                    return response.data;
                });
        };

        function insertSkuOptionDetail(valueDetails) {
            return $http.post(application_configuration.itemAndRetailService.url + apiEndpoint, valueDetails);
        };

        function searchSkuOptionDetail(search_field, search_value) {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint + '/search/' + search_field + '-' + search_value)
                .then((response) => {
                    return response.data;
                });
        }


        function updateSkuOptionDetail(valueDetails) {
            return $http.put(application_configuration.itemAndRetailService.url + apiEndpoint + '/' + valueDetails.id, valueDetails);
        };

        function deleteSkuOptionDetail(valueDetails) {
            return $http.delete(application_configuration.itemAndRetailService.url + apiEndpoint + '/' + valueDetails.id, valueDetails);
        }

        function deleteSkuOptionDetailBySKU(skuID) {
            return $http.delete(application_configuration.itemAndRetailService.url + apiEndpoint + '/sku/' + skuID);
        }

    };
})();