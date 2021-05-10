var fs = require("fs");
var path = require("path");
var input = path.join("./eo-in");
var GenerateSchema = require('generate-schema');

var convertFiles = readDirSync(input);
var gapi = {}
console.log(convertFiles);

batchConvert(convertFiles)

return;
function convertSingle(swagger,singleApi,path,tags){


    var consumeType = ["application/json"];

    if (path[0] !== "/"){
        path = "/"+path;
    }
    // create path template if path not exist
    //console.log(eolink.apiGroupList[group].apiList[api]);return;
    // TODO: write this to json file

    //apiRequestType  0 post 1 get

    console.log("parse", parseResponse(singleApi.resultInfo));

    if (singleApi.baseInfo)
        swagger.paths[path] = {};
    var tmpd = {
        tags: tags,
        summary: singleApi.baseInfo.apiName,
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
            200: {
                description: 'success',
                schema: {}
            }
        }
    }

    if (singleApi.baseInfo.apiRequestType === 1) {
        swagger.paths[path].get = tmpd;
        // convert api
        swagger.paths[path].get.parameters[0].schema.properties = parseParam(singleApi.requestInfo);
        swagger.paths[path].get.responses[200].schema = parseResponse(singleApi.resultInfo);
    } else {
        swagger.paths[path].post = tmpd;
        // convert api
        swagger.paths[path].post.parameters[0].schema.properties = parseParam(singleApi.requestInfo);
        swagger.paths[path].post.responses[200].schema = parseResponse(singleApi.resultInfo);
    }
}
function convertGroup(parentTags,apiGroupList,swagger) {
    //var parentTags = JSON.parse(JSON.stringify(parentTags));
    for (var group in apiGroupList) {
        for (var api in apiGroupList[group].apiList) {
            parentTags.push(apiGroupList[group].groupName);
            var singleApi = apiGroupList[group].apiList[api];
            var path = apiGroupList[group].apiList[api].baseInfo.apiURI;

            convertSingle(swagger,singleApi,path,parentTags);

            if(apiGroupList[group].apiGroupChildList.length > 0){
                convertGroup(parentTags,apiGroupList[group].apiGroupChildList,swagger);
            }
            parentTags = [];
        }
    }
}
function convert(path, file) {
    var inputFile = path + '/' + file
    var eolink = JSON.parse(fs.readFileSync(inputFile));
    console.log("a", eolink)
    var swagger = swaggerPreset(eolink.groupName);

    // Global config
    var count = 0;

    var apiGroupList = eolink.apiGroupList;
    convertGroup([],apiGroupList,swagger);

    console.log(swagger,Object.getOwnPropertyNames(swagger.paths).length);
    var writeFile = JSON.stringify(swagger);
    fs.writeFileSync('./sw-out/' + file, writeFile, function (err) {
        if (err) {
            console.error(err)
        }
        console.log('=====> 🍺写入成功 (￣^￣)ゞ ' + './sw-out/' + file)
    })

}

function parseParam(params) {
    console.log('params', params);
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
            //if (params[param].paramValueList.length === 0) {
            result[params[param].paramKey] = {
                type: "string"
            };
            // } else {
            //     console.log(params[param].paramKey);
            //     result[params[param].paramKey] = {
            //         type: "object",
            //         properties: parseParam(params[param].paramValueList)
            //     };
            // }
        }
    }
    return result;
}

// {
//   "paramNotNull": "0",
//     "paramName": "",
//     "paramKey": "data>>list",
//     "type": "0",
//     "paramType": "12",  12arr 13object
//     "paramValueList": [],
//     "$index": 8
// },
function parseResponse(resultInfo) {
    var result = {};
    var hasArr = {};
    for (var i in resultInfo) {
        var curr = resultInfo[i];
        var currKeys = curr.paramKey.split(">>");
        if (currKeys.length === 0) {
            continue;
        }
        var currentType = curr.paramType; //12arr 13object

        var tmp = result;
        for (var n in currKeys) {
            var currentKey = currKeys[n];
            if (tmp === undefined) {
                switch (currentType) {
                    case "12":
                        tmp = [{}];
                        break;
                    case "13":
                        tmp = {};
                        break;
                    default:
                        tmp = "";
                }
            }
            if (tmp[currentKey] === undefined) {
                switch (currentType) {
                    case "12":
                        tmp[currentKey] = [{}];
                        break;
                    case "13":
                        tmp[currentKey] = {};
                        break;
                    default:
                        tmp[currentKey] = "";
                }
            }
            if (Array.isArray(tmp[currentKey])) {
                console.log("hasarr", currentKey);
                hasArr[currentKey] = true;
                tmp = tmp[currentKey][0];
                console.log(result, tmp);
            } else {
                tmp = tmp[currentKey];
            }
        }
    }

    var schema = GenerateSchema.json("success", result);

    return schema;

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
