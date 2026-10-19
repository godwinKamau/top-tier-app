import { redirect } from "next/navigation";

/** The roster moved to /berfday, the admin's front page; old links land there. */
export default function StudentsIndex() {
  redirect("/berfday");
}
