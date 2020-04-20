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
    var base_server_url = '';
    var loaded_panels = [];

    function createPromise( index, base_url ) {
        return $.Deferred(function( promise ) {
            $.ajax({
                type: "GET",
                url: base_url,
                success: function (text) {
                    loaded_panels[index] = text;
                    // $("#main-carousel").append(`<div class="carousel-cell"> ${text}</div>`);
                    promise.resolve();
                }
            });
        }).promise();
    }

    function load_panel(url = "") {
        if (url != "") {
            base_server_url = url;
            $.ajax({
                dataType: "json",
                url: url + '/deckpanel.php'
            }).done(function (response) {
                let panels = response.data.items;
                if ($('#main-carousel').hasClass('flickity-enabled')) {
                    $('#main-carousel').flickity('destroy');
                    $('#main-carousel').html('');
                }
                var myPromises = [];
                for (let index = 0; index < panels.length; index++) {
                    myPromises.push( createPromise( index, `${url}/deckpanel.php?panel=${index}`) );
                }
                $.when.apply( null, myPromises ).done( function() {

                    for (let index = 0; index < loaded_panels.length; index++) {
                        const text = loaded_panels[index];
                        $("#main-carousel").append(`<div class="carousel-cell"> ${text}</div>`);
                    }
                    $('#main-carousel').flickity({
                        // options
                        freeScroll: false,
                        wrapAround: true,
                        prevNextButtons: false
                    });
                });
            });

            // $.ajax({
            //     dataType: "json",
            //     url: url + '/deckboard.php'
            // }).done(function (data) {
            //     let panels = data.panel.items;
            //     if ($('#main-carousel').hasClass('flickity-enabled')) {
            //         $('#main-carousel').flickity('destroy');
            //         $('#main-carousel').html('');
            //     }

            //     for (let index = 0; index < panels.length; index++) {
            //         const panel = panels[index];
            //         let items = panel.items;
            //         let html = `<div class="box-wrapper">`;
            //         for (var i = 0; i < items.length; i++) {
            //             html += `<div class="box js-deck-action" data-action="${items[i].action}" data-cmd="${items[i].cmd}"><span class="deck-btn"> ${items[i].html} </span></div>`;
            //         }
            //         html += `</div>`;
            //         $("#main-carousel").append(`<div class="carousel-cell"><h3>${panel.title}</h3> ${html} </div>`);
            //     }

            //     $('#main-carousel').flickity({
            //         // options
            //         freeScroll: false,
            //         wrapAround: true,
            //         prevNextButtons: false
            //     });
            // });
        } else {
            $('#main-carousel').html("URL is empty");
        }
    }

    $(".js-scan-qrcode").click(function (e) {
        let target_url = null;

        if (cordova.plugins === undefined) {
            load_panel('http://192.168.15.10');
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


    $(document).on("click", ".js-deck-action", function (e) {
        let action = $(this).attr("data-action");
        let cmd = $(this).attr("data-cmd");
        console.log(action, cmd);

        $.post(base_server_url + "/deckaction.php", {
            dataType: "json",
            action: action,
            cmd: cmd
        }, function (response, status) {
            bootbox.alert("Data: " + response.data.message + "<br>Status: " + status);
        });
    });



})(window);