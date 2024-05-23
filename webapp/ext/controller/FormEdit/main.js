sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
], function (JSONModel, MessageToast) {
    'use strict';

    return {
        readDocumentData: function (element, index) {
            console.log(element);
            console.log(element.getPath());
            return new Promise((resolve, reject) => {
                let oModel = element.getModel()
                oModel.read(element.getPath(), {
                    success: function (oData, oResponse) {
                        let data = {
                            SalesOrder:   oData.SalesOrder,
                            StartDate:    oData.StartDate,
                            ConfirmDate:  oData.ConfirmDate,
                            SlEdit:       oData.SlEdit,
                            CreationDate: oData.CreationDate
                        }
                        resolve(data)
                    },
                    error: function (error) {
                        reject(error)
                    }
                })
            })
        },
        handleOpenForm: function (that) {
            let oSelectedContext = that.extensionAPI.getSelectedContexts()
            let selectItem = []
            oSelectedContext.forEach((element, index) => {
                selectItem.push(this.readDocumentData(element, index))
            });

            Promise.all(selectItem).then((value) => {
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({ items: value });
                that.getView().setModel(oModel,'getSelected');
                
                let o_edit = that.getView().getModel('OFormEdit');
                o_edit.setProperty('/valuesDate',value[0].StartDate);
                o_edit.setProperty('/valuesCFDateInput',value[0].ConfirmDate);
                o_edit.setProperty('/valuesSLCSInput',Number(value[0].SlEdit) + 1);
                console.log(that.getView().getModel('OFormEdit'));
                console.log();

                if (!that.oMPDialog) {
                    that.oMPDialog = that.loadFragment({
                        id: "FormEdit_1",
                        name: "zpkxndh.ext.fragment.Edit.FormEdit"
                    }).catch(error => {
                        that.busyDialog.close();
                        MessageToast.show('Please reload the page')
                        console.log("error", error);
                    });
                }
    
                that.oMPDialog.then(function (oDialog) {
                    that.oDialog = oDialog;
                    that.oDialog.open();
                    that.busyDialog.close();
                }.bind(that));
            })
        },
        handleCloseDialog: function (that) {
            that.oDialog.close();
        },
    
    }
})