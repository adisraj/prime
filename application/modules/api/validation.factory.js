function ValidationAPI($resource, API, programNumber) {
	return {
			getRules : function(module,field){
					var FormValidator = API.FormValidator;
					var ValidationRulesList = [];
					/*var ValidationRulesList.newObject = [];*/
					var FormValidatorData = FormValidator.query({name : module ,field: field }, function() {
								var FormData = FormValidatorData.data;								
								for(each in FormData)
								{
										if(FormData[each].rules == "min")
										{
											var MinLength = FormData[each].value;
											var MinMessage = FormData[each].message;
											//ValidationRulesList.push({MinimumLength : MinLength});
											//ValidationRulesList.push({MinimumLengthMessage :MinMessage});
										}
										else if (FormData[each].rules == "max")
										{
											var MaxLength = FormData[each].value;
											var MaxMessage = FormData[each].message;
											//ValidationRulesList.push({MaximumLength : MaxLength});
											//ValidationRulesList.push({MaximumLengthMessage : MaxMessage});
										}
										else if(FormData[each].rules == "req")
										{
											var Req = FormData[each].value;
											var ReqMessage = FormData[each].message;
											//ValidationRulesList.push({RequiredValue : Req});
											//ValidationRulesList.push({RequiredMessage :ReqMessage});
										}
										
								}
								ValidationRulesList.push({"MinimumLength" : MinLength,
														  "MinimumLengthMessage" : MinMessage,
														  "MaximumLength" : MaxLength,
														  "MaximumLengthMessage" : MaxMessage,
														  "RequiredValue": Req ,
														  "RequiredMessage": ReqMessage,
								});
								return ValidationRulesList;
					});
					return ValidationRulesList;
			},
			setProgramNumber : function(parm, scope){
				programNumber.setProgramNumber(parm, scope);
			}			
	}
}
ValidationAPI.$inject = ['$resource', 'API', 'programNumber']
calculus.factory('ValidationAPI', ValidationAPI);

