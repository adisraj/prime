'use strict';
class AttributeValueFactory {
    constructor($http, application_configuration) {
        this.endpoint = '/api';
        this.$http = $http;
        this.application_configuration = application_configuration;
    }
    FetchAttributeValues(attributeId) {
        return this.$http.get(this.application_configuration.uddService.url + '/api/attribute/' + attributeId + '/properties')
    }

    FetchAttributeValueById(id) {
        return this.$http.get(this.application_configuration.uddService.url + this.endpoint + '/attribute/property/' + id);
    }

    FetchAttributeValueByAttributeId(attributeId) {
        return this.$http.get(this.application_configuration.uddService.url + this.endpoint + '/attribute/' + attributeId + '/properties');
    }

    FetchStatus() {
        return this.$http.get(this.application_configuration.uddService.url + this.endpoint + '/udd/status');
    }

    CreateAttributeValue(attributeValue) {
        return this.$http.post(this.application_configuration.uddService.url + this.endpoint + '/attribute/properties', attributeValue);
    }

    UpdateAttributeValue(attributeValue) {
        return this.$http.put(this.application_configuration.uddService.url + this.endpoint + '/attribute/property/' + attributeValue.id, attributeValue);
    }

    DeleteAttributeValue(id) {
        return this.$http.delete(this.application_configuration.uddService.url + this.endpoint + '/attribute/property/' + id);
    }

    RemoveValueById(id) {
        return this.$http.delete(this.application_configuration.uddService.url + this.endpoint + '/attribute/values/' + id);
    };
}

angular
    .module('rc.prime.attribute.values')
    .factory('AttributeValueFactory', AttributeValueFactory)