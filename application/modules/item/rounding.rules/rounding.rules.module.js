'use strict';
angular.module('rc.prime.retail.rounding.rule', ['calculus.application']);

angular.module('rc.prime.retail.rounding.rule').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var rounding_rule_groups = {
        name: 'common.prime.roundingrules',
        url: '/retailsetting/rounding/groups',
        templateUrl: 'application/modules/item/rounding.rules/rounding.rule.groups.html',
        data: {
            displayName: 'Rounding Rule Groups'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/item/rounding.rules/rounding.rules.controller.js']);
            }]
        }
    };
    $stateProvider.state(rounding_rule_groups);

    var rounding_rules = {
        name: 'common.prime.rules',
        url: '/retailsetting/rounding/groups/:rule_group_id/:rule_group_name/rules/',
        templateUrl: 'application/modules/item/rounding.rules/rounding.rules.html',
        data: {
            displayName: 'Rounding Rules'
        }
    };
    $stateProvider.state(rounding_rules);

});