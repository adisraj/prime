(function() {
    'use strict';

    angular
        .module('calculus')
        .controller('PreferenceController', PreferenceController)

    PreferenceController.$inject = [
        '$scope',
        'common',
        'PreferenceService'
    ];

    function PreferenceController(
        $scope,
        common,
        PreferenceService
    ) {

        var vm = this;
        vm.allOptions = {};
        vm.allPreferencesList = [];
        let $timeout = common.$timeout;
        let logger = common.Logger.getInstance('PreferenceController');
        let SessionMemory = common.SessionMemory;
        let user_id = SessionMemory.API.Get('user.id');

        vm.getAllPreferenceList = function() {
            PreferenceService.API.GetAllPreferences()
                .then(response => {
                    vm.allPreferencesList = response.data;
                }).catch(error => {
                    logger.error(error)
                });
        };

        vm.getAllOptionsList = function() {
            PreferenceService.API.GetAllOptions()
                .then(response => {
                    vm.allOptions = response.data;
                    vm.prepareDropDownValues();
                })
                .catch(error => {
                    logger.error(error);
                });
        };

        vm.prepareDropDownValues = function() {
            vm.optionsList = {};
            for (var i = 0; i < vm.allOptions.length; i++) {
                var item = vm.allOptions[i];
                if (!(item.preference_id in vm.optionsList))
                    vm.optionsList[item.preference_id] = [];
                vm.optionsList[item.preference_id].push(item);
            }
        };

        vm.setIndexForCurrentElement = function(index) {
            vm.currentIndex = index;
        }

        vm.updatePeferences = function(preferenceValue, preferenceDetails, index) {
            vm.index = index;
            let dataToBeSaved = {};
            if (vm.index === vm.currentIndex && preferenceValue) {
                dataToBeSaved.user_id = user_id;
                dataToBeSaved.preference_id = preferenceDetails.id;
                if (preferenceDetails.type === "option") {
                    dataToBeSaved.option_id = preferenceValue.option_id;
                } else if (preferenceDetails.type === "value") {
                    dataToBeSaved.value = preferenceValue.value;
                }
                PreferenceService.API.UpdatePreference(dataToBeSaved)
                    .then(response => {
                        getPreferencesForUser(user_id);
                        vm.message = "Preference Updated";
                    }).catch(error => {
                        vm.errorMessage = "Unable to update preference";
                        logger.error(error);
                    });
            } else if (vm.index !== vm.currentIndex || !preferenceValue) {
                vm.errorMessage = "Nothing to change";
            }
            $timeout(() => {
                vm.message = null;
                vm.errorMessage = null;
            }, 2500)
        };

        let getPreferencesForUser = function(userId) {
            PreferenceService.API.GetPreferencesByUserId(userId)
                .then(response => {
                    vm.allPreferencesForUser = response.data;
                    vm.storePreferences(vm.allPreferencesForUser);
                }).catch(error => {
                    logger.error(error);
                })
        };

        vm.storePreferences = function(preferencesList) {
            for (var i = 0; i < preferencesList.length; i++) {
                let user_preference = preferencesList[i].preference.replace(new RegExp(' ', 'g'), '.');
                if (preferencesList[i].option_id && !preferencesList[i].value) {
                    SessionMemory.API.Post('user.preference.' + user_preference, preferencesList[i].option);
                } else if (preferencesList[i].value && !preferencesList[i].option_id) {
                    SessionMemory.API.Post('user.preference.' + user_preference, preferencesList[i].value);
                }
            };
        };

        activate();

        function activate() {
            vm.getAllPreferenceList();
            vm.getAllOptionsList();
        }
    }
})();