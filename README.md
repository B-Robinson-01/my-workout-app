## THIS IS A BETA PROJECT - SEE TODOS for CURRENT GOALS

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Testing using localhost

Simple testing on local device
> npm run preview
> npm run dev

Host from device
> npm run dev -- --host

## Setup as a PWA
Forces updates such that as a new update is pushed to github, our app will update
specified fields

To launch the app:
> npm run build

Then simply push the new dist folder to the repo

Source: https://b-robinson-01.github.io/my-workout-app/

## TODOs:

Task List:
    1. Center and Update UI (No Scrolling) (DONE)

    2. Persistance (Databases/SQL) (DONE)
    
    3. Auto Reset the Daily Calorie Count (Max Daily Should Stay Same) (DONE)


DREAMs:

- Protein Options
- Log of Everyday - history / past performances (graphs, charts, tables, lists, etc.)
- Add Gym workout functionality (track workouts and weights)
