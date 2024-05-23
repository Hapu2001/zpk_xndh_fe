sap.ui.define([
    "sap/ui/model/json/JSONModel",
    './FormEdit/main',
    "sap/ui/core/Core",
	"sap/ui/core/library",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    './ErrorDialog/main',
], function (JSONModel, FormEdit, Core, CoreLibrary, MessageBox, Fragment,ErrorDialog) {
    'use strict';
    return {
        _oVHD: null,
        _selectItem: [],
        busyDialog: null,
        oDialog_Error: null,
        onInit: function () {
            let oModel = new JSONModel();
            oModel.setData({
                valuesDate: "",
                valuesCFDateInput:"",
                valuesSLCSInput: "",
            });

            this.getView().setModel(oModel,'OFormEdit');
            this.TitleLevel = CoreLibrary.TitleLevel;
        },
        onExit: function () {
            if (this._oVHD) {
                this._oVHD.destroy();
                this._oVHD = null;
            }
        },
        //-----------T0------------------- Fragment Busy Dialog ------------------------------------------
        openBusyDialog: function () {
            if (!this.busyDialog) {
                Fragment.load({ id: "busyFragment", name: "zpkxndh.ext.fragment.Notify.busy", type: "XML", controller: this }).then((oDialog) => {
                    console.log("oDialog", oDialog)
                    this.busyDialog = oDialog;
                    this.busyDialog.open()
                }).catch(error => {
                    MessageBox.error('Please reload the page')
                });
            } else {
                this.busyDialog.open()
            }
        },

        //-----------T0------------------- FilterBar ------------------------------------------
        onInitSmartFilterBarExtension: function(oEvent){
            var oSmartTable = oEvent.getSource();
            let oToday = new Date();
            let defaultValue = {
                "CreationDate": oToday
                
            };
            oSmartTable.setFilterData(defaultValue);
            console.log(oSmartTable);
        },
       
        //-----------T0------------------- MAIN ------------------------------------------
        handleSave: function () {

        },
        handleChange: function (oEvent) {
          let   ValueState = CoreLibrary.ValueState,
                oDP = oEvent.getSource(),
				bValid = oEvent.getParameter("valid");
			if (bValid) {
				oDP.setValueState(ValueState.None);
			} else {
				oDP.setValueState(ValueState.Error);
			}
		},

        //-----------T0------------------- Fragment Form Edit ------------------------------------------
        handleSaveDialog: async function (oEvent) {
            let that = this;
            let check_error = true;
            let o_edit = this.getView().getModel('OFormEdit');
            let lw_valuesDate        = o_edit.getProperty('/valuesDate');
            let lw_valuesCFDateInput = o_edit.getProperty('/valuesCFDateInput');
            let message_error = undefined;
            let arr_message = [];
            if (!lw_valuesDate) {
                message_error = {
                type: 'Error',
				title: 'Vui lòng điền Ngày bắt đầu sản xuất',
                description: 'Vui lòng điền Ngày bắt đầu sản xuất',
				subtitle: 'Vui lòng điền Ngày bắt đầu sản xuất',
                }
                arr_message.push(message_error);
                check_error = false;
            }
            if (!lw_valuesCFDateInput) {
                message_error = {
                type: 'Error',
				title: 'Vui lòng điền Ngày Hoàn thành',
                description: 'Vui lòng điền Ngày Hoàn thành',
				subtitle: 'Vui lòng điền Ngày Hoàn thành',
                }
                arr_message.push(message_error);
                check_error = false;
            }
            if (!check_error) {
                ErrorDialog.handleErrorDialog(arr_message, this);
            }
            else {
                this.openBusyDialog();
                let o_edit = that.getView().getModel('OFormEdit');
                let body_json = {
                    "Vbeln":that.getView().getModel('getSelected').getProperty('/items/0/SalesOrder'),
                    "Znbdsx": o_edit.getProperty('/valuesDate'),
                    "Znht":o_edit.getProperty('/valuesCFDateInput'),
                    "Zlcs":o_edit.getProperty('/valuesSLCSInput'),
                };
                let url_render =  "https://" + window.location.hostname + "/sap/bc/http/sap/Z_API_XNDH?=";
                const apiGet = async () => {
                    try {
                    const response = await fetch(url_render, {
                        method: 'POST',
                        body: JSON.stringify(body_json),
                        headers: new Headers({'content-type': 'application/json'}),
                    });
                    const myJson = await response.json()
                    console.log('json',myJson)
                    that.busyDialog.close();
                    MessageBox.success("Cập nhập thành công")
                    that.getView().getModel().refresh();
                  } catch (error){
                    console.log('error',error)
                    that.busyDialog.close();
                    MessageBox.success("Tải lại trang")
                  }
                };
                 await apiGet();
                
            }
        },
        handleCloseDialog:function () {
            FormEdit.handleCloseDialog(this);
        },
        handleCreate: function () {
            this.openBusyDialog()
            FormEdit.handleOpenForm(this);
        }
        
    }
})