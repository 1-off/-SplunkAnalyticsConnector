document.body.style.border = "5px solid red";

const input = document.querySelector("input[type='file']");

input.addEventListener("change", function () {
  // get the first file from the list of selected files
  const file = this.files[0];
  console.log("content script: file selected");

let fileData = {
    name: file.name,
    lastModified: file.lastModified,
    webkitRelativePath: file.webkitRelativePath,
    size: file.size,
    type: file.type,
  }
  // stringify the file data to create a JSON string
  const jsonData = JSON.stringify(fileData, null, 2);
  console.log(jsonData);
  browser.runtime.sendMessage({ data: jsonData });
});
