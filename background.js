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

function check_current_url() {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;

    if (check_name(url) && check_name(old_url) != check_name(url)) {
      chrome.storage.sync.get('quantity', (items) => {
        var quantity = items['quantity']
        var message = 'You just donated ' + quantity + ' cents to WOo charity. Now get back to work.'
        alert(message)
        donate(quantity);
      });
    }
    old_url = url;
  });
}

function check_name(url) {
  if (url.includes('facebook')) {
    return 'facebook';
  }
  if (url.includes('twitter')) {
    return 'twitter';
  }
  if (url.includes('instagram')) {
    return 'instagram';
  }
  return '';
}

function donate(quantity) {
  console.log("Donating")
  // Fill in donation payment
}
