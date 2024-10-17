const fsPromises = require("node:fs/promises");
const fs = require("fs");
const path = require("node:path");

//Define the path to the directory
const sourceDir = path.join(__dirname, "json-files");
const validDir = path.join(__dirname, "valid-json");
const invalidDir = path.join(__dirname, "error-json");
//call the watcher function
watcherJSON(sourceDir, validDir, invalidDir);

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
      const filePath = path.join(sourceDir, event.filename);
      console.log(`FilePath: ${filePath}`);
      //check if the file still exits

      try {
        const fileStat = await fsPromises.stat(filePath);
        console.log(`FileStat: ${fileStat.size}`);
        if (fileStat.isFile()) {
          console.log(`New File detected: ${event.filename}`);
        }
      } catch (err) {
        console.error(`Error detecting file: ${err.message}`);
      }
    }
  }

  console.timeEnd("server");
}
