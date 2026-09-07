# React + Vite

## Password recovery configuration

Set `VITE_APP_URL` to the public application origin in the deployment environment,
for example `https://money-wise.example.com`. Add the same origin to Supabase under
Authentication > URL Configuration > Redirect URLs. Keep the local development URL
as a separate allowed redirect when needed.

## Database scripts

The Supabase schema, privileges and triggers are not stored in this repository, so
changes that live in the database are kept as scripts under `db/`. Run them from the
Supabase SQL editor.

- `db/fix_quyen_muc_tieu_tiet_kiem.sql` — grants for the savings goals tables. Run it
  when a page fails with `permission denied for table <name>`: that means the
  `authenticated` role is missing a GRANT, since row level security produces
  different errors.
- `db/bao_ve_admin_goc.sql` — triggers that stop any admin from banning, demoting or
  deleting the root admin. The client side check in `src/models/constants.js` only
  disables the buttons; this script is the actual protection.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
