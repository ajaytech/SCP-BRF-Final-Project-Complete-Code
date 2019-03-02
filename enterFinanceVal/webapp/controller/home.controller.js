sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("demo.enterFinanceVal.controller.home", {
		onInit: function () {

			var oView = this.getView();
			var oDataModel = new sap.ui.model.json.JSONModel("./model/data.json");

			oView.setModel(oDataModel, "demo_data");

			sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(oView), "oViewHome");

		},
		onSubmit: function () {

			var oData = this.getView().getModel("demo_data");

			var oMonthProj = oData.getData();

			var sMonth = this.getView().byId("monthInput").getSelectedKey();

			//PubNub code
			pubnubDemo.publish({
				message: {
					"n": oMonthProj.n,
					"n1": oMonthProj.n1,
					"n2": oMonthProj.n2

				},
				channel: 'demo_fin'
			});

			//Ajax BRF Calls:
			this.getView().getController().handleAjaxforBRFRepo(oMonthProj, sMonth);
		},

		handleAjaxforBRFRepo: function (oMonthProj, sMonth) {

			$.ajax({
				url: "/bpmrulesrepository/rules-service/rest/v1/xsrf-token",
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function (result, xhr, data) {
					var token = data.getResponseHeader("X-CSRF-Token");
					$.ajax({
						url: "/bpmrulesrepository/rules-service/rest/v1/projects/d89164e135b7433b96a1bfd6ea69ffce/rules/b3c5ad73fb1a40478cf9ad34f0e19170",
						method: "GET",
						async: false,
						headers: {
							"X-CSRF-Token": token
						},
						contentType: "application/json",
						success: function (result, xhr, data) {

							var cell = result.DecisionTable.Cell;
							var rID = 0;

							for (var i = 0; i < cell.length; i++) {
								if (cell[i]["Expression"].search(sMonth) !== -1) {
									rID = parseInt(cell[i]["RowId"]);
									break;
								}
							}

							for (var i = 0; i < cell.length; i++) {

								if (parseInt(cell[i]["RowId"]) === rID && parseInt(cell[i]["ColumnId"]) === 2) {
									cell[i]["Expression"] = oMonthProj.n;

								}
								if (parseInt(cell[i]["RowId"]) === rID - 1 && parseInt(cell[i]["ColumnId"]) === 2) {
									cell[i]["Expression"] = oMonthProj.n1;

								}
								if (parseInt(cell[i]["RowId"]) === rID - 2 && parseInt(cell[i]["ColumnId"]) === 2) {
									cell[i]["Expression"] = oMonthProj.n2;

								}

							}
							result.DecisionTable.Cell = JSON.parse(JSON.stringify(cell));
							if (result.ChangedOn) {
								result.ChangedOn = result.ChangedOn.toString();
							}

							var newRulePayload = JSON.stringify(result);

							$.ajax({
								url: "/bpmrulesrepository/rules-service/rest/v1/projects/d89164e135b7433b96a1bfd6ea69ffce/rules/b3c5ad73fb1a40478cf9ad34f0e19170",
								method: "PUT",
								data: newRulePayload,
								async: false,
								headers: {
									"X-CSRF-Token": token
								},
								contentType: "application/json",
								success: function (result, xhr, data) {

									$.ajax({
										url: "/bpmrulesrepository/rules-service/rest/v1/ruleservices/3249170042334a418b13e953957999cc/activation",
										method: "PUT",
										data: "3249170042334a418b13e953957999cc",
										async: false,
										headers: {
											"X-CSRF-Token": token
										},
										contentType: "application/json",
										success: function (result, xhr, data) {

											sap.m.MessageToast.show("Success in Updation");
										},
										error: function () {
											sap.m.MessageToast.show("Error in Updation");
										}

									});
								},
								error: function () {
									sap.m.MessageToast.show("Error in Updation");
								}

							});

						}

					});

				}

			});

		}

	});
});