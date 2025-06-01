(function () {
    'use strict'
    angular.module('rc.prime.marketingcampaigns').factory('MarketingCampaignsService', MarketingCampaignsService);
    MarketingCampaignsService.$inject = [
        '$http',
        'application_configuration'
    ];

    function MarketingCampaignsService($http, application_configuration) {
        let API = {};
        let isCache = false;
        API.GetStatuses = getStatuses;
        API.GetMarketingCampaigns = getMarketingCampaigns;
        API.InsertMarketingCampaign = insertMarketingCampaign;
        API.UpdateMarketingCampaign = updateMarketingCampaign;
        API.DeleteMarketingCampaign = deleteMarketingCampaign;
        API.GetPromotionsByMarketingCampaign = getPromotionsByMarketingCampaign;
        API.GetPromotionsByParentPromotion = getPromotionsByParentPromotion;
        API.ValidateDiscountCodeCheck = validateDiscountCodeCheck;
        API.InsertPromotion = insertPromotion;
        API.UpdatePromotion = updatePromotion;
        API.DeletePromotion = deletePromotion;

        return {
            API
        };

        function getStatuses() {
            return $http.get(application_configuration.marketingService.url + '/api/common/statuses/');
        };

        function getMarketingCampaigns(cacheValue) {
            if (cacheValue !== undefined && cacheValue !== null) {
                isCache = cacheValue;
            }

            return $http.get(application_configuration.marketingService.url + '/api/marketing/campaigns/', {
                cache: isCache
            })
                .then(function (response) {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function insertMarketingCampaign(marketingcampaignDetails) {
            return $http.post(application_configuration.marketingService.url + '/api/marketing/campaigns/', marketingcampaignDetails);
        };

        function updateMarketingCampaign(marketingcampaignDetails) {
            return $http.put(application_configuration.marketingService.url + '/api/marketing/campaigns/' + marketingcampaignDetails.id, marketingcampaignDetails);
        };

        function deleteMarketingCampaign(marketingcampaignDetails) {
            return $http.delete(application_configuration.marketingService.url + '/api/marketing/campaigns/' + marketingcampaignDetails.id, marketingcampaignDetails);
        };

        function getPromotionsByMarketingCampaign(marketingCampaignId) {
            return $http.get(application_configuration.marketingService.url + '/api/promotions/marketing/campaign/' + marketingCampaignId);
        };

        function getPromotionsByParentPromotion(promotionId) {
            return $http.get(application_configuration.marketingService.url + '/api/promotions/parent/promotion/' + promotionId);
        };

        function validateDiscountCodeCheck(discountCode) {
            return $http.get(application_configuration.marketingService.url + '/api/promotions/code/' + discountCode + '/validate_existance');
        };

        function insertPromotion(promotionDetails) {
            return $http.post(application_configuration.marketingService.url + '/api/promotions/', promotionDetails);
        };

        function updatePromotion(promotionDetails) {
            return $http.put(application_configuration.marketingService.url + '/api/promotions/' + promotionDetails.id, promotionDetails);
        };

        function deletePromotion(promotionDetails) {
            return $http.delete(application_configuration.marketingService.url + '/api/promotions/' + promotionDetails.id, promotionDetails);
        };
    }
})();