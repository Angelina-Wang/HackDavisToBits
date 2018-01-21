var old_url = "";
var banned_websites = [];
var encouraging_messages = ['Now get back to work.', 'Your GPA is dropping as you read this. Even if you don\'t have one anymore.',
'What would your loved ones say.', 'Tally ho now.', 'Pip pip and away from this page you go.',
'Why don\'t you try being better?', 'Slow and steady wins the race. You are neither currently so get back to work.',
'Shouldn\'t you be working right now'];
var descriptions = {"The Honeybee Conservancy": "The Honeybee Conservancy is\
 a 501c3 non-profit organization that works to help the bees,\
 while increasing access to organic, sustainable food in under-served\
    communities.",

"Girls Who Code":"Girls Who Code was founded with\
a single mission: to close the gender gap in technology. \
They do so by building supportive communities and providing\
 opportunities to women in tech",

 "Make A Wish": "The Make-A-Wish Foundation is a 501\
 non-profit organization founded in the United States \
 that arranges experiences described as wishes \
 to children with life-threatening medical conditions."
 };

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
                var amount = items['donation_amount'] / 100.0;
                var message = 'You owe ' + items['charity'] + ' $' + amount + ', goodbye now.\n\n' + descriptions[items["charity"]];
                alert(message);
                chrome.storage.sync.clear();
              }
              else {
                var message = 'Goodbye now.';
                alert(message);
                chrome.storage.sync.clear();
              }
            });
          }
        }
      });

function random_message(message_list) {
  var num = message_list.length;
  var index = Math.floor(Math.random() * num);
  return message_list[index];
}

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
          var message = 'You just donated ' + quantity + ' cents to ' + charity + '. ' + random_message(encouraging_messages);
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
  });
}
