# MangaReader

Global manga discovery platform for Japan, USA, France and Brazil.

## Hosting
- GitHub: source code and GitHub Pages hosting
- Supabase Postgres: manga/news/publisher data
- Supabase Storage: public manga cover images
- Supabase Auth: admin/editor login

The repository is prepared for GitHub Pages deployment from `main`. The site uses a static GitHub Pages-compatible frontend; the existing `404.html` handles clean `/manga/...`, `/chapter/...` and country routes by redirecting them to the corresponding `.html` pages.

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Create an admin user in Supabase Authentication.
4. Put the Supabase URL and anon/publishable key in `config.js` and `admin/config.js`. Never use or commit a service-role/secret key.
5. In GitHub, enable Pages for this repository using **GitHub Actions** as the source.
6. Pushes to `main` deploy automatically through `.github/workflows/pages.yml`.
7. Open `/admin/` to sign in and manage manga and chapters.

## Supabase note
`config.js` and `admin/config.js` are currently intentionally blank. The public site can be hosted on GitHub Pages without exposing secrets, but manga/chapter data and the admin panel will not connect until the public Supabase URL and anon/publishable key are configured.

## Content model
Manga records support title, native title, author, artist, description, cover, country, language, genres, status, release date and official URL. News and publisher tables are also included for the next development phase.

MangaReader is intended for lawful manga discovery, news, metadata and official reading/purchase links; it does not provide unauthorized manga scans.
