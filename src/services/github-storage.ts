import {
  AbstractFileService,
  DeleteFileType,
  FileServiceGetUploadStreamResult,
  FileServiceUploadResult,
  GetUploadedFileType,
  UploadStreamDescriptorType,
} from "@medusajs/medusa";
import * as fs from "fs";

import { Octokit } from "octokit";
import { EntityManager, Logger } from "typeorm";

class GithubStorageService extends AbstractFileService {
  protected manager_: EntityManager;
  protected transactionManager_: EntityManager;
  logger_: Logger;
  client_: Octokit;
  owner_: string;
  repo_: string;
  path_: string;
  cnd_url_: string;

  constructor({ logger }, options) {
    super({}, options);

    this.owner_ = options.owner,
    this.repo_ = options.repo,
    this.path_ = options.path,
    this.cnd_url_ = options.cdn_url || "https://cdn.jsdelivr.net/gh";
    this.logger_ = logger;

    this.client_ = new Octokit({
      auth: options.github_token || process.env.GITHUB_TOKEN,
    });
  }

  buildUrl(fileData: Express.Multer.File): string {
    return `${this.cnd_url_}/${this.owner_}/${this.repo_}/${this.path_}/${fileData.originalname}`;
  }

  async get(fileData: GetUploadedFileType) {
    try {
      const { data } = await this.client_.request(
        "GET /repos/{owner}/{repo}/contents/{path}",
        {
          owner: this.owner_,
          repo: this.repo_,
          path: `${this.path_}/${fileData.originalname}`,
        }
      );

      if (data) {
        return data;
      }
    } catch (e) {
      console.table([{ status: e.status, message: e.message }]);
    }
  }

  async upload(file: Express.Multer.File): Promise<FileServiceUploadResult> {
    const base64File = fs.readFileSync(file.path, { encoding: "base64" });
    const exist = await this.get(file);

    if (exist) {
      return {
        url: this.buildUrl(file),
        key: exist.sha,
      };
    }

    if (base64File) {
      const { data } = await this.client_.request(
        "PUT /repos/{owner}/{repo}/contents/{path}",
        {
          owner: this.owner_,
          repo: this.repo_,
          path: `${this.path_}/${file.originalname}`,
          message: "Upload file",
          content: base64File,
        }
      );

      if (data) {
        return {
          url: this.buildUrl(file),
          key: data.content.sha,
        };
      }
    }

    throw new Error("Unable to upload file");
  }

  async delete(file: DeleteFileType): Promise<void> {
    const { data, status } = await this.client_.request(
      "DELETE /repos/{owner}/{repo}/contents/{path}",
      {
        owner: this.owner_,
        repo: this.repo_,
        path: `${this.path_}/${file.originalname}`,
        sha: file.fileKey,
        message: "Delete file",
      }
    );
    if (data) {
      return;
    }

    throw new Error("Unable to delete file");
  }

  async getUploadStreamDescriptor(
    fileData: UploadStreamDescriptorType
  ): Promise<FileServiceGetUploadStreamResult> {
    console.log("getUploadStreamDescriptor", fileData);
    return {
      writeStream: null,
      promise: null,
      url: null,
      fileKey: null,
    };
  }

  async getDownloadStream(
    fileData: GetUploadedFileType
  ): Promise<NodeJS.ReadableStream> {
    console.log("getDownloadStream", fileData);
    return null;
  }

  async getPresignedDownloadUrl(
    fileData: GetUploadedFileType
  ): Promise<string> {
    console.log("getPresignedDownloadUrl", fileData);
    return null;
  }

  uploadProtected(
    fileData: Express.Multer.File
  ): Promise<FileServiceUploadResult> {
    console.log("uploadProtected", fileData);
    return null;
  }
}

export default GithubStorageService;
