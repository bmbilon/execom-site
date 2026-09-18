# Fan brush viewer

Public URL: https://execom.ca/fanbrush

The static viewer lives in `public/fanbrush`. `next.config.mjs` rewrites the clean URL to its HTML entry point. The HTML base URL keeps scripts, styles, the part manifest and GLB loading from `/fanbrush/` with or without a trailing slash.

This is the Amy v4 silicone fan brush from the 17 September 2026 handoff. It has nine parts, an overall length of approximately 195.4 mm and a fan width of 50.06 mm. Finishes and exploded offsets are visualization studies; the source CAD geometry is retained through tessellation. No X-ray mode is present.

The editable source is in Brett's `Documents/ChatGPT/Amy Silicone Fan Brush/interactive` workspace. Run `npm run build` there, then use `scripts/export-execom.mjs` with a fresh destination directory to package the site assets. Review and replace only `public/fanbrush`; do not change other product pages. The Three.js license is included beside the application.

The public package contains the browser viewer and its rendered model. STEP engineering files and the Blender source are kept in the source workspace.

Verification: source and release TypeScript checks pass; `/fanbrush` returns the viewer; the GLB returns `model/gltf-binary`; close-up and exploded controls load all nine parts without browser errors. The viewer's desktop and phone layouts were verified in the source project.
