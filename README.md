# Telling — Interactive QA Prototype

This project keeps the public Telling landing page and adds a richer browser-local prototype for practising the 18 manual-testing steps.

## Open in VS Code
1. Extract the ZIP.
2. Open the `telling_redesign` folder in VS Code.
3. Open `index.html` with Live Server.
4. Click **Open interactive demo** to enter the testing prototype.

## QA features in this prototype
- Create a test profile with a username (please do not use your real name).
- Create confession posts; sample confessions include `BigBoss`, `Alexa`, and a mature-labelled test post.
- Add/search friends, comment, like, reply, share, sort by engagement, and open a local replies inbox.
- Toggle the mature setting and observe the mature-labelled sample post.
- Submit a local report record for an inappropriate confession.
- Open a sample confession room and send local text messages.
- Record a labelled ad-placeholder observation for layout/interval note-taking.
- Log out and switch to another test username.

## Important limits — read before submitting a test report
This is a **local QA prototype**, not the production Telling service. Data is saved in this browser only. The account form is not real authentication. Comments, replies, friends, reports, room messages, and likes do not sync across devices or reach real users/moderators. The report feature does not submit anything to Classroom. The ad slot is a placeholder, not a real ad network, so it cannot verify production ad loading or real ad intervals. The mature setting only filters the sample content in this prototype. Scrolling performance here is not a substitute for performance testing the official app.

To test the real app's behaviour, install and use the official app: https://play.google.com/store/apps/details?id=com.telling.social. For production-like web functionality, the project needs a deployed backend, secure authentication, database access policies, moderation/report routing, and a configured ad provider.
