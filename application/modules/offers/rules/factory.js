(function() {
    angular.module('rc.prime.offerrule').service('RulesFactory', RulesFactory);
    RulesFactory.$inject = [
        '$http',
        'application_configuration'
    ];

    function RulesFactory($http, application_configuration) {
        let API = {};
        API.AddRule = addRule;
        API.FetchOfferRules = fetchOfferRules;
        API.FetchOfferRule = fetchOfferRule;
        API.FetchRuleTypes = fetchRuleTypes;
        API.RemoveOfferRule = removeOfferRule;
        API.FetchItemsByRule = fetchItemsByRule;
        API.AddItemToRule = addItemToRule;
        API.DeleteItemForRule = deleteItemForRule;
        API.FetchCollectionsByRule = fetchCollectionsByRule;
        API.AddCollectionToRule = addCollectionToRule;
        API.DeleteCollectionForRule = deleteCollectionForRule;
        API.FetchSKUsByRule = fetchSKUsByRule;
        API.AddSKUToRule = addSKUToRule;
        API.DeleteSKUForRule = deleteSKUForRule;

        return {
            API
        };

        function fetchOfferRules(offerId) {
            return $http.get(application_configuration.offersService.url + '/api/offer/' + offerId + '/rules')
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function fetchOfferRule(id) {
            return $http.get(application_configuration.offersService.url + '/api/offer/rule/' + id)
                .then((response) => {
                    return response.data;
                });
        };

        function fetchRuleTypes() {
            return $http.get(application_configuration.offersService.url + '/api/offer/rule/types')
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function addRule(rule) {
            return $http.post(application_configuration.offersService.url + '/api/offer/' + rule.offerId + '/rules', rule)
                .then((response) => {
                    return response.data;
                });
        };

        function removeOfferRule(offerId, ruleTypeId) {
            return $http.delete(application_configuration.offersService.url + '/api/offer/' + offerId + '/rule/' + ruleTypeId)
                .then((response) => {
                    return response.data;
                });
        };


        function fetchItemsByRule(ruleId) {
            return $http.get(application_configuration.offersService.url + '/api/rule/' + ruleId + '/item')
                .then((response) => {
                    return response.data;
                });
        }

        function addItemToRule(data) {
            return $http.post(application_configuration.offersService.url + '/api/rule/items', data);
        }

        function deleteItemForRule(data) {
            return $http.delete(application_configuration.offersService.url + '/api/rule/' + data.rule_id + '/item/' + data.item_id);
        }

        function fetchCollectionsByRule(ruleId) {
            return $http.get(application_configuration.offersService.url + '/api/rule/' + ruleId + '/collection')
                .then((response) => {
                    return response.data;
                });
        }

        function addCollectionToRule(data) {
            return $http.post(application_configuration.offersService.url + '/api/rule/collections', data);
        }

        function deleteCollectionForRule(data) {
            return $http.delete(application_configuration.offersService.url + '/api/rule/' + data.rule_id + '/collection/' + data.collection_id);
        }

        function fetchSKUsByRule(ruleId) {
            return $http.get(application_configuration.offersService.url + '/api/rule/' + ruleId + '/sku')
                .then((response) => {
                    return response.data;
                });
        }

        function addSKUToRule(data) {
            return $http.post(application_configuration.offersService.url + '/api/rule/skus', data);
        }

        function deleteSKUForRule(data) {
            return $http.delete(application_configuration.offersService.url + '/api/rule/' + data.rule_id + '/sku/' + data.sku_id);
        }

    }
})();