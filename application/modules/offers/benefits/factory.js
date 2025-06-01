(function() {
    angular.module('rc.prime.offers').service('BenefitsFactory', BenefitsFactory);
    BenefitsFactory.$inject = [
        '$http',
        'application_configuration'
    ];

    function BenefitsFactory($http, application_configuration) {
        let API = {};
        API.AddBenefit = addBenefit;
        API.FetchOfferBenefits = fetchOfferBenefits;
        API.FetchOfferBenefit = fetchOfferBenefit;
        API.FetchBenefitTypes = fetchBenefitTypes;
        API.RemoveOfferBenefit = removeOfferBenefit;
        API.UpdateOfferBenefit = updateOfferBenefit;

        return {
            API
        };

        function fetchOfferBenefits(offerId) {
            return $http.get(application_configuration.offersService.url + '/api/offer/' + offerId + '/benefits')
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function fetchOfferBenefit(id) {
            return $http.get(application_configuration.offersService.url + '/api/offer/benefit/' + id)
                .then((response) => {
                    return response.data;
                });
        };

        function fetchBenefitTypes() {
            return $http.get(application_configuration.offersService.url + '/api/offer/benefit/types')
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function addBenefit(benefit) {
            return $http.post(application_configuration.offersService.url + '/api/offer/' + benefit.offerId + '/benefits', benefit)
                .then((response) => {
                    return response.data;
                });
        };

        function updateOfferBenefit(benefit) {
            return $http.put(application_configuration.offersService.url + '/api/offer/' + benefit.offer_id + '/benefit/' + benefit.benefit_type_id, benefit)
                .then((response) => {
                    return response.data;
                });
        };

        function removeOfferBenefit(offerId, benefitTypeId) {
            return $http.delete(application_configuration.offersService.url + '/api/offer/' + offerId + '/benefit/' + benefitTypeId)
                .then((response) => {
                    return response.data;
                });
        };

    }
})();