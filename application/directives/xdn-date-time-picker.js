 calculus.directive('mydatepicker', function(SessionMemory) {
     return {
         restrict: 'EA',
         require: 'ngModel',
         replace: true,
         scope: {
             isEffectiveDate: '=',
             isVendorPortal: '=',
             startDate:'=',
             isRcDate: "="
         },
         link: function(scope, element, attrs, ngModelCtrl) {
             $(function() {
                 var format = SessionMemory.API.Get('user.preference.date.format');
                 $.datetimepicker.setDateFormatter({
                     parseDate: function(date, format) {
                         var d = moment(date, format);
                         return d.isValid() ? d.toDate() : false;
                     },

                     formatDate: function(date, format) {

                         return moment(date).format(format);
                     }
                 });

                 $.datetimepicker.setLocale('en');
                 element.datetimepicker({
                     lang: 'en',
                     timepicker: false,
                     format: format,
                     formatDate: format,
                     onShow: function(ct) {
                         var currentDate = moment().format(format);
                         let startDate = null;
                         if (scope.startDate) {
                             startDate = moment().format(scope.startDate);
                         }
                         if (scope.isEffectiveDate !== undefined && scope.isEffectiveDate === true) { // Current Effective Date
                             this.setOptions({ maxDate: currentDate, formatDate: format });
                         } else if(scope.isEffectiveDate !== undefined && scope.isEffectiveDate === false && scope.isVendorPortal !== undefined && scope.isVendorPortal === true){ // Expiry Date
                            this.setOptions({ minDate: currentDate, formatDate: format });
                         } else if (scope.isEffectiveDate !== undefined && scope.isEffectiveDate === false) { // Next Effective Date
                            if (startDate) {
                                this.setOptions({ minDate: startDate, formatDate: format });
                            } else {
                                this.setOptions({ minDate: currentDate, formatDate: format });
                            }
                         }
                         if (startDate) {
                             this.setOptions({ minDate: startDate, formatDate: format });
                         }
                         if (scope.isRcDate) {
                            this.setOptions({ formatDate: format });
                         }

                     },
                     onSelectDate: function(date) {
                         scope.$apply(function() {
                             ngModelCtrl.$setViewValue(date);
                         });
                     }
                 });
             });
         }
     }
 });

 calculus.directive('retaildatepicker', function(SessionMemory) {
     return {
         restrict: 'EA',
         require: 'ngModel',
         replace: true,
         scope: {
             isEffectiveDate: '='
         },
         link: function(scope, element, attrs, ngModelCtrl) {
             $(function() {
                 var format = SessionMemory.API.Get('user.preference.date.format');
                 $.datetimepicker.setDateFormatter({
                     parseDate: function(date, format) {
                         var d = moment(date, format);
                         return d.isValid() ? d.toDate() : false;
                     },

                     formatDate: function(date, format) {

                         return moment(date).format(format);
                     }
                 });

                 $.datetimepicker.setLocale('en');
                 element.datetimepicker({
                     lang: 'en',
                     timepicker: false,
                     format: format,
                     formatDate: format,
                     onShow: function(ct) {
                         var currentDate = moment().add(1, "days").format(format);
                         this.setOptions({ minDate: currentDate, formatDate: format });
                     },
                     onSelectDate: function(date) {
                         scope.$apply(function() {
                             ngModelCtrl.$setViewValue(date);
                         });
                     }
                 });
             });
         }
     }
 });