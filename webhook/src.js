let address = "";
let message = "";
let pfp = "";
let username = "";
let name = 0;
let working = false;
let status;

function run() {
  update();
  working = true;
  sendRequest();
}

function halt() {
  update();
  working = false;
  status.style.color = "orange";
  status.innerHTML = `status: halted!`;
}

function update() {
  address = document.getElementById('address').value;
  message = document.getElementById('message').value;
  pfp = document.getElementById('pfp').value;
  username = document.getElementById('username').value;
  status = document.getElementById('status');
}

var createCORSRequest = function(method, url) {
        var xhr = new XMLHttpRequest();
        if ("withCredentials" in xhr) {
          // Most browsers.
          xhr.open(method, url, true);
        } else if (typeof XDomainRequest != "undefined") {
          // IE8 & IE9
          xhr = new XDomainRequest();
          xhr.open(method, url);
        } else {
          // CORS not supported.
          xhr = null;
        }
        return xhr;
};

function sendRequest() {

  console.log(`${name} - ${message} - ${pfp}`);
  xhr = createCORSRequest('POST', `${address}`);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  let params = `content=${message}&username=${username+" "+name}&avatar_url=${pfp}`;
  xhr.onload = function () {
    console.log(this.responseText)
    let msg;
    try {
      msg = JSON.parse(this.responseText);
    } catch (e) {
      console.log("No response.");
    }

    if (working) {
      if (msg) {
        if (msg.message == "You are being rate limited.") {
          setTimeout(() => {  sendRequest(); }, (Number(msg.retry_after) + 500));
          console.log("fuckers are ratelimiting us...")
          status.style.color = "red";
          status.innerHTML = `status: ratelimited! (${msg.retry_after}ms)`;
        }
      } else {
         setTimeout(() => {  sendRequest(); }, (1000/document.getElementById('speed').value));
         status.style.color = "green";
         status.innerHTML = `status: running! (${1000/document.getElementById('speed').value}ms)`;
      }
    }
  };
  xhr.send(params);

  name++;
}
