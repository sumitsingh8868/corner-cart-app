import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";

export async function action({ request }) {
  const { topic, shop } = await authenticate.webhook(request);
  if (topic === "APP_UNINSTALLED") {
    // Clean up store data if needed
    console.log(`App uninstalled from: ${shop}`);
  }
  return json({ success: true });
}
