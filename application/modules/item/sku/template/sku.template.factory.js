(function() {
    'use strict';

    angular
        .module('rc.prime.sku')
        .factory('SKUTemplateService', SKUTemplateService)

    SKUTemplateService.$inject = ['$http', 'application_configuration'];

    function SKUTemplateService($http, application_configuration) {
        let API = {};
        let object = {};
        let apiEndpoint = '/api/sku/template';


        API.FetchTemplateByParentSkuId = fetchTemplateByParentSkuId;
        API.InsertSKUTemplate = insertSKUTemplate;
        API.UpdateSKUTemplate = updateSKUTemplate;

        return {
            API
        };

        function fetchTemplateByParentSkuId(parent_sku_id, item_id) {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint + '/parent/' + parent_sku_id + '?item_id=' + item_id)
                .then(function(response) {
                    return response.data;
                });
        }

        function insertSKUTemplate(SkuTemplate) {
            return $http.post(application_configuration.itemAndRetailService.url + apiEndpoint, SkuTemplate);
        }

        function updateSKUTemplate(data) {
            return $http.put(application_configuration.itemAndRetailService.url + apiEndpoint + '/header/' + data.id, data);
        }
    }
})();