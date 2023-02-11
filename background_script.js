let jwttoken = "";
let data = {};
let token_name = "_octo";
try {
  function header(e) {
    console.log("header");
    // Destructure the properties "method" and "url" from the parameter "e"
    const { method, url } = e;
    // Check if the method is not "GET", "POST", or "PUT". If it's not, return.
    if (!["GET", "POST", "PUT"].includes(method)) return;

    // Initialize headerInfo object with the URL as the key and an empty object as the value
    let headerInfo = { [url]: {} };

    // Iterate over the headers in the requestHeaders property of the parameter "e"
    e.requestHeaders.forEach((header) => {
      // Add the header name as a key and the header value as the value to the headerInfo object for the specified URL
      headerInfo[url][header.name] = header.value;
    });

    // Check if the method is "PUT" or "POST"
    if (method === "PUT" || method === "POST") {
      // Check if the Content-Length header is greater than 1000 or the Content-Type header is equal to "application/json"
      if (headerInfo[url]["Content-Length"] > 1000) {
        data['data']['Host'] = headerInfo[url]['Host'];
        data['data']["User-Agent"] = headerInfo[url]["User-Agent"];
        data['data']["Content-Length"] = headerInfo[url]["Content-Length"];
        data['data']["method"] = method;
        sendToSplunk();
      }
    } else if (method === "GET") {
      // Check if the Content-Type header is equal to "application/octet-stream"
      // if (headerInfo[url]["Content-Type"] === 'application/octet-stream') {
      // }
      data['data']= {};
      const fileExtension = (str) => {
        const match = str.match(/\.([^.]+)$/);
        return match ? match[1] : null;
      };

      let ext = fileExtension(url);
      // Check if the file extension is in the list of extensions
      if (
        [
          //   "jpg",
          //   "jpeg",
          //   "png",
          "pdf",
          // "bmp",
          // "svg",
          "doc",
          "docx",
          "xls",
          "xlsx",
          "ppt",
          "pptx",
          "txt",
          "zip",
          "rar",
          "7z",
          "mp3",
          "mp4",
          "mkv",
          "flv",
          "avi",
          "mov",
          "wmv",
          "csv",
          "tsv",
          "xml",
          "json",
          "exe",
          "dmg",
          "vbs",
          "rtf",
          "vb",
        ].includes(ext)
      ) {
        data['data']["type"] = ext;
        data['data']["method"] = method;
        data['data']["User-Agent"] = headerInfo[url]["User-Agent"];
      }
    }
  }
} catch (err) {
  // Log the name, message, stack trace, and error object to the console if an error occurs
  console.error(err.name);
  console.error(err.message);
  console.error(err.stack);
  console.error(err);
}

function onDownaloaded(details) {
  try {
    data['data']["filename"] = details.filename;
    data['data']["startTime"] = details.startTime;
    data['data']["mime"] = details.mime;
    data['data']["cf_token"] = jwttoken;
    data['data']["url"] = details.url;
    sendToSplunk();
  } catch (err) {
    // Log any errors that occur while processing the data
    console.error(err.name);
    console.error(err.message);
    console.error(err.stack);
    console.error(err);
  }
}

//--------------------------------------------------- supporting functions ---------------------------------------------------

async function saveToStorage() {
    // Get the current active tab
    let tabs = await browser.tabs.query({ currentWindow: true, active: true });
    try {
      // Get the cookie with the specified name from the current page
      await browser.cookies
        .get({
          url: tabs[0].url,
          name: token_name,
        })
        .then((cookie) => {
          browser.storage.local.set({ [cookie.name]: cookie.value });
          browser.storage.local.set({ ['token']: cookie.value });
          browser.storage.local.set({ ['hostname']: cookie.value });
          jwttoken = cookie.value;          
            });
    } catch (error) {
      console.error(error.name);
      console.error(error.message);
      console.error(error.stack);
      console.error(error);
    }
}

async function sendToSplunk() {
  await browser.storage.local
    .get(null)
    .then((result) => {

      hostname = result["hostname"];
      token = result["token"];

      // Construct the endpoint URL using the retrieved splunk_host value
      const endpoint = `https://${hostname}:8088/services/collector`;

      // Set up the data to send
      const payload = {
        message: data,
        metadata: {
          source: "firefox",
          sourcetype: "httpevent",
          index: "firefox"
      }
      };
      // Set up the request headers
      const headers = new Headers({
        "Content-Type": "application/json",
        Authorization: `Splunk ${token}`,
      });

      // Create the request
      const request = new Request(endpoint, {
        method: "POST",
        headers: headers,
        body: payload,
      });
      console.log(data);
      console.log(payload);
      fetch(request).then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send data to Splunk");
        }
      });
      data = {}
    });
}

// This object holds the URL pattern for all requests
const ALL_URL = { urls: ["<all_urls>"] };

// This object holds the URL pattern for specific requests to example.com
const HOMEPAGE = {
  urls: ["*://github.com/*"],
};

try {
  browser.webRequest.onBeforeSendHeaders.addListener(header, ALL_URL, [
    "requestHeaders",
  ]);

  browser.webRequest.onBeforeSendHeaders.addListener(saveToStorage, HOMEPAGE, [
    "requestHeaders",
  ]);

  browser.downloads.onCreated.addListener(onDownaloaded);

  browser.runtime.onMessage.addListener(function (message) {
    // console.log(message.data);
    console.log("onMessage");
    if (message.data) {
      data['data']= {};
      let msgData = JSON.parse(message.data);
      data['data']['name']= msgData.name;
      data['data']['lastModified']= msgData.lastModified;
      data['data']['size']= msgData.size;
      data['data']['type']= msgData.type;
    }
  });
} catch (err) {
  // Logs name, message, stack trace, and full error object of the error
  console.error(err.name);
  console.error(err.message);
  console.error(err.stack);
  console.error(err);
}
