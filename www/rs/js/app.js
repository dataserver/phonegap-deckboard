(function() {

function backMain() {
    window.history.back();
}


var barcodeScannerOptions = {
    preferFrontCamera : false,                       // iOS and Android
    showFlipCameraButton : false,                    // iOS and Android
    showTorchButton : true,                          // iOS and Android
    torchOn: false,                                  // Android, launch with the torch switched on (if available)
    saveHistory: false,                              // Android, save scan history (default false)
    prompt : "Place QR code inside the scan area",   // Android
    resultDisplayDuration: 0,                        // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
    formats : "QR_CODE",                             // default: all but PDF_417 and RSS_EXPANDED
    //orientation : "portrait",                        // Android only (portrait|landscape), default unset so it rotates with the device
    disableAnimations : true,                        // iOS
    disableSuccessBeep: false                        // iOS and Android
};
var physicalScreenWidth = window.screen.width * window.devicePixelRatio;
var physicalScreenHeight = window.screen.height * window.devicePixelRatio;
var server_url = 'https://google.com';


$(".js-scan-qrcode").click(function(e){
    let target_url = null;

    // cordova.plugins.barcodeScanner.scan(
    //     function (result) {
    //         target_url = result.text;
    //     },
    //     function (error) {
    //         alert("Scanning failed: " + error);
    //     },
    //     barcodeScannerOptions
    // );
    // alert(target_url);
    
    $.ajax({
        dataType: "json",
        url: 'http://192.168.15.10/deckboard.php'
    }).done(function(data){
        let panels = data.panel.items;
        if ($('#main-carousel').hasClass('flickity-enabled')) {
            $('#main-carousel').flickity('destroy');
            $('#main-carousel').html('');
        }
        
        for (let index = 0; index < panels.length; index++) {
            const panel = panels[index];

            let columns = panel.columns; // 3 cells per row
            let html = `<table class="table table-borderless"><tr>`;
            let items = panel.items;
            console.log(items);

            // Loop through array and add table cells
            for (var i=0; i<items.length; i++) {
                html += `<td><button class="deck-btn js-deck-action" data-action="${items[i].action}"> ${items[i].id} </button></td>`;

                // If you need to click on the cell and do something
                // html += "<td onclick='FUNCTION()'>" + data[i] + "</td>";
            
                // Break into next row
                var next = i+1;
                if (next%columns==0 && next!=items.length) {
                html += "</tr><tr>";
                }
            }
            html += "</tr></table>";
            $("#main-carousel").append(`<div class="carousel-cell">
            <h3>${panel.title}</h3>
            ${html}</div>
            `);

        }
        $('#main-carousel').flickity({
            // options
            freeScroll: false,
            wrapAround: true,
            prevNextButtons: false
        });
    });
});

$(document).on("click", ".js-show-device-info", function(e){

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


$(document).on("click", ".js-deck-action", function(e){
    let action = $(this).attr("data-action");
    console.log(action);
});



})(window);