import { redirect } from "next/navigation";

/** The existing task registry remains at this app's legacy maintenance route. */
export default function MaintenanceTasksPage() {
  redirect("/maintenance");
}
