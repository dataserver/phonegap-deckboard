(function () {

    function backMain() {
        window.history.back();
    }


    var barcodeScannerOptions = {
        preferFrontCamera: false, // iOS and Android
        showFlipCameraButton: false, // iOS and Android
        showTorchButton: true, // iOS and Android
        torchOn: false, // Android, launch with the torch switched on (if available)
        saveHistory: false, // Android, save scan history (default false)
        prompt: "Place QR code inside the scan area", // Android
        resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
        formats: "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
        //orientation : "portrait",                        // Android only (portrait|landscape), default unset so it rotates with the device
        disableAnimations: true, // iOS
        disableSuccessBeep: false // iOS and Android
    };
    var physicalScreenWidth = window.screen.width * window.devicePixelRatio;
    var physicalScreenHeight = window.screen.height * window.devicePixelRatio;

    function load_panel(url = "") {
        if (url != "") {
            base_server_url = url;
            $("#main").html(`<iframe src="${url}"></iframe>`);
        } else {
            $("#main").html(`<iframe src="qr_error.html"></iframe>`);
        }
    }

    $(".js-scan-qrcode").click(function (e) {
        let target_url = null;

        if (cordova.plugins === undefined) {
            load_panel('http://192.168.15.10/deckboard.php');
        } else {
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    base_server_url = result.text;
                    load_panel(base_server_url);
                },
                function (error) {
                    alert("Scanning failed: " + error);
                },
                barcodeScannerOptions
            );
        }
        $("#reload-link").show();
    });
    

    $(document).on("click", ".js-show-device-info", function (e) {

        let message = `
        physicalScreenWidth: ${physicalScreenWidth}
        <br>
        physicalScreenHeight: ${physicalScreenHeight}
        <br>
        devicePixelRatio : ${window.devicePixelRatio}
        <br>
    `;
        bootbox.alert(message);
    });

    $(document).on("click", ".js-reload", function (e) {
        load_panel(base_server_url);
    });


})(window);