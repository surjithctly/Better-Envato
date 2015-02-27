/*
Name: Better Envato
Keywords: make Envato Better
Created by: Surjith S M © 2015-2020
*/
var username, apikey, openexchange, currency, localise_earnings, hide_statement;

/*chrome.runtime.sendMessage({method: "getLocalStorage", key: "username"}, function(response) {
  username = response.data;
});

chrome.runtime.sendMessage({method: "getLocalStorage", key: "apikey"}, function(response) {
  apikey = response.data;
});

chrome.runtime.sendMessage({method: "getLocalStorage", key: "openexchange"}, function(response) {
  openexchange = response.data;
});
chrome.runtime.sendMessage({method: "getLocalStorage", key: "currency"}, function(response) {
  currency = response.data;
});
chrome.runtime.sendMessage({method: "getLocalStorage", key: "localise_earnings"}, function(response) {
  localise_earnings = response.data;
});*/


chrome.runtime.sendMessage({
        method: "getLocalStorage",
        keys: ["username", "apikey", "openexchange", "currency", "localise_earnings", 'hide_statement', 'verify_purchase' ]
    },
    function(response) {
        username = response.data.username;
        apikey = response.data.apikey;
        openexchange = response.data.openexchange;
        currency = response.data.currency;
        localise_earnings = response.data.localise_earnings;
        hide_statement = response.data.hide_statement;
        verify_purchase = response.data.verify_purchase;
    }
);


$(document).ready(function() {
    if (localise_earnings != 'false') {
        if (username == 'undefined' || apikey == 'undefined' || openexchange == 'undefined') {
            return false;
        } else {
            dollartToInr();
        }
    }

});

//function for converting string into indian currency format
function inr_currency(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    var z = 0;
    var len = String(x1).length;
    var num = parseInt((len / 2) - 1);

    while (rgx.test(x1)) {
        if (z > 0) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        } else {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
            rgx = /(\d+)(\d{2})/;
        }
        z++;
        num--;
        if (num == 0) {
            break;
        }
    }
    return x1 + x2;
}

// GLOBAL CURRENCY FORMAT
function format_currency(n) {
    return n.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
}

function dollartToInr() {

    var posturl = 'http://marketplace.envato.com/api/edge/' + username + '/' + apikey + '/account.json';
    var earningsdollar, finalearnings, convertrate;

    var conversionurl = 'http://openexchangerates.org/api/latest.json?app_id=' + openexchange;

    // Use jQuery.ajax to get the latest exchange rates, with JSONP:

    $.getJSON(conversionurl, function(data) {
        convertrate = data.rates[currency]; /*  * 0.975 Midmarket rate*/
        //console.log(convertrate);


        $.getJSON(posturl, function(data) {
            earningsdollar = data.account.available_earnings; /*- 3  payoneer commision $3*/
            finalearnings = earningsdollar * convertrate;
            //console.log(finalearnings);

            if (currency == 'INR') {
                currency_sign = '₹';
            } else if (currency == 'EUR') {
                currency_sign = '€';
            } else if (currency == 'GBP') {
                currency_sign = '£';
            } else {
                currency_sign = currency;
            }
			
			if (currency == 'INR') {
            $('.header-logo-account__balance').text(currency_sign + ' ' + inr_currency(finalearnings.toFixed(2))).parent().attr('title', 'Actual Earnings: $' + earningsdollar);
			} else {
            $('.header-logo-account__balance').text(currency_sign + ' ' + format_currency(finalearnings)).parent().attr('title', 'Actual Earnings: $' + earningsdollar);
            }
			
			

        });



    });



}



$(document).ready(function() {

    // REMOVE STATEMENTS - AUTHOR FEE

    if (hide_statement != 'false') {
        var pathname = window.location.pathname;
        if (pathname.indexOf('statement') > -1) {
            $("#stored_statement").find("tr").each(function() {
                if ($(this).find("td").eq(3).find("span").text() == "Author Fee") {
                    $(this).hide();
                }
            });
        }
    }


    // VERIFY PURCHASE

    if (verify_purchase != 'false') {
        var pathname = window.location.pathname;
        if (pathname.indexOf('author_dashboard') > -1) {
            var verify_html_block = '<div class="box--topbar"> <h2>Verify Purchase Code</h2></div><div class="box--hard-top"> <form id="verifypurchase" method="GET"> <fieldset class="vertical-form"> <div class="input-group">  <div class="inputs"> <input type="text" name="purchase_code" id="purchase_code" class="inline" style="width: 60.81967%;" placeholder="Enter Purchase Code here"> <button type="submit" class="btn-icon submit auto-width">Verify Purchase Code</button> </div></div></fieldset></form> <div class="loading"></div></div>';

            //$("#content .content-s").append(verify_html_block);
            $(verify_html_block).insertBefore("#content .content-s .content-s");
            //alert('done');
        }
    }



    $("#verifypurchase").submit(function(e) {
        e.preventDefault();
        var purchase_code = $("#purchase_code");
        var flag = false;
        if (purchase_code.val() == "") {
            purchase_code.focus();
            flag = false;
            return false;
        } else {
            flag = true;
        }
        var item_purchase_code = purchase_code.val();
        $(".loading").fadeIn("slow").html("<p>Please wait...</p>");

        var posturl = 'http://marketplace.envato.com/api/v3/' + username + '/' + apikey + '/verify-purchase:' + item_purchase_code + '.json';

        $.ajax({
            type: 'GET',
            url: posturl,
            data: {
                get_param: 'value'
            },
            dataType: 'json',
            success: function(data) {

                if (data['verify-purchase'].buyer == '' || data['verify-purchase'].buyer == null) {


                    $('.loading').fadeIn('slow').html('<p style="padding-bottom:0; color:#C25B5B;"> Sorry. That was a wrong verification code! </p>');

                } else if (data.code == 'not_authenticated') {
                    $('.loading').fadeIn('slow').html('<p style="padding-bottom:0; color:#C25B5B;"> Sorry. Username and/or API Key is invalid. </p>');
                } else {

                    var buyer = data['verify-purchase'].buyer;
                    var item_name = data['verify-purchase'].item_name;
                    var licence = data['verify-purchase'].licence;
                    var timestamp = data['verify-purchase'].created_at;

                    $('.loading').fadeIn('slow').html('<p style="padding-bottom:0;"><a href="http://themeforest.net/user/' + buyer + '" target="_blank">' + buyer + '</a>  purchased a ' + licence + ' of ' + item_name + ' ' + $.timeago(timestamp) + '</p>');


                }

            },

            error: function(data) {
                $('.loading').fadeIn('slow').html('<p style="padding-bottom:0; color:#C25B5B;"> Sorry. Something went wrong! </p>');
            }

        });

    });



}); /*End Documet Ready*/