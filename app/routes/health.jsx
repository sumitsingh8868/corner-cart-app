import { json } from "@remix-run/node";
export async function loader() {
  return json({ status: "ok", app: "corner-cart", timestamp: new Date().toISOString() });
}
