const fsPromises = require("node:fs/promises");
const fs = require("fs");
const path = require("node:path");

//Define the path to the directory
const sourceDir = path.join(__dirname, "json-files");
const validDir = path.join(__dirname, "valid-json");
const invalidDir = path.join(__dirname, "error-json");
//call the watcher function
watcherJSON(sourceDir, validDir, invalidDir);

//Function to process and validate a single JSON FILE

async function processJsonFile(filePath, validDir, errorDir) {
  try {
    const fileName = path.basename(filePath);
    //read file content
    const fileData = await fsPromises.readFile(filePath, "utf-");
    console.log(fileData);
  } catch (error) {}
}

async function watcherJSON(sourceDir, validDir, invalidDir) {
  console.time("server");
  //Ensure the valid and error directorires exits
  await fsPromises.mkdir(validDir, { recursive: true });
  await fsPromises.mkdir(invalidDir, { recursive: true });

  // Create a file watcher

  const watcher = fsPromises.watch(sourceDir);

  console.log(`Watching directory: ${sourceDir} for changes...`);

  for await (const event of watcher) {
    console.log(event);
    if (event.eventType === "rename") {
      const filePath = path.join(sourceDir, event?.filename);
      console.log(`FilePath: ${filePath}`);
      //check if the file still exits
      try {
        const fileStat = await fsPromises.stat(filePath);
        console.log(`FileStat: ${fileStat?.size}`);
        if (fileStat?.isFile()) {
          console.log(`New File detected: ${event.filename}`);
          ( async () => {

            const fileName = path.basename(filePath);
            // const oldWay = await fsPromises.readFile(filePath,'utf-8');
            // console.log("OldWay:" + oldWay);
            const fileData = await fsPromises.open(filePath, "r");
            const readStream = fileData.createReadStream({ encoding: "utf-8" });
            let data = "";
            readStream.on("data", (chunk) => {
              data += chunk; // accumulate chunks of data
            });
            readStream.on("end", async () => {              
              //ValidDate the JSON
              if(isValidJSON(data)){
                //Move to valid directory
                await fsPromises.rename(filePath,path.join(validDir,fileName));
                console.log(`Valid JSON: ${fileName}`);
              }else{
                // Move to error directory
                await fsPromises.rename(filePath, path.join(invalidDir, fileName));
                console.log(`Invalid JSON: ${fileName}`);              }
            });
          })();
        }
      } catch (err) {
        // console.error(`Error detecting file: ${err.message}`);
      }
    }
  }

  console.timeEnd("server");
}


function isValidJSON(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    //validate required fields:id,name,age
    if(!data.id || !data.name || !data.age){
        return false
    }

    //age should be number
    if(isNaN(Number(data.age))){
      return false
    }
    return true;
  } catch (error) {
    return false;
  }
}
