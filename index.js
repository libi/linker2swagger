var fs = require("fs");
var path = require("path");
var input = path.join("./eo-in");

var convertFiles = readDirSync(input);
var gapi = {}
console.log(convertFiles);

batchConvert(convertFiles)

return;

function convert(path, file) {
  var inputFile = path + '/' + file
  var eolink = JSON.parse(fs.readFileSync(inputFile));
  console.log(eolink)
  var swagger = swaggerPreset(eolink.groupName);

  // Global config
  var consumeType = ["application/json"];

  for (var api in eolink.apiList) {
    var singleApi = eolink.apiList[api]
    var path = eolink.apiList[api].baseInfo.apiURI
    if (!swagger.paths[path]) {
      // create path template if path not exist
      // TODO: write this to json file
      swagger.paths[path] = {
        post: {
          tags: eolink.apiList[api].baseInfo.apiTag.split(","),
          summary: eolink.apiList[api].baseInfo.apiName,
          description: "",
          consumes: consumeType,
          parameters: [
            {
              name: "root",
              in: "body",
              schema: {
                type: "object",
                properties: {},
                // required: []
              }
            }
          ],
          responses: {
            // TODO: parse reponse from source
            200: {
              description: 'success',
              schema: {
                type: "object",
                title: "empty object",
                properties: {
                  success: {
                    type: "boolean"
                  },
                  message: {
                    type: "string"
                  }
                }
              }
            }
          }
        }
      };
    }

    // convert api
    gapi = eolink.apiList[api]
    console.log(gapi.requestInfo)
    swagger.paths[path].post.parameters[0].schema.properties = parseParam(gapi.requestInfo)
  }
  console.log(swagger)
  var writeFile = JSON.stringify(swagger);
  fs.writeFileSync('./sw-out/' + file, writeFile, function (err) {
    if (err) {
      console.error(err)
    }
    console.log('=====> 🍺写入成功 (￣^￣)ゞ ' + './sw-out/' + file)
  })
}

function parseParam(params) {
  var result = {};
  for (var param in params) {
    // data structure
    if (params[param].structureID) {
      var structureData = gapi.dataStructureList.filter(function (
        item
      ) {
        return item.structureID == params[param].structureID;
      });
      // TODO: support child object
      var structDataArray = convertStructureData(structureData[0].structureData);
      for (var key in structDataArray) {
        result[structDataArray[key]] = {
          // TODO: create type enum
          // 13. object; 0. string;
          type: "string"
        };
      }
    } else {
      if (params[param].childList.length === 0) {
        result[params[param].paramKey] = {
          type: "string"
        };
      } else {
        console.log(params[param].paramKey);
        result[params[param].paramKey] = {
          type: "object",
          properties: parseParam(params[param].childList)
        };
      }
    }
  }
  return result;
}

function convertStructureData(str) {
  var result = [];
  var structure = JSON.parse(decodeURIComponent(str));
  for (var param in structure) {
    result.push(structure[param].paramKey);
  }
  return result;
}

function batchConvert(pathArray) {
  for (var file in pathArray) {
    convert(pathArray[file].path, pathArray[file].file)
  }
}

function swaggerPreset(title) {
  return {
    swagger: "2.0",
    info: {
      title: title,
      version: "last"
    },
    basePath: "/",
    tags: [
      {
        name: title,
        description: title
      }
    ],
    schemes: ["https"],
    paths: {}
  };
}

function readDirSync(path) {
  var pa = fs.readdirSync(path);
  var result = [];
  pa.forEach(function (ele, index) {
    var currPath = path + "/" + ele;
    console.log("Added file: " + currPath);
    result.push({
      path: path,
      file: ele
    });
  });
  return result
}
