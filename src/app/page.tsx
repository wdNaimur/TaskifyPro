import { redirect } from "next/navigation";

/**
 * Root page — immediately redirects to /tasks.
 *
 * `redirect()` is a Next.js server-side function.
 * Since this is a Server Component (no "use client" directive),
 * the redirect happens on the server before anything is sent to the browser.
 * The user never sees this page — they land directly on /tasks.
 */
export default function RootPage() {
  redirect("/tasks");
}

