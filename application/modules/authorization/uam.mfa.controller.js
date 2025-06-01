(function() {
    calculus.controller('MFAController', MFAController);

    MFAController.$inject = [
        'common',
        'Logger',
        'MFAService',
        'UserService'


    ];

    function MFAController(
        common,
        Logger,
        MFAService,
        UserService
    ) {
        let vm = this;
        let logger = Logger.getInstance('MFAController');

        vm.isVirtualMfa = false;
        vm.isSummary = false;
        vm.isConfigureMFA = false;
        vm.isVerifyMFA = false;

        vm.loadSummary = () => {
            vm.isSummary = true;
            vm.isConfigureMFA = false;
            vm.isVerifyMFA = false;
        }

        vm.configureMfa = () => {
            vm.isConfigureMFA = true;
            vm.isSummary = false;
            vm.isVerifyMFA = false;
        }

        vm.verifyMfa = () => {
            vm.isVerifyMFA = true;
            vm.isConfigureMFA = false;
            vm.isSummary = false;
        }

        vm.isVerified = function() {
            UserService.API.GetUserById()
                .then(response => {
                    if (response[0].is_mfa_verified === 1) {
                        vm.is_verified = true;
                    } else {
                        vm.is_verified = false;
                    }
                })
                .catch(error => {
                    logger.error(error);
                });
        };

        vm.getMFACode = function() {
            vm.isConfigureMFA = true;
            vm.isSummary = false;
            vm.isVerifyMFA = false;
            MFAService.API.GetQRCode()
                .then(response => {
                    vm.qr_code = response.qrcode;
                    vm.secret = response.secret;
                })
                .catch(error => {
                    logger.error(error);
                });
        };

        vm.verifyQRCode = function(qr_code) {
            let qr_value = qr_code.a + qr_code.b + qr_code.c + qr_code.d + qr_code.e + qr_code.f;
            MFAService.API.VerifyQRCode(qr_value)
                .then(response => {
                    vm.isCodeVerified = true;
                    vm.message = "Verified MFA successfully.";
                })
                .catch(error => {
                    vm.login_mfa_error = true;
                    vm.error = error.data.error;
                    logger.error(error);
                    common.$timeout(() => {
                        vm.login_mfa_error = false;
                    }, 4000);
                });
        };

        vm.refreshMFA = function() {
            MFAService.API.RefreshMFA()
                .then(response => {
                    vm.message = response.data.message;
                })
                .catch(error => {
                    vm.error = error.message;
                });
        };
        vm.goBack = () => {
            common.PreviousState.goToLastState();
        }

    }
})();