# Publish the portfolio on GitHub Pages

The production address is **https://kushagragupta-23.github.io/**. The repository must be named **kushagragupta-23.github.io** and be public to use GitHub Pages on GitHub Free.

## Local development

Use Node.js 20 or newer. This project has no package dependencies, so no installation command is needed.

```powershell
npm run dev
```

Open http://127.0.0.1:4173/. The server exposes only portfolio files and assets. Edit `content.js` to update personal details, projects, and links.

Before publishing, validate and build the site:

```powershell
npm run check
npm run build
npm run preview
```

`npm run check` checks required files, local paths, anchors, browser imports, image alt attributes, and malformed or placeholder content URLs. It does not check whether external websites are online or verify claims about project results.

`npm run build` creates `dist/` containing only the portfolio's deployable HTML, CSS, JavaScript, assets, and crawler files. It generates a 404 page, `robots.txt`, and `sitemap.xml` when those files do not exist in the source. Research notes and development scripts are excluded.

## First publication

1. Sign in to GitHub as `kushagragupta-23`.
2. Create the public repository `kushagragupta-23.github.io`, or inspect its existing contents before making changes.
3. Open the repository's **Settings → Pages**. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Commit the portfolio source and push the `main` branch to this repository.
5. Open **Actions → Deploy portfolio to GitHub Pages** and check that validation, build, and deployment succeed.
6. Visit https://kushagragupta-23.github.io/ and check navigation, project links, and the layout on desktop and mobile.

The included `.github/workflows/deploy.yml` publishes the `dist/` artifact after every push to `main`. You can also run it manually from the Actions tab. It uses GitHub's built-in workflow credentials; no deployment token or paid hosting service is required.

If publishing with an API instead of the browser, create the Pages site using `POST /repos/kushagragupta-23/kushagragupta-23.github.io/pages` with `{ "build_type": "workflow" }`. If it is already configured, inspect the current configuration and use `PUT` to update the build type when needed.

## Authentication and updates

Use a normal HTTPS Git remote:

```text
https://github.com/kushagragupta-23/kushagragupta-23.github.io.git
```

Git Credential Manager can reuse the account already signed in on this computer. If authentication expires, sign in through its browser flow:

```powershell
git credential-manager github login --username kushagragupta-23 --browser
```

Keep passwords and access tokens out of project files, remote URLs, terminal output, and chat. OAuth authentication must include the `workflow` scope when adding or changing GitHub Actions workflow files.

For later changes, edit the source, run the validation and build commands, then commit and push to `main`. GitHub Pages changes can take up to ten minutes to appear. Check the workflow log if deployment fails, and refresh the browser after it succeeds.

GitHub Pages hosts static files. A contact link can open email or an external profile; a contact form that receives submissions needs an external service. Do not add secrets to client-side JavaScript.

## Official references

- [What is GitHub Pages?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [Configure the publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Use custom GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Pages REST API](https://docs.github.com/en/rest/pages/pages)
- [OAuth scopes](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps)
- [Git Credential Manager](https://github.com/git-ecosystem/git-credential-manager)
