# MangaReader setup

This package is a clean clone of the site UI/admin system. Manga and chapter data are intentionally not included.

## Supabase
1. Create a new Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Put the new project URL and anon/publishable key in `config.js`.
4. Put the same values in `admin/config.js`.
5. Replace `YOUR-GITHUB-USERNAME` with the new GitHub Pages username/domain if needed.

The admin system remains included, but it is intentionally disconnected from the old MangaAtlas database until you configure the new Supabase project.
