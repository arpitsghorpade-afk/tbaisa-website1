TBAISA IMPORT EXPORT – DAILY BLOG PUBLISHING WITH GITHUB + PAGES CMS + HOSTINGER
============================================================================
A READY-TO-INTEGRATE CODE PACKAGE. NOT CONNECTED TO YOUR LIVE HOSTINGER OR GITHUB ACCOUNT.

BEFORE STARTING: Take a full backup of your live Hostinger public_html.
IMPORTANT: Do not replace public_html before testing this package on a staging site.

STEP 1 – CREATE GITHUB REPOSITORY
* Create a private repo named tbaisa-website (default branch main) on github.com.
* Extract this ZIP on your computer. The ZIP is NOT to be uploaded as a single file into the repository.
* Use GitHub Desktop: File > Add local repository (or Create new repository in extracted directory),
  Commit > Publish repository. Keep the repository PRIVATE. Alternatively use Git/VS Code.
* Keep all root files together: index.html, blog.html, .pages.yml, .github, _posts, tools,
  images, uploads, etc. Hidden files must also be included.
* Do NOT push any Hostinger passwords, credentials or private business data to GitHub.

STEP 2 – FIRST TIME: HOSTINGER STAGING (RECOMMENDED)
* Use Hostinger hPanel > Websites > your HTML/PHP website > Dashboard > Advanced > Git.
* Connect GitHub, authorize the selected private repository, choose branch main.
* Deploy into a staging directory/site FIRST, not the active public_html, because an initial
  deployment to public_html can replace files currently being served.
* Once you have verified page layout, images, contact links and blog listing, set target
  directory to public_html and turn on automatic deployment.
* Hostinger Git auto-deploy should be available for custom HTML/PHP hosting plans.
  It is NOT for Hostinger Website Builder sites.

STEP 3 – PAGES CMS FOR EASY DAILY BLOGGING
* Open https://app.pagescms.org and sign in using GitHub.
* Authorize the GitHub app for your repo and select tbaisa-website on branch main.
* Pages CMS automatically reads .pages.yml from repository root.
* Open 'Blog Articles' > New and add a title, meta description, date, category,
  featured image, and content; keep Published toggle ON.
* Save. CMS adds a Markdown file to _posts/, which triggers GitHub Actions.

STEP 4 – VERIFY THE AUTOMATIC HTML BUILD
* GitHub repo > Actions > Generate TBAISA Blog Pages > latest run should be green.
* The workflow creates blog/<slug>/index.html, updates blog.html and the homepage teaser,
  and updates sitemap.xml. Hostinger syncs when main is updated.
* If workflow cannot commit, check GitHub repo Settings > Actions > General > Workflow permissions.
  The workflow declares contents: write, but your organization/account can restrict it.
* This system does not change your original three static articles.

HOW TO PUBLISH EVERY DAY
* Visit https://app.pagescms.org > Blog Articles > New > Fill in > Save.
* No new ZIP and no manual HTML needed after the one-time integration is verified.
* To prepare a draft, switch Published OFF. Turning it ON later publishes it.
* Delete the Markdown in Pages CMS to remove a generated article on next build.

WARNING
* Initial setup and live Hostinger/GitHub connection require you to log into those accounts.
* The package has NOT been deployed or verified on your Hostinger plan.
* GitHub Actions and Pages CMS free allowances/terms can change.
* Review international trade claims and regulations in content before publishing.

LIGHT DOWNLOAD NOTE
* The download has been reduced by removing unreferenced high-resolution source logos and duplicate upload images.
* Photographic site images were optimized as WebP and HTML/Python references updated. Site-visible logos and favicon remain unchanged.
* The original ZIP is not needed for GitHub upload.
