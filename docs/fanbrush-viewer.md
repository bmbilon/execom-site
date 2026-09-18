# Fan brush viewer

Public URL: https://execom.ca/fanbrush

The static viewer lives in `public/fanbrush`. `next.config.mjs` rewrites the clean URL to its HTML entry point. The HTML base URL keeps scripts, styles, the part manifest and GLB loading from `/fanbrush/` with or without a trailing slash.

This is the Amy v4 silicone fan brush from the 17 September 2026 handoff. It has nine parts, an overall length of approximately 195.4 mm and a fan width of 50.06 mm. The default Pearl appearance has a pearl handle (#e5ddd3), champagne head section (#b9a58a) and medium grey bristles and supports (#808080). Bristles remain grey across optional handle colours. Reset restores Pearl. Colours, lighting, roughness and exploded offsets are illustrative. The original source STEP colour is retained as metadata. The page subtitle is “Pre-Launch Preview”. No X-ray mode is present.

The editable source is in Brett's `Documents/ChatGPT/Amy Silicone Fan Brush/interactive` workspace. Run `npm run build` there, then use `scripts/export-execom.mjs` with a fresh destination directory to package the site assets. Review and replace only `public/fanbrush`; do not change other product pages. The Three.js license is included beside the application.

The public package contains the browser viewer and its rendered model. STEP engineering files and the Blender source are kept in the source workspace.

Verification: all 296,967 exported triangles match the STEP-derived tessellation at Float32 storage precision, with their winding preserved. All nine source-file checksums match, and the exported materials match the requested preview finishes. This confirms that the Blender/browser export did not reshape or simplify the imported meshes. STEP surfaces are tessellated with 0.04 mm linear and 0.45 rad angular deflection; the browser mesh is not an exact mathematical B-rep. Source and release TypeScript checks pass; `/fanbrush` returns the viewer; the GLB returns `model/gltf-binary`; close-up, colour, exploded and reset controls load all nine parts without browser errors. The requested header slogan and component description card are removed.
