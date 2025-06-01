'use strict';
class SKUFormatSettingsFactory {
    constructor($http, application_configuration) {
        this.$http = $http;
        this.application_configuration = application_configuration;
    }
    FetchSKUFormat() {
        return this.$http.get(this.application_configuration.itemAndRetailService.url + '/api/sku/format/');
    }
}

angular
.module('rc.prime.sku.settings')
.factory('SKUFormatSettingsFactory', SKUFormatSettingsFactory)