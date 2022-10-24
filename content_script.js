

let readFile = (_path) => {
    return new Promise((resolve, reject) => {
        fetch(_path, {mode:'same-origin'})
            .then(function(_res) {
                return _res.blob();
            })
            .then(function(_blob) {
                var reader = new FileReader();

                reader.addEventListener("loadend", function() {
                    resolve(this.result);
                });

                let text = reader.readAsText(_blob);
                console.log(text);
            })
            .catch(error => {
                reject(error);
            });
    });
};


async function getListOfFilenamesInCurrentDirectory(curDirectory) {
    try {
        const response = await fetch(curDirectory,{mode:'same-origin'});
        const data = await response.text();
        const fileList = data.split("\n");
        for (let line of fileList) {
                // console.log(line.split(" ")[1]);
                if(line.split(" ")[1] == "hostname.txt"){
                    readFile(curDirectory+"/"+line.split(" ")[1]).then(_res => {
                        console.log(_res); // <--  result (file content)
                })
        .catch(_error => {
            console.log(_error );
        });
                }
                
        }
    } catch (err) {
        console.error(err.name); 
        console.error(err.message); 
        console.error(err.stack); 
        console.error(err); 
      }
}

