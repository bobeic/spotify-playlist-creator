import { enqueueUserFetch } from "../lib/workers/spotifyQueue";

// Use a real user ID from your database
// const testUserId = "REPLACE_WITH_USER_ID";
const testUserId = "cmkeeyyk800004wutghc9hmwn";

enqueueUserFetch(testUserId)
  .then(() => {
    console.log("Job enqueued");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
