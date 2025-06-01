(function() {
    'use strict';

    angular
        .module('rc.prime.offers')
        .controller('OffersController', OffersController)

    OffersController.$inject = [
        '$scope',
        '$stateParams',
        'common',
        'OffersFactory'
    ];

    function OffersController(
        $scope,
        $stateParams,
        common,
        OffersFactory
    ) {
        let vm = this;
        let $timeout = common.$timeout;
        let logger = common.Logger.getInstance('OffersController');

        vm.isProcessing = false;
        vm.Offer = "";
        vm.isLoaded = true;

        vm.sortType = "name";
        vm.currentPage = 1;
        vm.pageSize = 25;

        vm.fetchStatuses = () => {
            OffersFactory.API.FetchStatuses()
                .then(statuses => {
                    vm.Statuses = statuses;
                })
                .catch(error => {
                    logger.error(error);
                });
        }

        vm.RefreshData = () => {
            try {
                this.isRefreshTable = true;
                this.fetchOffers();
                this.refreshTableText = "Table is refreshing...";
                this.totalRecords = vm.Offers.length;
                this.totalRecordsText = "record(s) loaded in approximately";
                this.refreshTableText = "Successfully refreshed";
                $timeout(() => {
                    this.isRefreshTable = false;
                }, 3500);
            } catch (exception) {
                this.isRefreshTable = true;
                this.refreshTableText = "Unsuccessfull!";
                $timeout(() => {
                    this.isRefreshTable = false;
                }, 2500);
            }
        }

        vm.fetchOffers = () => {
            vm.isLoaded = false;
            OffersFactory.API
                .FetchProductOffers()
                .then(offers => {
                    vm.rowsCount = offers.length;
                    vm.Offers = offers;
                    vm.isLoaded = true;
                    vm.pageChangeHandler(1);
                })
                .catch(error => {
                    logger.error(error);
                });
        }

        vm.fetchOffer = () => {
            vm.isOfferLoaded = false;
            OffersFactory.API
                .FetchOffer($stateParams.id)
                .then(response => {
                    vm.Offer = response;
                    vm.isOfferLoaded = true;
                })
                .catch(error => {
                    logger.error(error);
                });
        }

        vm.viewOfferBenefits = (offerId) => {
            common.$state.go('common.prime.benefits', {
                id: offerId
            });
        }

        vm.viewOfferRules = (offerId) => {
            common.$state.go('common.prime.offerrules', {
                id: offerId
            });
        }

        vm.fetchOfferRules = (refresh) => {
            if (refresh !== undefined) {
                vm.totalRecords = "";
                vm.totalTimeText = "";
                vm.isRefreshTable = true;
                vm.refreshTableText = "Table is refreshing...";
            }
            vm.isLoaded = false;
            OffersFactory.API
                .FetchOfferRules($stateParams.id)
                .then(rules => {
                    vm.OfferRules = rules;
                    vm.rulesRowsCount = rules.length;
                    if (refresh !== undefined) {
                        vm.refreshTableText = "Table is refreshing...";
                        vm.totalRecords = rules.length;
                        vm.totalRecordsText = "record(s) loaded in approximately";
                        vm.totalTimeText = "<strong>" + rules.time_taken + "</strong><span class='f-14 c-gray'> seconds</span>";
                        vm.refreshTableText = "Successfully refreshed";
                        $timeout(() => {
                            vm.isRefreshTable = false;
                        }, 3500);
                    }
                    vm.isLoaded = true;
                    vm.rulesPageChangeHandler(1);
                })
                .catch(error => {
                    logger.error(error);
                });
        };

        vm.PanelNewOffer = () => {
            vm.Offer = "";
            common.$state.go('common.prime.offers.new');
        };


        vm.CreateOffer = () => {
            vm.isProcessing = true;
            vm.Offer.begin_dt = moment(vm.Offer.begin_dt, $scope.date_format).format('YYYY-MM-DD');
            vm.Offer.end_dt = moment(vm.Offer.end_dt, $scope.date_format).format('YYYY-MM-DD');

            vm.Offer.coupon_required = vm.Offer.coupon_required === undefined ? 0 : vm.Offer.coupon_required;
            vm.Offer.co_exist = vm.Offer.co_exist === undefined ? 0 : vm.Offer.co_exist;
            OffersFactory.API
                .CreateOffer(vm.Offer)
                .then(response => {
                    vm.isProcessing = false;
                    vm.message = "Created new offer successfully.";
                    vm.Offers.push(vm.Offer);
                    vm.Offer = "";
                })
                .catch(error => {
                    vm.error = error.data.error;
                });
            $timeout(() => {
                vm.isProcessing = false;
                vm.message = null;
                vm.error = null;
            }, 2500);
        }

        vm.PanelUpdateOffer = (offer) => {
            vm.Offer = offer;
            common.$state.go('common.prime.offers.update', {
                id: offer.id
            });
        }

        vm.updateOffer = () => {
            vm.isProcessing = true;
            vm.Offer.begin_dt = moment(vm.Offer.begin_dt, $scope.date_format).format('YYYY-MM-DD');
            vm.Offer.end_dt = moment(vm.Offer.end_dt, $scope.date_format).format('YYYY-MM-DD');

            vm.Offer.coupon_required = vm.Offer.coupon_required === undefined ? 0 : vm.Offer.coupon_required;
            vm.Offer.co_exist = vm.Offer.co_exist === undefined ? 0 : vm.Offer.co_exist;
            OffersFactory.API
                .UpdateOffer(vm.Offer)
                .then(response => {
                    vm.isProcessing = false;
                    vm.message = "Updated Offer successfully.";
                    vm.Offers = vm.Offers.filter(Offer => {
                        if (Offer.id === parseInt($stateParams.id)) {
                            return Offer = vm.Offer;
                        }
                    });
                    $timeout(() => {
                        vm.isProcessing = false;
                        vm.message = null;
                        common.$state.go('common.prime.offers');
                    }, 2500);
                })
                .catch(error => {
                    logger.error(error);
                });
        }

        vm.PanelDeleteOffer = (offer) => {
            vm.Offer = offer;
            common.$state.go('common.prime.offers.delete', {
                id: offer.id
            });
        }

        vm.showConfirmDeletePanel = function() {
            vm.isShowHistory = false;
            vm.isConfirmDelete = true;
            vm.isUnauthorized = false;
        };

        vm.deleteOffer = () => {
            vm.isProcessing = true;
            OffersFactory.API
                .DeleteOffer($stateParams.id)
                .then(response => {
                    vm.isProcessing = false;
                    vm.Offers = this.Offers.filter(Offer => {
                        if (Offer.id !== parseInt($stateParams.id)) {
                            return Offer;
                        }
                    });
                    vm.message = "Deleted Offer successfully.";
                    $timeout(() => {
                        vm.isProcessing = false;
                        vm.message = null;
                        common.$state.go('common.prime.offers');
                    }, 1500);
                })
                .catch(error => {
                    logger.error(error);
                });
        }

        vm.pageChangeHandler = (num) => {
            vm.currentPage = num;
            vm.updateTableInformation(num);
        };

        vm.updateTableInformation = (currentPage) => {
            let initalCount;
            if (!vm.rowsCount || vm.rowsCount === 0) {
                initalCount = 0;
            } else {
                initalCount = 1;
            }
            if (currentPage === 1) {
                vm.rowsInfo = "Displaying " + initalCount + "-" + (vm.rowsCount < vm.pageSize ? vm.rowsCount : vm.pageSize) + " Of " + vm.rowsCount + " Records";
            } else {
                var start = (parseInt(currentPage) * parseInt(vm.pageSize)) - parseInt(vm.pageSize) + 1;
                var end = (((parseInt(currentPage) * parseInt(vm.pageSize)) - parseInt(vm.pageSize)) + parseInt(vm.pageSize));
                vm.rowsInfo = "Displaying " + start + "-" + (end < vm.rowsCount ? end : vm.rowsCount) + " Of " + vm.rowsCount + " Records";
            }
        };

    }
})();