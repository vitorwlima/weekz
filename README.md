# weekz

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## To do

### Part 1 (MVP)

- [x] Add correct date on dashboard intro
- [x] Check vertical scrolling on task list per day (test with many tasks)
- [x] On left click, go to task dialog to be able to delete and edit:
  - [x] title
  - [x] date
  - [x] estimated time
  - [x] frequency
  - [x] notes
- [x] Add task delete
- [x] Add logic to show correct tasks based on date and frequency
- [x] Add dragging and dropping tasks

### Part 2 (UX/DX)
- [] Fix prettier with eslint
- [] Add auto-sort imports
- [] Add lefthook (https://evilmartians.com/opensource/lefthook)
- [] Optimize queries and invalidations (just update the value instantly, and on error invalidate)
- [] Make it fully accessible / keyboard friendly
- [] Improve task delete (dialog confirmation when necessary)
- [] On right click on the task, show context menu with delete and edit options:
  - [] edit will open same dialog
  - [] delete will delete the task if frequency is once or date is braindump - otherwise, if there are completions, show dialog asking if you want to delete making it clear that deletions will also be deleted

## Part 3 (landing page)
- [] Show current features
- [] Show upcoming features

### Part 4 (feature expansion)
- [] Add subtasks
- [] Implement task search
- [] Add task labels
- [] Add dark theme
- [] Add multiple themes (paid feature)
- [] Add settings page

### Part 5 (business)
- [] Add analytics to dashboard
- [] Separate dashboard into like 3 different sections with different analytics, like:
  - [] Task completion rate
  - [] Task completion time
  - [] Task completion frequency
  - [] Give just a few analytics for free, and the rest as a paid feature
