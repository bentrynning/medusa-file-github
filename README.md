# medusa-file-github

Use a github repository as file storage for your medusa.
This uses githubs new fine-grained tokens in combinations with github api to upload your images
And is served through the superb open-source cdn [jsdeliver](https://www.jsdelivr.com/)

## Requirements
- Create a public github repo [here](https://github.com/new)
- Create a Fine-grained token that only have read/write access to your file storage repo [here](https://github.com/settings/personal-access-tokens/new)
- Install the plugin in your medusajs server and enjoy free assets storage with world wide CDN.

## Options

```js
{
  owner: "bentrynning",
  repo: "medusa",
  path: "public" // this is the path to the folder where your assets live
  cdn_url: // optional defults to "https://cdn.jsdelivr.net/gh/",
  github_token: "YOUR-FINE-GRAINED-GITHUBTOKEN", // process.env.GITHUB_TOKEN
}
```