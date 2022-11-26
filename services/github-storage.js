"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: ()=>_default
});
const _medusa = require("@medusajs/medusa");
const _fs = /*#__PURE__*/ _interopRequireWildcard(require("fs"));
const _octokit = require("octokit");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interopRequireWildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
class GithubStorageService extends _medusa.AbstractFileService {
    buildUrl(fileData) {
        return `${this.cnd_url_}${this.owner_}/${this.repo_}/${this.path_}/${fileData.originalname}`;
    }
    async get(fileData) {
        try {
            const { data  } = await this.client_.request("GET /repos/{owner}/{repo}/contents/{path}", {
                owner: this.owner_,
                repo: this.repo_,
                path: `${this.path_}/${fileData.originalname}`
            });
            if (data) {
                return data;
            }
        } catch (e) {
            console.table([
                {
                    status: e.status,
                    message: e.message
                }
            ]);
        }
    }
    async upload(file) {
        const base64File = _fs.readFileSync(file.path, {
            encoding: "base64"
        });
        const exist = await this.get(file);
        if (exist) {
            return {
                url: this.buildUrl(file),
                key: exist.sha
            };
        }
        if (base64File) {
            const { data  } = await this.client_.request("PUT /repos/{owner}/{repo}/contents/{path}", {
                owner: this.owner_,
                repo: this.repo_,
                path: `${this.path_}/${file.originalname}`,
                message: "Upload file",
                content: base64File
            });
            if (data) {
                return {
                    url: this.buildUrl(file),
                    key: data.content.sha
                };
            }
        }
        throw new Error("Unable to upload file");
    }
    async delete(file) {
        const { data , status  } = await this.client_.request("DELETE /repos/{owner}/{repo}/contents/{path}", {
            owner: this.owner_,
            repo: this.repo_,
            path: `${this.path_}/${file.originalname}`,
            sha: file.fileKey,
            message: "Delete file"
        });
        if (data) {
            return;
        }
        throw new Error("Unable to delete file");
    }
    async getUploadStreamDescriptor(fileData) {
        console.log("getUploadStreamDescriptor", fileData);
        return {
            writeStream: null,
            promise: null,
            url: null,
            fileKey: null
        };
    }
    async getDownloadStream(fileData) {
        console.log("getDownloadStream", fileData);
        return null;
    }
    async getPresignedDownloadUrl(fileData) {
        console.log("getPresignedDownloadUrl", fileData);
        return null;
    }
    uploadProtected(fileData) {
        console.log("uploadProtected", fileData);
        return null;
    }
    constructor({ logger  }, options){
        super({}, options);
        this.githubToken_ = options.github_token, this.owner_ = options.owner, this.repo_ = options.repo, this.path_ = options.path, this.cnd_url_ = options.cdn_url || "https://cdn.jsdelivr.net/gh/";
        this.logger_ = logger;
        this.client_ = new _octokit.Octokit({
            auth: options.github_token || process.env.GITHUB_TOKEN
        });
    }
}
const _default = GithubStorageService;
