(function() {
    angular.module('rc.prime.attributes').factory('AttributeValueService', AttributeValueService);
    AttributeValueService.$inject = [
        '$http',
        'application_configuration'
    ]

    function AttributeValueService($http, application_configuration) {
        let API = {};

        API.DeleteAttributeValue = deleteAttributeValue;
        API.GetAttributeValues = getAttributeValues;
        API.GetAttributeValuesByAttributeId = getAttributeValuesByAttributeId;
        API.GetAttributeValueById = getAttributeValueById;
        API.InsertAttributeValue = insertAttributeValue;
        API.SearchAttributeValues = searchAttributeValues;
        API.UpdateAttributeValue = updateAttributeValue;
        API.RemoveValueById = removeValueById;

        return {
            API
        };

        function removeValueById(id) {
            return $http.delete(application_configuration.uddService.url + '/api/attribute/values/' + id);
        };

        function deleteAttributeValue(valueDetails) {
            return $http.delete(application_configuration.uddService.url + '/api/attribute/property/' + valueDetails.id, valueDetails);
        };

        function getAttributeValues() {
            return $http.get(application_configuration.uddService.url + '/api/attribute/properties');
        };

        function getAttributeValueById(id) {
            return $http.get(application_configuration.uddService.url + '/api/attribute/properties/' + id);
        };

        function getAttributeValuesByAttributeId(attribute_id) {
            return $http.get(application_configuration.uddService.url + '/api/attribute/' + attribute_id + '/properties')
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function insertAttributeValue(valueDetails) {
            return $http.post(application_configuration.uddService.url + '/api/attribute/property', valueDetails);
        };

        function searchAttributeValues(search_field, search_value) {
            return $http.get(application_configuration.uddService.url + '/api/attribute/properties/search?field=' + search_field + '&value=' + search_value);
        };

        function updateAttributeValue(valueDetails) {
            return $http.put(application_configuration.uddService.url + '/api/attribute/property/' + valueDetails.id, valueDetails);
        };
    };
})();