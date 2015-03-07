/*
Name: Better Envato
Keywords: make Envato Better
Created by: Surjith S M © 2015-2020
*/
var username, apikey, openexchange, currency, localise_earnings, localise_earnings_table, localise_earnings_page, hide_statement, verify_purchase, create_hrefs;

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
});
*/

chrome.runtime.sendMessage({
        method: "getLocalStorage",
        keys: ["username", "apikey", "openexchange", "currency", "localise_earnings", 'localise_earnings_table', 'localise_earnings_graph', 'hide_statement', 'verify_purchase', 'create_hrefs' ]
    },
    function(response) {
        username                = response.data.username;
        apikey                  = response.data.apikey;
        openexchange            = response.data.openexchange;
        currency                = response.data.currency;
        localise_earnings       = response.data.localise_earnings;
        localise_earnings_table = response.data.localise_earnings_table;
        localise_earnings_page  = response.data.localise_earnings_page;
        hide_statement          = response.data.hide_statement;
        verify_purchase         = response.data.verify_purchase;
        create_hrefs            = response.data.create_hrefs;
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

        $.getJSON(posturl, function(data) {
            earningsdollar = data.account.available_earnings; /*- 3  payoneer commision $3*/
            finalearnings = earningsdollar * convertrate;

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

function convertPrice(unconverted_price, handleData) {
    var conversion_rate, converted_price;

    $.ajax({
        url: 'http://openexchangerates.org/api/latest.json?app_id=' + openexchange,
        success:function(data){
            conversion_rate = data.rates[currency];

            if (currency == 'INR') {
                currency_sign = '₹';
            } else if (currency == 'EUR') {
                currency_sign = '€';
            } else if (currency == 'GBP') {
                currency_sign = '£';
            } else {
                currency_sign = currency;
            }

            converted_price = unconverted_price * conversion_rate;

            if (currency == 'INR') {
                converted_price = currency_sign + ' ' + inr_currency(converted_price.toFixed(2));
            } else {
                converted_price = currency_sign + ' ' + format_currency(converted_price);
            }

            handleData(converted_price);
        }
    });
}

$(document).ready(function() {

    // REMOVE STATEMENTS - AUTHOR FEE
    // CONVERT CURRENCIES

    if (hide_statement != 'false') {
        var pathname        = window.location.pathname;
        var amount          = 0;
        var amount_string   = '';
        var order_id        = 0;
        var next_amount     = '';

        var unconverted, converted, current_object = [], conversion_rate;

        if (pathname.indexOf('statement') > -1) {
            $("#stored_statement").find("tr").each(function(i) {

                if ($(this).find("td").eq(3).find("span").text() == "Author Fee") {

                    order_id        = $(this).find('.statement__order_id').text();
                    amount_string   = $(this).find('.statement__amount').text();
                    amount          = parseFloat(amount_string.substring(1, amount_string.length));
                    next_amount     = $(this).next().find('.statement__amount').text();
                    next_amount     = parseFloat(next_amount.substring(1, next_amount.length));

                    amount          = amount + next_amount;

                    $(this).next().find('.statement__amount').text('$' + amount.toFixed(2));
                    $(this).hide();
                }

                if(localise_earnings_table != 'false') {
                    if (openexchange == 'undefined') {
                        return false;
                    } else {
                        if ($(this).is(':visible')) {
                            current_object[i] = $(this);

                            if (current_object[i].find('td').eq(7).text() != '') {
                                unconverted = current_object[i].find('td').eq(7).text();
                                unconverted = parseFloat(unconverted.substring(1, unconverted.length));

                                converted = convertPrice(unconverted, function(data){
                                    current_object[i].find('td').eq(7).text(data).attr('title', 'Actual Earnings: $' + unconverted);
                                });
                            }
                            if (current_object[i].find('td').eq(8).text() != '') {
                                unconverted = current_object[i].find('td').eq(8).text();
                                unconverted = unconverted.substring(1, unconverted.length);
                                converted = convertPrice(unconverted, function(data){
                                    current_object[i].find('td').eq(8).text(data).attr('title', 'Actual Earnings: $' + unconverted);
                                });
                            }
                        }
                    }
                }
            });
        }
    }

    // CONVERT CURRENCIES IN EARNINGS TAB
    if(localise_earnings_page != 'false') {
        var pathname = window.location.pathname;
        if(pathname.indexOf('/earnings/') > -1) {

            // Generate new graph
            var graph_data = $.parseJSON($('body script[id="graphdata"]').text());
            var current_object, unconverted, converted, data_indexes, counter;
            counter = 0;
            data_indexes = graph_data.datasets[0]['data'].length;

            $.each(graph_data.datasets[0]['data'], function(i, val){
                if(val > 0) {
                    // Localize
                    if (openexchange == 'undefined') {
                        return false;
                    } else {
                        current_object = $(this);
                        unconverted = parseFloat(val);

                        converted = convertPrice(unconverted, function (data) {
                            if (parseFloat(data.replace(/[^0-9\.]/g, '')) > 0) {
                                graph_data.datasets[0]['data'][i] = parseFloat(data.replace(/[^0-9\.]/g, ''));
                                counter++;
                            }
                        });
                    }
                } else {
                    counter++;
                }
            });

            var renderGraph = setInterval(function(){
                if(data_indexes == counter) {
                    $('.-sales').text('Sales Earnings ('+currency+')');

                    var chart_data = {
                        animationEasing: "easeInOutCirc",
                        animationSteps: 60,
                        scaleFontSize: 12,
                        scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                        scaleLabel: "<%=parseFloat(value).toLocaleString('en-EN', {style: 'currency', currency: '"+currency+"', minimumFractionDigits: 2})%>",
                        scaleStartValue: 0,
                        showTooltips: !1,
                        bezierCurve: !1
                    };

                    $(".js-graph__canvas").remove();
                    $('.graph__container').append('<canvas class="graph__canvas js-graph__canvas" width="964" height="300"></canvas>');

                    var canvas = $(".graph__canvas").get(0).getContext('2d');
                    new Chart(canvas).Line(graph_data, chart_data);

                    clearInterval(renderGraph);
                }
            }, 100);

            // Convert headers (This month, balance, total value)
            convertPrice($('.earnings-widget__amount:eq(0)').text().substr(1), function(data){
                $('.earnings-widget__amount:eq(0)').text(data);
            });
            convertPrice($('.earnings-widget__amount:eq(1)').text().substr(1), function(data){
                $('.earnings-widget__amount:eq(1)').text(data);
            });
            convertPrice($('.earnings-widget__amount:eq(2)').text().substr(1), function(data){
                $('.earnings-widget__amount:eq(2)').text(data);
            });

            // Convert prices in table
            $('.table-general tbody, tfoot').find('tr').each(function(index){
                current_object[index] = $(this);
                convertPrice($(this).find('td').eq(2).text().substr(1), function(data){
                    current_object[index].find('td').eq(2).text(data);
                });
            });
        }
    }

    // SHOW LINKS IN REFERRALS PAGE
    if(create_hrefs != 'false') {
        var pathname = window.location.pathname;
        if (pathname.indexOf('/referrals') > -1) {
            var source = '';
            var path = '';
            var url = '';

            var ifTableExists = setInterval(function () {
                if ($('#results').length) {
                    clearInterval(ifTableExists);
                    $('#results').find('tr').each(function () {
                        if ($(this).find('td').eq(1).text() != '(not set)') {
                            source = $(this).find('td').eq(0).text();
                            path = $(this).find('td').eq(1).text();

                            url = '<a href="http://' + source + path + '" target="_blank">' + path + '</a>';

                            $(this).find('td').eq(1).html(url);
                        }
                    });
                }
            }, 100);
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



}); /*End Document Ready*/

var current_url = window.location.pathname;

$(document).click(function() {
    if(window.location.pathname.indexOf('/earnings/') > -1) {
        if (current_url != window.location.pathname) {
            location.reload();
        }
    }
});