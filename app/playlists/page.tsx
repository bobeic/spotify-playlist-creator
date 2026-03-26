import { redirect } from "next/navigation";

export default function LegacyPlaylistsPage() {
  redirect("/dashboard/discover");
}
