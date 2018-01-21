// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// // When the extension is installed or upgraded ...
// chrome.runtime.onInstalled.addListener(function() {
//   // Replace all rules ...
//   chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
//     // With a new rule ...
//     chrome.declarativeContent.onPageChanged.addRules([
//       {

//         // That fires when a page's URL contains a 'g' ...
//         conditions: [
//           new chrome.declarativeContent.PageStateMatcher({
//             pageUrl: { urlContains: 'g' },
//           })
//         ],
//         // And shows the extension's page action.
//         actions: [ new chrome.declarativeContent.ShowPageAction() ]
//       }
//     ]);
//   });
// });

var old_url = "";
var banned_websites = ['facebook.com', 'twitter.com', 'instagram.com'];

chrome.tabs.onActivated.addListener(function() {
  check_current_url();
});

chrome.tabs.onUpdated.addListener(function() {
  check_current_url();
});

chrome.windows.onFocusChanged.addListener(function(window) {
    check_current_url();
});

chrome.windows.onCreated.addListener(function(window) {
    check_current_url();
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
        for (key in changes) {
          var storageChange = changes[key];
          if (key == 'toggle' && storageChange.newValue == 'off') {
            chrome.storage.sync.get(['donation_amount', 'charity'], (items) => {
              if (items['donation_amount']) {
                var message = 'You owe ' + items['charity'] + ' ' + items['donation_amount'] + ' cents. Happy studying.';
                alert(message);
                chrome.storage.sync.clear();
              }
            });
          }
        }
      });

function check_current_url() {
  chrome.storage.sync.get(['toggle', 'quantity', 'charity', 'banned'], (items) => {
    var toggle = items['toggle']
    if (toggle == 'off') {
      return;
    }
    else {
      if (!banned_websites.includes(items['banned'])) {
        banned_websites.push(items['banned']);
      }
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function(tabs) {
        var tab = tabs[0];
        var url = tab.url;

        if (check_name(url) && check_name(old_url) != check_name(url)) {
          var quantity = items['quantity'];
          var charity = items['charity'];
          var message = 'You just donated ' + quantity + ' cents to ' + charity + '. Now get back to work.';
          if (!quantity && !charity) {
            message = 'Please set a desired donation amount and charity by clicking on the extension.'
          }
          else if (!quantity) {
            message = 'Please set a desired donation amount by clicking on the extension.'
          }
          else if (!charity) {
            message = 'Please set a desired charity by clicking on the extension.'
          }
          alert(message)
          donate(quantity);
        }
        old_url = url;
      });
    }
  });
}

function check_name(url) {
  for (web in banned_websites) {
    if (url.includes(banned_websites[web])) {
      return banned_websites[web];
    }
  }
  return '';
}

function donate(quantity) {
  chrome.storage.sync.get(['donation_amount', 'quantity'], (items) => {
    var amount = 0;
    if (items['donation_amount']) {
      amount = Number(items['donation_amount']);
    }
    amount = amount + Number(items['quantity']);
    items['donation_amount'] = amount;
    chrome.storage.sync.set(items);
    console.log(amount);
  });
  // Fill in donation payment
}
