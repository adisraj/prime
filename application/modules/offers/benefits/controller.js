(function() {
    'use strict';

    angular
        .module('rc.prime.benefits')
        .controller('BenefitsController', BenefitsController)

    BenefitsController.$inject = [
        '$scope',
        '$stateParams',
        'common',
        'BenefitsFactory'
    ];

    function BenefitsController(
        $scope,
        $stateParams,
        common,
        BenefitsFactory
    ) {
        let vm = this;
        let $timeout = common.$timeout;
        let logger = common.Logger.getInstance('BenefitsController');

        vm.isProcessing = false;
        vm.OfferBenefits = "";

        vm.sortType = "offer_benefit_type";
        vm.currentPage = 1;
        vm.pageSize = 25;


        vm.fetchOfferBenefits = (refresh) => {
            if (refresh !== undefined) {
                vm.totalRecords = "";
                vm.totalTimeText = "";
                vm.isRefreshTable = true;
                vm.refreshTableText = "Table is refreshing...";
            }
            BenefitsFactory.API.FetchOfferBenefits($stateParams.id)
                .then(benefits => {
                    vm.rowsCount = benefits.length;
                    vm.OfferBenefits = benefits;
                    if (refresh !== undefined) {
                        vm.refreshTableText = "Table is refreshing...";
                        vm.totalRecords = benefits.length;
                        vm.totalRecordsText = "record(s) loaded in approximately";
                        vm.totalTimeText = "<strong>" + benefits.time_taken + "</strong><span class='f-14 c-gray'> seconds</span>";
                        vm.refreshTableText = "Successfully refreshed";
                        $timeout(() => {
                            vm.isRefreshTable = false;
                        }, 3500);
                    }
                    vm.pageChangeHandler(1);
                })
                .catch(error => {
                    logger.error(error);
                });
        }

        vm.PanelNewBenefit = () => {
            vm.Benefit = "";
            common.$state.go('common.prime.benefits.new');
        }


        vm.PanelUpdateBenefit = (benefitId) => {
            common.$state.go('common.prime.benefits.update', {
                benefit_id: benefitId
            });
        }

        vm.PanelDeleteBenefit = (benefit) => {
            vm.Benefit = benefit;
            common.$state.go('common.prime.benefits.delete', {
                benefit_id: benefit.id
            });
        }

        vm.fetchBenefitTypes = () => {
            BenefitsFactory.API.FetchBenefitTypes()
                .then(response => {
                    vm.BenefitTypes = response.data;
                })
                .catch(error => {
                    logger.error(error);
                })
        };

        vm.AddBenefit = () => {
            vm.Benefit.offerId = $stateParams.id;
            BenefitsFactory.API.AddBenefit(vm.Benefit)
                .then(response => {
                    vm.message = "Added benefit to offer successfully.";
                })
                .catch(error => {
                    logger.error(error);
                })
        };

        vm.fetchBenefit = () => {
            BenefitsFactory.API.FetchOfferBenefit($stateParams.benefit_id)
                .then(response => {
                    vm.Benefit = response;
                })
                .catch(error => {
                    logger.error(error);
                })
        }

        vm.updateBenefit = () => {
            BenefitsFactory.API
                .UpdateOfferBenefit(vm.Benefit)
                .then(response => {
                    vm.message = "Updated Offer Benefit successfully.";
                })
                .catch(error => {
                    logger.error(error);
                })
        }

        vm.deleteBenefit = () => {
            BenefitsFactory.API
                .RemoveOfferBenefit(vm.Benefit.offer_id, vm.Benefit.benefit_type_id)
                .then(response => {
                    vm.message = "Deleted Offer Benefit successfully.";
                })
                .catch(error => {
                    logger.error(error);
                })
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