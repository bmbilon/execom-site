# Founders Home on execom.ca

The public Founders Home frontend is mounted at `/founders` and its named public subpages. Its assets live under `/founders/assets/`, so they cannot replace the main site's root assets. Unknown Founders routes retain the main site's 404 response.

`/founders/apply`, `/founders/workspace`, `/founders/status`, and `/founders/admin` redirect to the existing authenticated Sites application. Both Next.js redirects and the frontend router preserve query parameters, including chair, invitation and campaign values. No private API, database, uploads or credentials are copied into this public export.

To refresh the public frontend from the Founders Home repository:

```sh
node scripts/import-founders.mjs /absolute/path/to/founders-home
```

Review the generated diff before committing it. The source commit is recorded in `docs/founders-source.json`. Only text assets are rewritten; images and fonts are copied byte for byte. Production builds use the committed export and do not need the other repository or a remote request.

Run `node scripts/verify-founders.mjs http://localhost:3000` against a running production build, then repeat against the deployed origin. Also check the founder and parent links, the Number calculator, the example workspace and the application sign-in handoff in a browser.
