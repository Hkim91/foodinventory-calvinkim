$(function () {
    'use strict';

    GetAllSales("#tblListingOfSales");
});

function PrepareDataTable(TableToPopulate) {
    if (typeof (TableToPopulate) === 'undefined' || TableToPopulate === null) {
        return false;
    }

    $(TableToPopulate).DataTable({
        "lengthMenu": [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
        "order": [[0, 'asc']],
        "scrollY": '40vh',
        "scrollCollapse": true,
        "language": {
            "decimal": "",
            "emptyTable": "No sales are available",
            "info": "Showing _START_ to _END_ of _TOTAL_ existing sales",
            "infoEmpty": "Showing 0 to 0 of 0 sales",
            "infoFiltered": "(filtered from _MAX_ existing sales)",
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": "Show _MENU_",
            "loadingRecords": "Loading...",
            "processing": "Processing...",
            "search": "Search:",
            "zeroRecords": "No matching sales found",
            "paginate": {
                "first": "First",
                "last": "Last",
                "next": "Next",
                "previous": "Previous"
            },
            "aria": {
                "sortAscending": ": activate to sort column ascending",
                "sortDescending": ": activate to sort column descending"
            }
        },
        "dom": 'lC<"#buttonDisplaySales">frtip',
        "drawCallback": function (settings) {
            'use strict';

            $('#buttonDisplaySales').empty();
            var buttonApplicationHTML = "<input type='button' class='btn btn-sm btn-primary FoodInventoryAddSaleButton' role='button' value='Add'/>"
            $(buttonApplicationHTML).css('margin-left', '10px').hide().appendTo('#buttonDisplaySales').fadeIn();
            $('#buttonDisplaySales').addClass('pull-left');

            InitializeEventHandlers(TableToPopulate);

        },
        "aoColumns": [
        null,
        null,
        null,
        { "bSearchable": false },
        { "bSearchable": false },
        { "bSearchable": false }
        ]
    });
}

function GetAllSales(TableToPopulate) {
    if (typeof (TableToPopulate) === 'undefined' || TableToPopulate === null) {
        return false;
    }

    var dataRetrieval = $.ajax({
        url: FoodInventory.SalesAPIURL,
        type: 'GET',
        dataType: 'json',
        data: {
            id: 0
        }
    });

    dataRetrieval.fail(function (jqXHR, textStatus, errorThrown) {
        'use strict';

        BootstrapDialog.show({
            type: BootstrapDialog.TYPE_DANGER,
            title: 'Problem with Retrieving Sales',
            message: jqXHR.responseText
        });
    });

    dataRetrieval.done(function (data) {
        'use strict';

        if (typeof (data) === 'undefined' || data === null) {
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_WARNING,
                title: 'Unknown Response while Retrieving Sales',
                message: "The server returned an unknown resultset when attempting to retriece the listing of sales."
            });
        }

        if (!$.fn.DataTable.isDataTable(TableToPopulate)) {
            PrepareDataTable(TableToPopulate);
        }

        var dataTableObject = $(TableToPopulate).DataTable();

        dataTableObject.clear();

        var iLength = data.length;
        for (var p = 0; p < iLength; ++p) {
            dataTableObject.row.add([
                data[p].ID,
                moment(data[p].SaleDate).format("MM/DD/YYYY h:mm A"),
                data[p].ProductName,
                data[p].QuantityBought,
                "$" + data[p].Discount.toFixed(2),
                data[p].PaymentType
            ]).draw(false);
        }

        InitializeEventHandlers(TableToPopulate);
    });
}

function InitializeEventHandlers(TableToPopulate) {
    'use strict';

    if (typeof (TableToPopulate) === 'undefined' || TableToPopulate === null) {
        return false;
    }

    $('.FoodInventoryAddSaleButton').off().on('click', function (e) {
        'use strict';
        BootstrapDialog.show({
            type: BootstrapDialog.OK,
            title: 'Add New Sale',
            message: "<div id='containerAddForm'></div>",
            onshown: function (dialog) {
                LoadAddEditForm('#containerAddForm', function () {
                    $('.date-picker').datepicker();
                   
                    $('#txtSaleQuantityBought').mask("#", { reverse: true });
                    $('#txtSaleDiscount').mask("000,000,000,000,000.00", { reverse: true });

                    $('#frmAddEditSale').validate({
                        errorClass: "productError",
                        rules: {
                            txtSaleDate: {
                                required: true,
                                date: true
                            },
                            txtSaleProductName: {
                                required: true
                            },
                            txtSaleQuantityBought: {
                                required: true,
                                number: true
                            },
                            txtSaleDiscount: {
                                number: true
                            }, 
                            txtSalePaymentType: {
                                required: true
                            }
                        },
                        messages: {
                            txtSaleDate: {
                                required: "Please type in a valid date that the sale was conducted."
                            },
                            txtSaleProductName: {
                                required: "Please type in the name of the product purchased."
                            },
                            txtSaleQuantityBought: {
                                required: "Please type in the amount of units purchased for this product.",
                                number: "Please type in a numerical amount for the quantity."
                            },
                            txtSaleDiscount: {
                                number: "Please type in a numerical amount for the quantity. Up to 2 decimal points can be used."
                            }, 
                            txtSalePaymentType: {
                                required: "Please select the type of payment that was used for this sale."
                            }
                        }
                    });
                });
            },
            buttons: [
                {
                    label: 'Save',
                    cssClass: 'btn-primary',
                    icon: 'glyphicon glyphicon-plus',
                    action: function (dialog) {
                        'use strict';
                        var $button = this;

                        $button.spin();
                        //dialog.setClosable(false);

                        $('#frmAddEditSale').validate();

                        if ($('#frmAddEditSale').valid()) {
                            //$button.enable();

                            //Save Sale.

                            var dataToSave = {
                                ID: 0,
                                SaleDate: $('#txtSaleDate').val(),
                                ProductName: $('#txtSaleProductName').val(),
                                QuantityBought: $('#txtSaleQuantityBought').val(),
                                Discount: $('#txtSaleDiscount').val(),
                                PaymentType: $('#txtSalePaymentType').val()
                            }

                            SubmitNewSale(dataToSave, dialog);

                            $button.stopSpin();
                        } else {
                            $button.stopSpin();
                            //Form not valid; user must correct.
                        }
                        //dialog.setClosable(true);
                    }
                },
                {
                    label: 'Cancel',
                    cssClass: 'btn-default',
                    action: function (dialog) {
                        'use strict';
                        dialog.close();
                    }
                }
            ]
        });
    });
}

function LoadAddEditForm(FormContainer, OnFormLoadedCallBack) {
    'use strict';

    if (typeof (FormContainer) === 'undefined' || FormContainer === null) {
        return false;
    }
    var partialLoader = $.ajax({
        url: FoodInventory.SalesAddEditFormURL,
        type: 'GET',
        dataType: 'html'
    });

    partialLoader.fail(function (jqXHR, textStatus, errorThrown) {
        'use strict';

        BootstrapDialog.show({
            type: BootstrapDialog.TYPE_DANGER,
            title: 'Problem with Loading Sale Form',
            message: jqXHR.responseText
        });
    });

    partialLoader.done(function (data, status, xhr) {
        'use strict';
        $(FormContainer).html(data);
        if (typeof (OnFormLoadedCallBack) === "function" && OnFormLoadedCallBack !== null) {
            OnFormLoadedCallBack();
        }
    });
}

function SubmitNewSale(DataFromForm, DialogWindow) {
    'use strict';
    if (typeof (DataFromForm) === 'undefined' || DataFromForm === null) {
        return false;
    }

    if (typeof (DialogWindow) === 'undefined' || DialogWindow === null) {
        return false;
    }

    var saleSubmission = $.ajax({
        url: FoodInventory.SalesAPIURL,
        type: 'POST',
        dataType: 'json',
        cache: false,
        data: DataFromForm
    });

    saleSubmission.fail(function (jqXHR, textStatus, errorThrown) {
        'use strict';

        BootstrapDialog.show({
            type: BootstrapDialog.TYPE_DANGER,
            title: 'Problem with Adding Sale',
            message: jqXHR.responseText
        });

        DialogWindow.close();
    });

    saleSubmission.done(function (data) {
        'use strict';

        BootstrapDialog.show({
            type: BootstrapDialog.TYPE_SUCCESS,
            title: 'Added Sale',
            message: data
        });

        GetAllSales("#tblListingOfSales");

        DialogWindow.close();

    });

    return true;
}