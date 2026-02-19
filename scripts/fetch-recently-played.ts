import { enqueueAllUsers } from "@/lib/workers/enqueueAllUsers";

async function main() {
  try {
    console.log("Starting local recently played fetch...");
    await enqueueAllUsers();
    console.log("Done fetching recently played.");
  } catch (err) {
    console.error("Error fetching recently played:", err);
  }
}

main();
