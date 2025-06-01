'use strict';

angular
    .module('rc.prime.offerrule', ['calculus.application']);

angular
    .module('rc.prime.offerrule')
    .config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/login");

        let rules = {
            name: 'common.prime.offerrules',
            url: '/product/offers/:id/rules',
            templateUrl: 'application/modules/offers/rules/rules.html',
            resolve: {
                loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                    return $ocLazyLoad.load(['./application/modules/offers/rules/controller.js']);
                }]
            }
        };
        $stateProvider.state(rules);

        let new_rule = {
            name: 'common.prime.offerrules.new',
            url: '/new',
            templateUrl: 'application/modules/offers/rules/rule.new.html'
        };
        $stateProvider.state(new_rule);

        let update_rule = {
            name: 'common.prime.offerrules.update',
            url: '/:rule_id/update',
            templateUrl: 'application/modules/offers/rules/rule.update.html'
        };
        $stateProvider.state(update_rule);

        let delete_rule = {
            name: 'common.prime.offerrules.delete',
            url: '/:rule_id/delete',
            templateUrl: 'application/modules/offers/rules/rule.delete.html'
        };
        $stateProvider.state(delete_rule);

        let rule_items = {
            name: 'common.prime.offerrules.items',
            url: '/:rule_id/items',
            templateUrl: 'application/modules/offers/rules/panel.offer.rules.items.html'
        };
        $stateProvider.state(rule_items);

        let rule_collection = {
            name: 'common.prime.offerrules.collections',
            url: '/:rule_id/itemcollections',
            templateUrl: 'application/modules/offers/rules/panel.offer.rules.collections.html'
        };
        $stateProvider.state(rule_collection);

        let rule_sku = {
            name: 'common.prime.offerrules.skus',
            url: '/:rule_id/skus',
            templateUrl: 'application/modules/offers/rules/panel.offer.rules.skus.html'
        };
        $stateProvider.state(rule_sku);

    });