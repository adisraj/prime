'use strict';
angular.module('rc.prime.marketingcampaigns', []);

angular.module('rc.prime.marketingcampaigns').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    var marketing_campaigns = {
        name: 'common.prime.marketingcampaigns',
        url: '/marketing/campaigns',
        templateUrl: 'application/modules/marketing.campaigns/marketing.campaigns.html',
        data: {
            displayName: 'Marketing Campaigns'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load(['./application/modules/marketing.campaigns/marketing.campaigns.controller.js']);
            }]
        }
    };
    $stateProvider.state(marketing_campaigns);
});