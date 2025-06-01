(function() {
    angular.module('rc.prime.offers').service('OffersFactory', OffersFactory);
    OffersFactory.$inject = [
        '$http',
        'application_configuration'
    ];

    function OffersFactory($http, application_configuration) {
        let API = {};
        API.CreateOffer = createOffer;
        API.DeleteOffer = deleteOffer;
        API.FetchOffer = fetchOffer;
        API.FetchProductOffers = fetchProductOffers;
        API.FetchOfferBenefits = fetchOfferBenefits;
        API.FetchOfferRules = fetchOfferRules;
        API.FetchStatuses = fetchStatuses;
        API.UpdateOffer = updateOffer;


        return {
            API
        };

        function createOffer(offer) {
            return $http.post(application_configuration.offersService.url + '/api/offers', offer)
                .then((response) => {
                    return response;
                });
        };

        function deleteOffer(offerId) {
            return $http.delete(application_configuration.offersService.url + '/api/offer/' + offerId)
                .then((response) => {
                    return response;
                });
        };

        function fetchProductOffers() {
            return $http.get(application_configuration.offersService.url + '/api/offers')
                .then((response) => {
                    return response.data;
                });
        };

        function fetchOffer(offerId) {
            return $http.get(application_configuration.offersService.url + '/api/offer/' + offerId)
                .then((response) => {
                    return response.data;
                });
        };

        function fetchOfferBenefits(offerId) {
            return $http.get(application_configuration.offersService.url + '/api/offer/' + offerId + '/benefits')
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function fetchOfferRules(offerId) {
            return $http.get(application_configuration.offersService.url + '/api/offer/' + offerId + '/rules')
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function fetchStatuses() {
            return $http.get(application_configuration.offersService.url + '/api/offer/statuses')
                .then((response) => {
                    return response.data;
                });
        };

        function updateOffer(offer) {
            return $http.put(application_configuration.offersService.url + '/api/offer/' + offer.id, offer)
                .then((response) => {
                    return response;
                });
        };


    }
})();