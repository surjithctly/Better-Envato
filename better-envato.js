/*
Name: Better Envato
Keywords: Make Envato Better
Created by: Surjith S M © 2015-2020
*/
var username, personal_token, openexchange, currency, localise_earnings, localise_earnings_table, localise_earnings_page, hide_statement, verify_purchase, create_hrefs, old_forum_look, close_iframe_preview, remember_withdraw, show_best_selling_items;
chrome.runtime.sendMessage({
        method: "getLocalStorage",
        keys: ["username", "personal_token", "openexchange", "currency", "localise_earnings", 'localise_earnings_table', 'localise_earnings_page', 'hide_statement', 'verify_purchase', 'create_hrefs', 'hide_earnings', 'old_forum_look', 'close_iframe_preview', 'remember_withdraw', 'show_best_selling_items']
    },
    function(response) {
        username = response.data.username;
        personal_token = response.data.personal_token;
        openexchange = response.data.openexchange;
        currency = response.data.currency;
        localise_earnings = response.data.localise_earnings;
        localise_earnings_table = response.data.localise_earnings_table;
        localise_earnings_page = response.data.localise_earnings_page;
        hide_statement = response.data.hide_statement;
        verify_purchase = response.data.verify_purchase;
        create_hrefs = response.data.create_hrefs;
        hide_earnings = response.data.hide_earnings;
        old_forum_look = response.data.old_forum_look;
        close_iframe_preview = response.data.close_iframe_preview;
        remember_withdraw = response.data.remember_withdraw;
        show_best_selling_items = response.data.show_best_selling_items;
    }
);


$(document).ready(function() {

    if (personal_token == 'undefined' || personal_token == "" || personal_token == "null") {
        console.log('%c Better Envato : Please add Envato API Token to make this plugin work.', 'color:red; font-weight:bold; font-size:18px;')
    }

    if (localise_earnings != 'false') {
        if (username == 'undefined' || personal_token == 'undefined' || openexchange == 'undefined') {
            return false;
        } else {
            dollartToInr();
        }
    }


});

/* SAMPLE NEW API CALL */

/*

        jQuery.ajax({
            url: posturl,
            dataType: 'json',
            headers: {
                'Authorization': 'Bearer ' + personal_token
            },
            success: function(data) {
               
            },
            error: function(data) {
                response = JSON.parse(data.responseText);
                console.log("Error: ", data);
            }
        });



*/

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
    var posturl = 'https://api.envato.com/v1/market/private/user/account.json';
    var earningsdollar, finalearnings, convertrate;
    var conversionurl = 'https://openexchangerates.org/api/latest.json?app_id=' + openexchange;

    // Use jQuery.ajax to get the latest exchange rates, with JSONP:
    $.getJSON(conversionurl, function(data) {
        convertrate = data.rates[currency]; /*  * 0.975 Midmarket rate*/

        jQuery.ajax({
            url: posturl,
            dataType: 'json',
            headers: {
                'Authorization': 'Bearer ' + personal_token
            },
            success: function(data) {
                earningsdollar = data.account.available_earnings; /*- 3  payoneer commision $3*/
                finalearnings = earningsdollar * convertrate;
                if (currency == 'INR') {
                    currency_sign = '₹';
                } else if (currency == 'EUR') {
                    currency_sign = '€';
                } else if (currency == 'GBP') {
                    currency_sign = '£';
                } else if (currency == 'TRY' {
                    currency_sign = '₺';
                } else {
                    currency_sign = currency;
                }
                if (currency == 'INR') {
                    $('.global-header-menu ul li:last-child > a.global-header-menu__link span:last-child').text(currency_sign + ' ' + inr_currency(finalearnings.toFixed(2))).parent().attr('title', 'Actual Earnings: $' + earningsdollar);
                } else {
                    $('.global-header-menu ul li:last-child > a.global-header-menu__link span:last-child').text(currency_sign + ' ' + format_currency(finalearnings)).parent().attr('title', 'Actual Earnings: $' + earningsdollar);
                }
            },
            error: function(data) {
                response = JSON.parse(data.responseText);
                console.log("Error: ", data);
            }
        });

    });
}

function convertPrice(unconverted_price, handleData) {
    var conversion_rate, converted_price;
    if ($.type(unconverted_price) === 'string') {
        unconverted_price = unconverted_price.replace(/[^0-9\.]/g, '');
    }
    $.ajax({
        url: 'https://openexchangerates.org/api/latest.json?app_id=' + openexchange,
        success: function(data) {
            conversion_rate = data.rates[currency];
            if (currency == 'INR') {
                currency_sign = '₹';
            } else if (currency == 'EUR') {
                currency_sign = '€';
            } else if (currency == 'GBP') {
                currency_sign = '£';
            } else if (currency == 'TRY') {
                currency_sign = '₺';
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
    // TODO : SUPPORT PACKS LAUNCHED NEED RE_WORK
    /*  if (hide_statement != 'false') {
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
      } */

    /* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                        CONVERT CURRENCIES IN EARNINGS TAB    
       ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    if (localise_earnings_page != 'false') {
        var pathname = window.location.pathname;
        if (pathname.indexOf('/earnings/') > -1) {
            // Generate new graph
            var graph_data = $.parseJSON($('body script[id="graphdata"]').text());
            var current_object, unconverted, converted, data_indexes, counter;
            counter = 0;
            data_indexes = graph_data.datasets[0]['data'].length;
            $.each(graph_data.datasets[0]['data'], function(i, val) {
                if (val > 0) {
                    // Localize
                    if (openexchange == 'undefined') {
                        return false;
                    } else {
                        current_object = $(this);
                        unconverted = parseFloat(val);
                        converted = convertPrice(unconverted, function(data) {
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
            var renderGraph = setInterval(function() {
                if (data_indexes == counter) {
                    $('.-sales').text('Sales Earnings (' + currency + ')');
                    var chart_data = {
                        animationEasing: "easeInOutCirc",
                        animationSteps: 60,
                        scaleFontSize: 12,
                        scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                        scaleLabel: "<%=parseFloat(value).toLocaleString('en-EN', {style: 'currency', currency: '" + currency + "', minimumFractionDigits: 2})%>",
                        scaleStartValue: 0,
                        showTooltips: !1,
                        bezierCurve: !1
                    };
                    $(".js-graph__canvas").remove();
                    $('.graph__container .box').append('<canvas class="graph__canvas js-graph__canvas" width="620" height="350"></canvas>');
                    var canvas = $(".graph__canvas").get(0).getContext('2d');
                    new Chart(canvas).Line(graph_data, chart_data);
                    clearInterval(renderGraph);
                }
            }, 100);
            // Convert headers (This month, balance, total value)
            convertPrice($('.earnings-widget__amount:eq(0)').text().substr(1), function(data) {
                $('.earnings-widget__amount:eq(0)').text(data);
            });
            convertPrice($('.earnings-widget__amount:eq(1)').text().substr(1), function(data) {
                $('.earnings-widget__amount:eq(1)').text(data);
            });
            convertPrice($('.earnings-widget__amount:eq(2)').text().substr(1), function(data) {
                $('.earnings-widget__amount:eq(2)').text(data);
            });
            // Reduce font size to avoid design breakage in local currency
            $('.earnings-widget__amount').css('font-size', '30px');
            // Convert prices in table
            if (pathname.indexOf('/earnings/sales') > -1) {
                $('.table-general tbody, tfoot').find('tr').each(function(index) {
                    current_object[index] = $(this);
                    convertPrice($(this).find('td').eq(2).text().substr(1), function(data) {
                        current_object[index].find('td').eq(2).text(data);
                    });
                });
            } else if (pathname.indexOf('/earnings/referrals') > -1) {
                $('.table-general tbody, tfoot').find('tr').each(function(index) {
                    current_object[index] = $(this);
                    convertPrice($(this).find('td').eq(4).text().substr(1), function(data) {
                        current_object[index].find('td').eq(4).text(data);
                    });
                    convertPrice($(this).find('td').eq(5).text().substr(1), function(data) {
                        current_object[index].find('td').eq(5).text(data);
                    });
                });
            }
        }
    }

    /* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                            SHOW LINKS IN REFERRALS PAGE
       ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    if (create_hrefs != 'false') {
        var pathname = window.location.pathname;
        if (pathname.indexOf('/referrals') > -1) {
            var source = '';
            var path = '';
            var url = '';
            var ifTableExists = setInterval(function() {
                if ($('#results').length) {
                    clearInterval(ifTableExists);
                    $('#results').find('tr').each(function() {
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

    /* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                                VERIFY PURCHASE CODE
       ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    if (verify_purchase == 'true') {
        var pathname = window.location.pathname;
        if (pathname.indexOf('author_dashboard') > -1) {
            var verify_html_block = '<div class="box--topbar"> <h2>Verify Purchase Code <small class="pull-right">Better Envato</small></h2></div><div class="box--hard-top"> <form id="verifypurchase" method="GET"> <fieldset class="vertical-form"> <div class="input-group">  <div class="inputs"> <input type="text" name="purchase_code" id="purchase_code" class="inline" style="width: 60.81967%;" placeholder="Enter Purchase Code here"> <button type="submit" class="btn-icon submit auto-width">Verify Purchase Code</button> </div></div></fieldset></form> <div class="loading"></div></div>';
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
        jQuery.timeago.settings.allowFuture = true;
        var posturl = 'https://api.envato.com/v3/market/author/sale?code=' + item_purchase_code;
        $.ajax({
            type: 'GET',
            url: posturl,
            data: {
                get_param: 'value'
            },
            dataType: 'json',
            headers: {
                'Authorization': 'Bearer ' + personal_token
            },
            success: function(data) {
                if (data.buyer == '' || data.buyer == null) {
                    $('.loading').fadeIn('slow').html('<p style="padding-bottom:0; color:#C25B5B;"> Sorry. That was a wrong verification code! </p>');
                } else if (data.error == '404') {
                    $('.loading').fadeIn('slow').html('<p style="padding-bottom:0; color:#C25B5B;"> Sorry. Username and/or API Key is invalid. </p>');
                } else {
                    var buyer = data.buyer;
                    var item_name = data.item.name;
                    var licence = data.license;
                    var timestamp = data.sold_at;
                    var support_amt = data.support_amount;
                    var support_expire = data.supported_until;
                    $('.loading').fadeIn('slow').html('<p style="padding-bottom:0;"><a href="http://themeforest.net/user/' + buyer + '" target="_blank">' + buyer + '</a>  purchased a ' + licence + ' of ' + item_name + ' ' + $.timeago(timestamp) + '</p> <p> <strong>Support</strong>:  Amount: ' + support_amt + ', Supported until: ' + $.timeago(support_expire) + '</p>');
                }
            },
            error: function(data) {
                $('.loading').fadeIn('slow').html('<p style="padding-bottom:0; color:#C25B5B;"> Sorry. Something went wrong! </p>');
            }
        });
    });

    /* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                          REMEMBER TO WITHDRAW EARNINGS
       ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    /*
     * Inspired from Dashboard Plus by @dtbaker. 
     * Thank you sir. 
     */



    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    }



    if (remember_withdraw == 'true') {

        var d = new Date(),
            currentYear = d.getFullYear(),
            currentMonth = d.getMonth(),
            lastday = new Date(currentYear, currentMonth + 1, 0),
            dateleft = parseInt((lastday - d) / (24 * 3600 * 1000));


        checkDateRemind();

        function checkDateRemind() {
            if (dateleft <= 2) {


                var is_withdraw_remind_shown = getCookie('withdraw_reminder');

                if (!is_withdraw_remind_shown) {

                    var pathname = window.location.pathname;
                    if (pathname.indexOf('author_dashboard') > -1) {
                        var verify_html_block = '<div id="be-reminder" class="e-alert-box -type-alert"> <div class="e-alert-box__icon"> <i class="e-icon -icon-flag"></i> </div> <div class="e-alert-box__message">';
                        verify_html_block += ' <p class="t-body -size-m h-remove-margin"><strong>Better Envato Reminder</strong> <br><br> ';
                        verify_html_block += 'You have only two days left to withdraw earnings for this month. So please don\'t forgot and make it early as possible. Click the button below to hide this message. </p> ';
                        verify_html_block += ' <p><a href="javascript:" class="e-btn reminder_close">Okay. Got it.</a></p> </div> </div>';
                        //verify_html_block += ' <style> .reminder_close {float:right;  padding: 0 5px;  line-height: 1;} </style>';

                        //$("#content .content-s").append(verify_html_block);
                        $(verify_html_block).insertBefore("#content .content-s .content-s");
                        //alert('done');
                    }
                }

                $('.reminder_close').on('click', function() {
                    $('#be-reminder').fadeOut();
                    setCookie('withdraw_reminder', 'shown', 3);
                });

            }

        }
    }

    /* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                               Author Dashboard NOtification
       ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    var last_notification = localStorage.last_notification;

    if (typeof localStorage.last_notification == 'undefined') {
        last_notification = 0;
    }

    function auth_notifications() {
        var pathname = window.location.pathname;
        if (pathname.indexOf('author_dashboard') > -1) {

            var posturl = 'https://raw.githubusercontent.com/surjithctly/Better-Envato/master/notification.json?';
            $.ajax({
                type: 'GET',
                url: posturl,
                dataType: 'json',
                success: function(data) {
                    if (data.success == true) {
                        var n_id = data.auth_notification_id;
                        var n_content = data.auth_notification_content;
                        console.log('Notification Fetched');
                        if (n_id > last_notification) {
                            insertNotification(n_id, n_content);
                        }
                    } else {
                        console.log('Error Fetching new notifications');
                    }
                },
                error: function(data) {
                    console.log('Ajax Error');
                }
            });


        }
    }

    function insertNotification(id, content) {
        console.log(id);
        console.log(content);
        var nofitication_html_block =
            '<div class="box--highlight-yellow better-envato-notify" data-notification-id="' + id + '">  <a class="box__dismisser" href="#">Close</a><h4 class="box__heading">Better Envato Notification</h4>\
    <hr class="hr-light"><div class="new-typography">' + content + '</div></div>';
        $("#content .content-s:eq(0)").prepend(nofitication_html_block);

        $('.better-envato-notify .box__dismisser').on('click', function() {
            $('.better-envato-notify').fadeOut();
            localStorage.last_notification = id;
        });

    }
    auth_notifications();


    /* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                               Hide Author Earnings
       ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    if (hide_earnings == 'true') {
        $('.global-header-menu ul li:last-child > a.global-header-menu__link span:last-child').hide();
    }

    /* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                                    OLD FORUM LOOK 
       ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    if (old_forum_look == 'true') {
        var pathname = window.location.href;
        if (pathname.indexOf('forums.envato') > -1) {

            // DomChange Function
            var observeDOM = (function() {
                var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
                    eventListenerSupported = window.addEventListener;
                return function(obj, callback) {
                    if (MutationObserver) {
                        // define a new observer
                        var obs = new MutationObserver(function(mutations, observer) {
                            if (mutations[0].addedNodes.length || mutations[0].removedNodes.length)
                                callback();
                        });
                        // have the observer observe foo for changes in children
                        obs.observe(obj, {
                            childList: true,
                            subtree: true
                        });
                    } else if (eventListenerSupported) {
                        obj.addEventListener('DOMNodeInserted', callback, false);
                        obj.addEventListener('DOMNodeRemoved', callback, false);
                    }
                }
            })();

            // insert styles
            var link = document.createElement('link');
            link.href = chrome.extension.getURL('css/forums.css');
            link.rel = 'stylesheet';
            document.documentElement.insertBefore(link, null);

            // Cut URL Part
            function cutUrl(str) {
                var matched = str.match(/([^/]*\/){4}/);
                return matched ? matched[0] : str /* or null if you wish */ ;
            }
            var poster_avatar,
                poster_avatar_big,
                last_reply_avatar,
                last_reply_avatar_med,
                started_by_name,
                last_reply_name,
                started_by_url,
                last_reply_url;
            //$('.topic-list thead tr').prepend('<th>Avatar</th>')
            function showAvatars(thisObj) {
                if ($('#main-outlet .topic-list .posters').length > 0) {
                    poster_avatar = $('.posters a:first-child img', thisObj).attr('src');
                    poster_avatar_big = poster_avatar.replace(/25|120/g, '80');
                    last_reply_avatar = $('.posters .latest img', thisObj).attr('src');
                    last_reply_avatar_mid = last_reply_avatar.replace(/25|120/g, '40');
                    started_by_name = $('.posters a:first-child', thisObj).data('user-card');
                    last_reply_name = $('.posters .latest', thisObj).data('user-card');
                    started_by_url = cutUrl($('.main-link .title', thisObj).attr('href'));
                    last_reply_url = $('.activity a', thisObj).attr('href');
                    $('.main-link', thisObj).prepend('<div class="thread_thumbs"><img width="80" height="80" src="' + poster_avatar_big + '" class="thread-started-by"><img width="40" height="40" src="' + last_reply_avatar_mid + '" class="thread-last-reply"></div>');
                    if ($(".topic-post-badges", thisObj).length) {
                        $(".main-link .topic-post-badges", thisObj).after('<div class="thread-quick-links"></div>');
                    } else {
                        $(".main-link .title", thisObj).after('<div class="thread-quick-links"></div>');
                    }
                    $('.thread-quick-links', thisObj).append('<div><a href="' + started_by_url + '">Started</a> by ' + started_by_name + '</div><div> <a href="' + last_reply_url + '">Last reply</a> by ' + last_reply_name + '</div>')
                    $('.topic-list-item').addClass('old-forum-loaded');
                }
            }

            setTimeout(function() {
                $('.topic-list-item').each(function() {
                    showAvatars($(this));
                });
            }, 1000)

            setTimeout(function() {
                observeDOM(document.getElementById('main-outlet'), function() {

                    $('.topic-list-item').not('.old-forum-loaded').each(function() {
                        showAvatars($(this));
                    });

                });

            }, 1000)

            /*
             * Beautify Post pages to make it look like old forums
             * Credit @Webcreations907
             */

            function BeautifyPostPage() {

                $('.ember-view.topic-post:not(.rendered)').each(function() {

                    if ($(this).has('.small-action:not(.time-gap)').length > 0) {
                        return;
                    }
                    var userImg = $(this).find('article .row .topic-avatar .avatar');

                    userImg.attr('src', userImg.attr('src').replace('/45/', '/80/'));
                    userImg.attr('width', 80).attr('height', 80);

                    $(this).addClass('rendered');

                    // badges
                    var badges = '',
                        userName = userImg.parent().attr('data-user-card');

                    $.getJSON("https://forums.envato.com/user-badges/" + userName + ".json", function(data) {
                        if (data.badges.length > 0) {
                            $.each(data.badges, function(i, userBadge) {
                                badges += '<a href="https://forums.envato.com/badges/' + userBadge.id + '/x" target="_blank">'
                                badges += '<img src="' + userBadge.image + '" title="' + userBadge.name + '" class="user-badges"/>';
                                badges += '</a>'
                            });
                            userImg.parents('.topic-avatar').append('<div class="topic-badges">' + badges + '</div>');

                            if (data.badges.length > 4) {
                                var moreText = (data.badges.length - 4) + '+ more';
                                userImg.parents('.topic-avatar').append('<a href="#" class="expand-badges">' + moreText + '</a>')
                            }
                        }
                    });

                    //Add Quick links, portfolio, topics,etc
                    userImg.parents('.topic-avatar').wrapInner('<div class="contents"></div>');
                    userImg.parents('.topic-avatar .contents').append('<div class="user-quick-links-avatar"><div class="inner-quick-links"></div></div>');
                    userImg.parents('.topic-avatar').find('.inner-quick-links').append('<a class="user-portfolio-link" href="http://themeforest.net/user/' + userName + '" title="View ' + userName + '\'s Portfolio" target="_blank">' + userName + '</a>');
                    userImg.parents('.topic-avatar').find('.inner-quick-links').append('<a href="https://forums.envato.com/users/' + userName + '/activity/posts">Recent Posts</a>');
                    userImg.parents('.topic-avatar').find('.inner-quick-links').append('<a href="https://forums.envato.com/users/' + userName + '/activity/topics">Threads Started</a>');
                });

            }

            setTimeout(function() {
                BeautifyPostPage();
            }, 1000)

            setTimeout(function() {
                var renderTimer;
                $('#main-outlet').bind('DOMSubtreeModified', function(e) {
                    if ($('.topic-list-item:not(.rendered)').length > 0 || $('.ember-view.topic-post:not(.rendered)').length > 0) {
                        clearTimeout(renderTimer);
                        renderTimer = setTimeout(function() {
                            BeautifyPostPage();
                        }, 2); //2? seems to work though :)
                    }
                });

                $('#main-outlet').on('click', '.expand-badges', function(e) {
                    e.preventDefault();
                    $(this).parent().find('.topic-badges').css('height', 'auto');
                    $(this).remove();
                });

            }, 1000)

            /*End Post Page*/

        } /*end pathname fn*/
    } /*end if old forum*/



    /* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                         Auto Close Item Preview Frame
       ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    if (close_iframe_preview == 'true') {
        //do this
        checkPreviewURL();

        function checkPreviewURL() {
            var pathname = window.location.pathname;
            if (pathname.indexOf('/full_screen_preview/') > -1) {
                var originalpath = $('body > iframe').attr('src');
                removeiframe(originalpath);
            }
        }

        function removeiframe(originalpath) {
            top.location.replace(originalpath);
        }
    }

    /* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                         Show Best Selling Items in the HomePage
       ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    if (show_best_selling_items == 'true') {

        var isHomepage = window.location.pathname;

        if (isHomepage == '/') {
            showBestSelling();
        }


        // Show Best Selling Items in Homepage

        function showBestSelling() {

            var currentsiteURL = window.location.hostname;

            var searchPostURL = 'https://api.envato.com/v1/discovery/search/search/item?site=' + currentsiteURL + '&date=this-week&page_size=30&sort_by=sales';

            jQuery.ajax({
                url: searchPostURL,
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + personal_token
                },
                success: function(data) {
                    //console.log(data);

                    var BestSellingResultsHTML = '<section class="page-section -color-grey -border-top -border-bottom" id="BestSellingResultsHTML"> <div class="grid-container">';
                    BestSellingResultsHTML += '<div class="home-section"> <div class="home-section__header"> <h2 class="t-heading -size-l -margin-none"> ';
                    BestSellingResultsHTML += '<span>Hot New Items</span></h2> <p class="t-body">This feature is provided by Better Envato Chrome Extension</p></div>';
                    BestSellingResultsHTML += '<div class="home-section__control"> <a href="/search?date=this-week&page=2&price_max=&price_min=&rating_min=&referrer=search&sales=&sort=sales&term=&utf8=✓&view=list" class="e-btn--3d">View More</a> </div><div>';
                    BestSellingResultsHTML += '<div class="home-section__item-thumbnail-carousel"> <div data-view="productList"> <ul class="item-thumbnail-carousel--row-10 overthrow">';

                    $.each(data.matches, function(i, value) {
                        /// do stuff
                        // console.log(data.matches[i].name + ', ' + data.matches[i].id);

                        var iconURL;
                        if (data.matches[i].previews.icon_with_landscape_preview) {
                            iconURL = data.matches[i].previews.icon_with_landscape_preview.icon_url;
                        } else if (data.matches[i].previews.icon_with_video_preview) {
                            iconURL = data.matches[i].previews.icon_with_video_preview.icon_url;
                        } else if (data.matches[i].previews.icon_with_thumbnail_preview) {
                            iconURL = data.matches[i].previews.icon_with_thumbnail_preview.icon_url;
                        } else if (data.matches[i].previews.icon_with_square_preview) {
                            iconURL = data.matches[i].previews.icon_with_square_preview.icon_url;
                        } else if (data.matches[i].previews.icon_with_audio_preview) {
                            iconURL = data.matches[i].previews.icon_with_audio_preview.icon_url;
                        }

                        var previewURL;
                        if (data.matches[i].previews.landscape_preview) {
                            previewURL = data.matches[i].previews.landscape_preview.landscape_url;
                        } else if (data.matches[i].previews.icon_with_video_preview) {
                            previewURL = data.matches[i].previews.icon_with_video_preview.landscape_url;
                        } else if (data.matches[i].previews.icon_with_thumbnail_preview) {
                            previewURL = data.matches[i].previews.icon_with_thumbnail_preview.thumbnail_url;
                        } else if (data.matches[i].previews.icon_with_square_preview) {
                            previewURL = data.matches[i].previews.icon_with_square_preview.square_url;
                        }

                        var priceCents = '';

                        if (data.matches[i].price_cents) {
                            priceCents = data.matches[i].price_cents.toString().slice(0, -2);
                        }

                        var previewClassname;

                        if (currentsiteURL == 'photodune.net') {
                            previewClassname = 'smart-image-magnifier';
                        } else if (currentsiteURL == '3docean.net' || currentsiteURL == 'graphicriver.net') {
                            previewClassname = 'square-image-magnifier';
                        } else if (currentsiteURL == 'audiojungle.net') {
                            previewClassname = 'tooltip-magnifier';
                        } else {
                            previewClassname = 'landscape-image-magnifier';
                        }


                        BestSellingResultsHTML += ' <li class="item-thumbnail-container ">';
                        BestSellingResultsHTML += '  <div class="item-thumbnail__image">';
                        BestSellingResultsHTML += ' <a href="' + data.matches[i].url + '" class="js-google-analytics__list-event-trigger">';
                        BestSellingResultsHTML += ' <img alt="' + data.matches[i].name + '" border="0" class="' + previewClassname + ' preload no_preview" data-item-author="' + data.matches[i].author_username + '" data-item-category="' + data.matches[i].classification + '" data-item-cost="' + priceCents + '" data-item-id="' + data.matches[i].id + '" data-item-name="' + data.matches[i].name + '" data-preview-height="" data-preview-url="' + previewURL + '" data-preview-width="" height="80" src="' + iconURL + '" title="" width="80" data-tooltip="' + data.matches[i].name + '"></a>';
                        BestSellingResultsHTML += '  </div>';
                        BestSellingResultsHTML += '<p class="be-sales-text">' + data.matches[i].number_of_sales + ' sales</p>';
                        BestSellingResultsHTML += ' </li>';


                    });



                    BestSellingResultsHTML += '</ul> </div></div><div class="home-section__pagination be_paginate " id="BestSellingPaginate"> <a href="#" class="be_active" data-url="1">Page 2</a> ';
                    BestSellingResultsHTML += '<a href="#" class="js-remote" data-url="2">Page 2</a> ';
                    BestSellingResultsHTML += '<a href="#" class="js-remote" data-url="3">Page 3</a> ';
                    BestSellingResultsHTML += '</div></div></div></div></section>';

                    $('#content section:nth-last-child(4)').before(BestSellingResultsHTML);

                    $("#BestSellingResultsHTML li.item-thumbnail-container ").slice(10, 30).addClass("be_not_visible");

                    $('#BestSellingPaginate a').on('click', function(e) {
                        e.preventDefault();
                        $('#BestSellingPaginate a').removeClass('be_active');
                        $(this).addClass('be_active');

                        $("#BestSellingResultsHTML li.item-thumbnail-container").removeClass('be_not_visible');

                        if ($(this).data('url') == '1') {
                            $("#BestSellingResultsHTML li.item-thumbnail-container ").slice(10, 30).addClass("be_not_visible");
                        } else if ($(this).data('url') == '2') {
                            $("#BestSellingResultsHTML li.item-thumbnail-container ").slice(0, 10).addClass("be_not_visible");
                            $("#BestSellingResultsHTML li.item-thumbnail-container ").slice(20, 30).addClass("be_not_visible");
                        } else if ($(this).data('url') == '3') {
                            $("#BestSellingResultsHTML li.item-thumbnail-container ").slice(0, 20).addClass("be_not_visible");
                        }
                        return false
                    });



                },
                error: function(data) {
                    response = JSON.parse(data.responseText);
                    console.log("Error: ", data);
                }
            });



        }


    }

    /*--------------*/

}); /*End Document Ready*/

var current_url = window.location.pathname;
$(document).click(function() {
    if (window.location.pathname.indexOf('/earnings/') > -1) {
        if (current_url != window.location.pathname) {
            location.reload();
        }
    }
});








/*=========================================================================*/
// Unshorten
/*=========================================================================*/


// $(document).ready(function(){


// var pathname = window.location.pathname;
// if (pathname.indexOf('author_dashboard') > -1 ) {

//     $('.sidebar-right .box--hard-top').each(function(){
//       //alert($(this).text());
//         if ($(this).text().indexOf('New') > -1 ) {
//             $(this).addClass('newIteminQueue');
//         }  
//     });

//     var tests = [
//     'http://t.co/NJwI2ugt', 
//   'http://bit.ly/1pa4XTq',
//     'http://www.google.com' //nothing should happen
// ];



// for(i in tests) {

//   var unshortAPI = 'RP8A5XStUi0fY6PAPP6MChFteFJBr1Z3'


//     var data = {
//         shortURL: tests[i],
//         responseFormat: 'json',
//          apiKey: unshortAPI,
//          return:'domainonly'
//     };

//     $.ajax({
//         dataType: 'json',
//         url: 'http://api.unshorten.it',
//         data: data,
//         success: function(response) {
//             //$('#output').append(response +'<br>');
//             console.log(response)
//         }

//     }); 

// }

// }


// });
