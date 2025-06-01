(function () {
    'use strict'
    angular.module('rc.prime.corporatecontrol').factory('CorporateControlService', CorporateControlService);
    CorporateControlService.$inject = [
        '$http',
        'application_configuration'
    ]

    function CorporateControlService($http, application_configuration) {
        let API = {};

        API.GetCorporateConfigList = getCorporateConfigList;
        API.InsertCorporateConfig = insertCorporateConfig;
        API.UpdateCorporateConfig = updateCorporateConfig;
        API.DeleteCorporateConfig = deleteCorporateConfig;
        API.UploadImage = uploadImage;

        return {
            API
        };

        function getCorporateConfigList() {
            return $http.get(application_configuration.itemAndRetailService.url + '/api/banner/corporate_marketing')
                .then(function (response) {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        }

        function insertCorporateConfig(corporate_config) {
            return $http.post(application_configuration.itemAndRetailService.url + '/api/banner/corporate_marketing', corporate_config);
        }

        function updateCorporateConfig(corporate_config) {
            return $http.put(application_configuration.itemAndRetailService.url + '/api/banner/corporate_marketing/' + corporate_config.id, corporate_config);
        }

        function deleteCorporateConfig(corporate_config) {
            return $http.delete(application_configuration.itemAndRetailService.url + '/api/banner/corporate_marketing/' + corporate_config.id, corporate_config);
        }

        function uploadImage(corporate_config, id) {
            return $http.put(application_configuration.itemAndRetailService.url + '/api/banner/uploadmultiplefiles/' + id, corporate_config);
        }
    }

})();