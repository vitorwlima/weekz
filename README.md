# dayprime

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## To do

### Part 1 (MVP)

[x] Add correct date on dashboard intro
- [x] Check vertical scrolling on task list per day (test with many tasks)
- [x] On left click, go to task dialog to be able to delete and edit:
  - [] title
  - [x] date
  - [x] estimated time
  - [] frequency
  - [] notes
- [] On right click, show context menu with delete and edit options:
  - [] edit will open same dialog
  - [] delete will delete the task if frequency is once or date is braindump - otherwise show dialog asking if you want to delete
- [] Add logic to show correct tasks based on date and frequency
- [] Add dragging and dropping tasks
- [] Improve UX/UI

### Part 2

- [] Fix prettier with eslint
- [] Add auto-sort imports
- [] Add lefthook (https://evilmartians.com/opensource/lefthook)
- [] Add subtasks
- [] Implement task search
- [] Optimize queries and invalidations
