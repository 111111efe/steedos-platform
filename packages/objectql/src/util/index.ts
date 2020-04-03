/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { isJsonMap, JsonMap } from '@salesforce/ts-types';
import { Validators } from '../validators';
const Future  = require('fibers/future');

const yaml = require('js-yaml');
const fs = require("fs");
const path = require("path");
const _ = require("underscore");
const globby = require("globby");
var clone = require("clone")
import { has, getJsonMap } from '@salesforce/ts-types';
let STEEDOSCONFIG:any = {};
const configName = 'steedos-config.yml'

export * from './transform'
export * from './permission_shares'

exports.loadJSONFile = (filePath: string)=>{
    return JSON.parse(fs.readFileSync(filePath, 'utf8').normalize('NFC'));
}

exports.loadYmlFile = (filePath: string)=>{
    return yaml.load(fs.readFileSync(filePath, 'utf8'));
}

let loadFile = (filePath: string)=>{
    let json:JsonMap = {}
    try {
        let extname = path.extname(filePath);
        if(extname.toLocaleLowerCase() == '.json')
            json = JSON.parse(fs.readFileSync(filePath, 'utf8').normalize('NFC'));
        else if(extname.toLocaleLowerCase() == '.yml')
            json = yaml.load(fs.readFileSync(filePath, 'utf8'));
        else if(extname.toLocaleLowerCase() == '.js')
            json = clone(require(filePath));
    } catch (error) {
        console.error('loadFile error', filePath, error);
    }
    return json;
};
exports.loadFile = loadFile;

function validateObject(json){
    // 校验
    let validate = Validators['steedos-schema_object'];
    let objectName = json.name;
    if (!validate(JSON.parse(JSON.stringify(json)))) {
        throw new Error(`对象${objectName}校验不通过: ${JSON.stringify(validate.errors)}`);
    }

    return true;
}

export const loadObjects = (filePath: string) => {
    let results = []
    const filePatten = [
        path.join(filePath, "*.object.yml"),
        path.join(filePath, "*.object.json")
    ]
    const matchedPaths:[string] = globby.sync(filePatten);
    _.each(matchedPaths, (matchedPath:string)=>{
        let json = loadFile(matchedPath);
        try {
            if(json){
                json.__filename = matchedPath
            }
        } catch (error) {
            console.error('loadObjects error', matchedPath, error);
        }
        if (validateObject(json)){
            results.push(json)
        }
    })
    return results
}

function getI18nLng(filePath){
    try {
        let pathJson = path.parse(filePath);
        let filename = pathJson.base;
        if(filename){
            let f = filename.split('.');
            if(f.length >= 3){
                return f[f.length-3]
            }
        }
        console.log(`getI18nLng warn: Invalid file: ${filePath}`);
    } catch (error) {
        console.error(`getI18nLng error: ${filePath}`, error)
    }
}

export const loadI18n = (filePath: string)=>{
    let results = []
    const filePatten = [
        path.join(filePath, "*.i18n.yml"),
        path.join(filePath, "*.i18n.json")
    ]
    const matchedPaths:[string] = globby.sync(filePatten);
    _.each(matchedPaths, (matchedPath:string)=>{
        console.log('loadI18n matchedPath', matchedPath);
        let json = loadFile(matchedPath);
        let lng = getI18nLng(matchedPath);
        if(lng){
            results.push({lng: lng, data: json})
        }
    })
    return results
}

export const loadTriggers = (filePath: string)=>{
    let results = []
    const filePatten = [
        path.join(filePath, "*.trigger.js")
    ]
    const matchedPaths:[string] = globby.sync(filePatten);
    _.each(matchedPaths, (matchedPath:string)=>{
        let json = loadFile(matchedPath);
        results.push(json)
    })
    return results
}

export const loadFields = (filePath: string)=>{
    let results = []
    const filePatten = [
        path.join(filePath, "*.field.yml"),
        path.join(filePath, "*.field.js")
    ]
    const matchedPaths:[string] = globby.sync(filePatten);
    _.each(matchedPaths, (matchedPath:string)=>{
        let json = loadFile(matchedPath);
        results.push(json)
    })
    return results
}

export const loadJsonFiles = (filePatten: Array<string>)=>{
    let results = []
    const matchedPaths:[string] = globby.sync(filePatten);
    _.each(matchedPaths, (matchedPath:string)=>{
        let json = loadFile(matchedPath);
        results.push({file: matchedPath, data: json})
    })
    return results
}

export const loadApps = (filePath: string)=>{
    let results = []
    if(filePath.indexOf("*") < 0 && isAppFile(filePath)){
        results.push(loadFile(filePath))
    }else{
        const filePatten = [
            path.join(filePath, "*.app.yml"),
            path.join(filePath, "*.app.js")
        ]
        const matchedPaths:[string] = globby.sync(filePatten);
        _.each(matchedPaths, (matchedPath:string)=>{
            let json = loadFile(matchedPath);
            results.push(json)
        })
    }
    return results
}

export function extend(destination: JsonMap, ...sources: JsonMap[]){
    _.each(sources, (source: JsonMap)=>{
        _.each(source, (v:never, k: string)=>{
            if(!has(destination, k)){
                destination[k] = v
            }else if(isJsonMap(v)){
                let _d = getJsonMap(destination, k);
                if(isJsonMap(_d)){
                    destination[k] = this.extend(clone(_d), v)
                }else{
                    destination[k] = v
                }
            }else{
                destination[k] = v
            }
        })
    })
    return destination
}

exports.isObjectFile = (filePath: string)=>{
  return !fs.statSync(filePath).isDirectory() && (filePath.endsWith('.object.yml') || filePath.endsWith('.object.json'))
}
let isAppFile = (filePath: string)=>{
    return !fs.statSync(filePath).isDirectory() && (filePath.endsWith('.app.yml') || filePath.endsWith('.app.js'))
}
exports.isAppFile = isAppFile

exports.isTriggerFile = (filePath: string)=>{
  return !fs.statSync(filePath).isDirectory() && filePath.endsWith('.trigger.js')
}

exports.isFieldFile = (filePath: string)=>{
  return !fs.statSync(filePath).isDirectory() && (filePath.endsWith('.field.yml') || filePath.endsWith('.field.js'))
}

exports.isReportFile = (filePath: string)=>{
  return !fs.statSync(filePath).isDirectory() && (filePath.endsWith('.report.yml') || filePath.endsWith('.report.js'))
}

export function loadObjectFiles(filePath: string) {
    return loadObjects(filePath);
}

export function loadAppFiles(filePath: string) {
    return loadApps(filePath);
}

export function getBaseDirectory(){
    //return require('app-root-path').path
    let cwd = process.cwd();
    if (cwd.indexOf('.meteor') > -1) {
        return cwd.split('.meteor')[0];
    }
    return cwd;
}

function calcString(str: string, content: any = process.env): string{

    if(!_.isString(str)){
        return str;
    }

    let calcFun: Function;
    var reg = /(\${[^{}]*\})/g;
    let rev = str.replace(reg,function(m,$1){
        return $1.replace(/\{\s*/,"{args[\"").replace(/\s*\}/,"\"]}");
    })
    eval(`calcFun = function(args){return \`${rev}\`}`);
    let val = calcFun.call({}, content);

    if(_.isString(val) && val){
        return val.replace(/\\r/g, '\r').replace(/\\n/g, '\n')
    }else{
        return rev;
    }
}

function calcSteedosConfig(config: JsonMap){
    _.each(config, (v:never, k: string)=>{
        if(isJsonMap(v)){
            let _d = getJsonMap(config, k);
            if(isJsonMap(_d)){
                config[k] = calcSteedosConfig(clone(_d))
            }else{
                config[k] = calcString(v)
            }
        }else{
            config[k] = calcString(v)
        }
    })
    return config
}

export function getSteedosConfig(){
    if(!_.isEmpty(STEEDOSCONFIG)){
        return STEEDOSCONFIG;
    }
    let config: any;
    let configPath = path.join(getBaseDirectory(), configName)
    if (fs.existsSync(configPath) && !fs.statSync(configPath).isDirectory()) {
        config = this.loadFile(configPath)
        if (config.env){
            _.each(config.env, function(item, key){
                process.env[key] = calcString(item)
            })
        }
        STEEDOSCONFIG = calcSteedosConfig(config);
    // }else{
    //     throw new Error('Config file not found: ' + configPath);
    }
    return STEEDOSCONFIG;
}

export function getRandomString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }


declare var Meteor:any;

export const isMeteor = () => {
    return (typeof Meteor != "undefined")            
}

export function wrapAsync(fn, context){
    let proxyFn = async function(_cb){
        let value = null;
        let error = null;
        try {
            value = await fn.call(context)
        } catch (err) {
            error = err
        }
        _cb(error, value)
    }
    let fut = new Future();
    let callback = fut.resolver();
    let result = proxyFn.apply(this, [callback]);
    return fut ? fut.wait() : result;
}

export function getTemplateSpaceId(){
    let steedosConfig = getSteedosConfig();
    if(steedosConfig && steedosConfig.public && steedosConfig.public.templateSpaceId){
        return steedosConfig.public.templateSpaceId
    }
}

export function getCloudAdminSpaceId(){
    let steedosConfig = getSteedosConfig();
    if(steedosConfig && steedosConfig.public && steedosConfig.public.cloudAdminSpaceId){
        return steedosConfig.public.cloudAdminSpaceId
    }
}

export function isTemplateSpace(spaceId){
    let steedosConfig = getSteedosConfig();

    if(spaceId && steedosConfig && steedosConfig.public && steedosConfig.public.templateSpaceId && spaceId === steedosConfig.public.templateSpaceId){
        return true
    }

    return false
}

export function isCloudAdminSpace(spaceId){
    let steedosConfig = getSteedosConfig();
    if(spaceId && steedosConfig && steedosConfig.public && steedosConfig.public.cloudAdminSpaceId && spaceId === steedosConfig.public.cloudAdminSpaceId){
        return true
    }
    return false
}