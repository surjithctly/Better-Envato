// Show the config file on installation
chrome.runtime.onInstalled.addListener(function(object) {

    if (localStorage.firsttime != 'false' || localStorage.firsttime == 'undefined' || !localStorage.firsttime) {
        var optionsurl = chrome.extension.getURL("options.html");
        chrome.tabs.create({
            url: optionsurl
        }, function(tab) {});

        localStorage.firsttime = false;
    }

    var currentversion = chrome.app.getDetails().version;

    if (!localStorage.version || localStorage.version != currentversion) {
        chrome.browserAction.setBadgeText({
            text: "NEW"
        });
        localStorage.version = currentversion
    }

    //chrome.browserAction.setBadgeBackgroundColor({color:[255, 64, 64, 230]});

});

// Get Local Storage value in Content Script

/*chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getLocalStorage")
      sendResponse({data: localStorage[request.key]});
    else
      sendResponse({}); // snub them.
});
*/

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (message.method) {
        // ...
        case "getLocalStorage":
            if (message.key) { // Single key provided
                sendResponse({
                    data: localStorage[message.key]
                });
            } else if (message.keys) { // An array of keys requested
                var data = {};
                message.keys.forEach(function(key) {
                    data[key] = localStorage[key];
                })
                sendResponse({
                    data: data
                });
            }
            break;
            // ...
    }
});

// Open Opeions Page if clicked on icons
chrome.browserAction.onClicked.addListener(function(tab) { //Fired when User Clicks ICON
    chrome.tabs.create({
        url: "options.html"
    });
    chrome.browserAction.setBadgeText({
        text: ""
    });
});

function updatedSettings() {
    //chrome.runtime.reload();
    location.reload(true);
}

// Test for notification support.
if (window.Notification) {

    if (localStorage.sales_notification != 'false') {
        // While activated, show notifications at the display frequency.
        sales_notification();
        setInterval(function() {
            sales_notification();
        }, 60000);
    }

    if (localStorage.comment_notification != 'false') {
        // While activated, show notifications at the display frequency.
        comment_notification();
        setInterval(function() {
            comment_notification();
        }, 60000);
    }

}

// Sales Notifications
function sales_notification() {

    var username = localStorage.username;
    var personal_token = localStorage.personal_token;
    var earnings = localStorage.earnings;
    var sales_stamp = localStorage.sales_stamp;

    if (typeof username == 'undefined' || typeof personal_token == 'undefined') {
        return false;
    }

    var posturl = 'https://api.envato.com/v1/market/private/user/account.json';

    jQuery.ajax({
        url: posturl,
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + personal_token
        },
        success: function(data) {
            //get current sales
            var new_earnings = data.account.available_earnings;
            var first_name = data.account.firstname;

            // If earning is higher get recent sales

            if (earnings < new_earnings) {

                var posturl_2 = 'https://api.envato.com/v3/market/author/sales';
                jQuery.ajax({
                    url: posturl_2,
                    dataType: 'json',
                    headers: {
                        'Authorization': 'Bearer ' + personal_token
                    },
                    success: function(salesdata) {

                        // get number of sales made while offline
                        var sales_offline;
                        for (var i = 0; i < salesdata.length; i++) {
                            if (salesdata[i].sold_at == sales_stamp) {
                                sales_offline = i;
                            }

                            if (typeof sales_offline === 'undefined') {
                                sales_offline = 'Shit Load of';
                            }
                        }

                        //get current sales
                        var sold_item = salesdata[0].item.name;
                        var item_price = salesdata[0].amount;
                        var sold_at = salesdata[0].sold_at;

                        if (sales_stamp !== sold_at && sales_offline == 1) {
                            show_notification(new_earnings, item_price, first_name, sold_item, 'item');
                            play_sound();

                            localStorage.sales_stamp = sold_at;

                        } else if (sales_stamp !== sold_at) {
                            show_offline_notification(sales_offline);
                            play_sound();
                        }

                    },
                    error: function(salesdata) {
                        response = JSON.parse(salesdata.responseText);
                        console.log("Error: ", salesdata);
                    }
                });
                // end earning scheck ajax request

            }

            // end if earnings

            localStorage.earnings = new_earnings;

        },
        error: function(data) {
            response = JSON.parse(data.responseText);
            console.log("Error: ", data);
        }
    });

}

// Play a sound on new sale
function play_sound() {
    if (localStorage.play_sound != 'false') {
        if ($('#cha-ching').length) $('#cha-ching').remove();
        $('<audio id="cha-ching" autoplay><source src="sound/cha-ching.ogg" type="audio/ogg"></source><source src="sound/cha-ching.mp3" type="audio/mpeg"></source></audio>').appendTo('body');
    }
    return false;
}

/*++++++++++++++++++++++++++++++++++++++++++++++
         SALES NOTIFICACTION
  ++++++++++++++++++++++++++++++++++++++++++++++*/

function show_notification(new_earnings, item_price, first_name, sold_item, item) {

    var praiseArray = ['Woohoo', 'Bravo', 'Wow', 'Ahoy', 'Yay', 'Yikes', 'Hooray', 'Whoa', 'Woot', 'Oh joy', 'Yo!', 'Viola!', 'Holly Molly!', first_name];
    var randomPraise = praiseArray[Math.floor(Math.random() * praiseArray.length)];

    var notification = new Notification(randomPraise + '! New Sale.', {
        icon: 'img/48.png',
        body: 'You just sold ' + sold_item + ' for $' + item_price
    });

    notification.onclick = function() {
        window.open("http://themeforest.net/statement");
    }
    if (localStorage.auto_hide_sales_notification != 'false') {
        setTimeout(function() {
            notification.close()
        }, 15000);
    }

}

/*++++++++++++++++++++++++++++++++++++++++++++++
            OFFLINE SALES NOTIFICACTION
  ++++++++++++++++++++++++++++++++++++++++++++++*/

function show_offline_notification(sales_offline) {

    var praiseArray = ['Woohoo', 'Bravo', 'Wow', 'Ahoy', 'Yay', 'Yikes', 'Hooray', 'Whoa', 'Woot', 'Oh joy', 'Yo!', 'Viola!', 'Holly Molly!'];
    var randomPraise = praiseArray[Math.floor(Math.random() * praiseArray.length)];

    var notification = new Notification(sales_offline + ' New Sales!', {
        icon: 'img/48.png',
        body: randomPraise + ' You just made ' + sales_offline + ' sales while you were away. Keep up the good work.'
    });

    notification.onclick = function() {
        window.open("http://themeforest.net/statement");
    }
    if (localStorage.auto_hide_sales_notification != 'false') {
        setTimeout(function() {
            notification.close()
        }, 15000);
    }

}

/*++++++++++++++++++++++++++++++++++++++++++++++
            COMMENT NOTIFICACTION
  ++++++++++++++++++++++++++++++++++++++++++++++*/

function comment_notification() {

    var username = localStorage.username;
    var last_comment_id = localStorage.new_comment_id;

    $.get('http://themeforest.net/feeds/user_item_comments/' + username + '.atom', function(data) {
        //console.log(data);
        var comment_feed = $.xml2json(data);
        //console.log(comment_feed);
        var comment_id = comment_feed.entry[0].id;
        var comment_id_hash = comment_id.substr(comment_id.lastIndexOf('/') + 1);
        var comment_author = comment_feed.entry[0].author.name;
        var new_comment = /* $(comment_feed.entry[0].content.text).text(); */ comment_feed.entry[0].content.text.replace(/(<([^>]+)>)/ig, "");
        new_comment = new_comment.replace(/\s{2,}/g, ' ');
        var new_comment_item = $.trim(comment_feed.entry[0].title).substring(0, 20).split(" ").slice(0, -1).join(" ") + "...";
        var new_comment_url = comment_feed.entry[0].link.href;
        //console.log(new_comment);

        if (last_comment_id != comment_id && comment_author != username) {
            show_comments(new_comment, new_comment_item, new_comment_url, comment_id_hash);
            localStorage.new_comment_id = comment_id;
            play_notification();
        }

    });

    // Play a sound on new comment
    function play_notification() {
        if (localStorage.comment_sound != 'false') {
            if ($('#comment_sound').length) $('#comment_sound').remove();
            $('<audio id="comment_sound" autoplay><source src="sound/notification.ogg" type="audio/ogg"></source><source src="sound/notification.mp3" type="audio/mpeg"></source></audio>').appendTo('body');
        }
        return false;
    }

    function show_comments(new_comment, new_comment_item, new_comment_url, comment_id_hash) {

        var c_notification = new Notification('New Comment for ' + new_comment_item, {
            icon: 'img/48.png',
            body: new_comment
        });

        c_notification.onclick = function() {
            window.open(new_comment_url + '/' + comment_id_hash);
        }

        if (localStorage.auto_hide_comment_notification != 'false') {
            setTimeout(function() {
                c_notification.close()
            }, 15000);
        }

    }

}
