import { syncRecentlyPlayedForConnectedUsers } from "@/lib/spotify/syncRecentlyPlayed";

async function main() {
  try {
    console.log("Starting local recently played fetch...");
    const summary = await syncRecentlyPlayedForConnectedUsers();
    console.log("Done fetching recently played.", summary);
  } catch (err) {
    console.error("Error fetching recently played:", err);
  }
}

main();
