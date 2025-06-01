(function() {
    'use strict';

    angular
        .module('rc.prime.retail.rounding.rule')
        .factory('RoundingRulesService', RoundingRulesService)

    RoundingRulesService.$inject = [
        '$http',
        'application_configuration'
    ];

    function RoundingRulesService(
        $http,
        application_configuration
    ) {
        let API = {};
        let object = {};
        API.GetRoundingRuleGroups = getRoundingRuleGroups;
        API.GetRulesByRuleGroupId = getRulesByRuleGroupId;
        API.StoreVariable = storeVariable;
        API.GetVariable = getVariable;

        return {
            API
        };

        function getRoundingRuleGroups() {
            return $http.get(application_configuration.itemAndRetailService.url + '/api/retail/rounding/rulegroups')
                .then(response => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        }

        function getRulesByRuleGroupId(ruleGroupId) {
            return $http.get(application_configuration.itemAndRetailService.url + '/api/retail/rounding/rulegroups/' + ruleGroupId + '/rules')
                .then(response => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function storeVariable(key, value) {
            object[key] = value;
        };

        function getVariable(key) {
            return object[key];
        };
    }
})();