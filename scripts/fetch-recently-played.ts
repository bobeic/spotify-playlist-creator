import { syncRecentlyPlayedForConnectedUsers } from "@/lib/spotify/syncRecentlyPlayed";

async function main() {
  try {
    console.log("Starting local recently played fetch...");
    const summary = await syncRecentlyPlayedForConnectedUsers();
    console.log("Done fetching recently played.", summary);
    console.log(
      `Inserted ${summary.insertedTracks} plays, including ${summary.newTracksInserted} first-time tracks. Skipped ${summary.skippedExistingTracks} existing plays.`
    );
  } catch (err) {
    console.error("Error fetching recently played:", err);
  }
}

main();
