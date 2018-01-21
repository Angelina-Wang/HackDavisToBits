// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, (tabs) => {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

// /**
//  * Change the background color of the current page.
//  *
//  * @param {string} color The new background color.
//  */
// function changeDonationAmount(quantity) {
//   // var script = 'document.body.style.backgroundColor="' + color + '";';
//   // See https://developer.chrome.com/extensions/tabs#method-executeScript.
//   // chrome.tabs.executeScript allows us to programmatically inject JavaScript
//   // into a page. Since we omit the optional first argument "tabId", the script
//   // is inserted into the active tab of the current window, which serves as the
//   // default.
//   // chrome.tabs.executeScript({
//   //   code: script
//   // });
//   console.log("Change to: ")
//   console.log(quantity)
// }

/**
 * Gets the saved quantity.
 *
 * @param {string} url URL currently on.
 * @param {function(string)} callback called with the saved quantity for
 *     on success, or a falsy value if no quantity is retrieved.
 */
function getSavedDonationAmount(url, callback) {
  chrome.storage.sync.get('quantity', (items) => {
    callback(chrome.runtime.lastError ? null : items['quantity']);
  });
}

/**
 * Sets the donation amount.
 *
 * @param {string} url currently on.
 * @param {string} quantity The quantity to be donated.
 */
function saveDonationAmount(url, quantity) {
  var items = {};
  items['quantity'] = quantity;
  chrome.storage.sync.set(items);
}

/**
 * Gets the saved quantity.
 *
 * @param {string} url URL currently on.
 * @param {function(string)} callback called with the saved quantity for
 *     on success, or a falsy value if no quantity is retrieved.
 */
function getSavedCharity(url, callback) {
  chrome.storage.sync.get('charity', (items) => {
    callback(chrome.runtime.lastError ? null : items['charity']);
  });
}

/**
 * Sets the donation amount.
 *
 * @param {string} url currently on.
 * @param {string} quantity The quantity to be donated.
 */
function saveCharity(url, charity) {
  var items = {};
  items['charity'] = charity;
  chrome.storage.sync.set(items);
}

// This extension loads the saved quantity if one exists. The user can select a
// new quantity amount from the dropdown and it will be saved as part of the extension's
// isolated storage.
document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl((url) => {
    var dropdown_quantity = document.getElementById('quantity');
    var dropdown_charity = document.getElementById('charity');

    // Load the saved quantity and modify the dropdown
    // value, if needed.
    getSavedDonationAmount(url, (savedQuantity) => {
      if (savedQuantity) {
        //changeDonationAmount(savedQuantity);
        dropdown_quantity.value = savedQuantity;
      }
    });

    getSavedCharity(url, (savedCharity) => {
      if (savedCharity) {
        //changeCharity(savedCharity);
        dropdown_charity.value = savedCharity;
      }
    });

    // Ensure the quantity is changed and saved when the dropdown
    // selection changes.
    dropdown_quantity.addEventListener('change', () => {
      //changeDonationAmount(dropdown.value);
      saveDonationAmount(url, dropdown_quantity.value);
    });

    dropdown_charity.addEventListener('change', () => {
      saveCharity(url, dropdown_charity.value);
    });
  });
});
