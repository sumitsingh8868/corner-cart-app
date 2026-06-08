import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, Form } from "@remix-run/react";
import {
  Page, Layout, Card, Button, Text, BlockStack, InlineStack,
  TextField, Select, Checkbox, Badge, Banner, Divider, Box,
  RangeSlider, ColorPicker, hsbToHex,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { authenticate } from "../shopify.server";
import { getSettings, updateSettings } from "../models/settings.server";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  return json(await getSettings(session.shop));
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();

  await updateSettings(session.shop, {
    enabled:              form.get("enabled") === "true",
    progressEnabled:      form.get("progressEnabled") === "true",
    progressGoal:         parseInt(form.get("progressGoal") || "5000"),
    progressMessage:      form.get("progressMessage") || "",
    freeShippingMsg:      form.get("freeShippingMsg") || "",
    checkoutBtnText:      form.get("checkoutBtnText") || "Checkout",
    checkoutBtnColor:     form.get("checkoutBtnColor") || "#008060",
    checkoutBtnTextColor: form.get("checkoutBtnTextColor") || "#ffffff",
    announcementEnabled:  form.get("announcementEnabled") === "true",
    announcementText:     form.get("announcementText") || "",
    announcementBg:       form.get("announcementBg") || "#008060",
    announcementColor:    form.get("announcementColor") || "#ffffff",
    discountEnabled:      form.get("discountEnabled") === "true",
    discount1Code:        form.get("discount1Code") || "UPSELL10",
    discount1Pct:         parseInt(form.get("discount1Pct") || "10"),
    discount2Code:        form.get("discount2Code") || "UPSELL15",
    discount2Pct:         parseInt(form.get("discount2Pct") || "15"),
  });

  return json({ success: true });
}

export default function SettingsPage() {
  const settings = useLoaderData();
  const submit = useSubmit();
  const nav = useNavigation();
  const saving = nav.state === "submitting";

  const [enabled,             setEnabled]             = useState(settings.enabled);
  const [progressEnabled,     setProgressEnabled]     = useState(settings.progressEnabled);
  const [progressGoal,        setProgressGoal]        = useState(String(settings.progressGoal));
  const [progressMessage,     setProgressMessage]     = useState(settings.progressMessage);
  const [freeShippingMsg,     setFreeShippingMsg]     = useState(settings.freeShippingMsg);
  const [checkoutBtnText,     setCheckoutBtnText]     = useState(settings.checkoutBtnText);
  const [checkoutBtnColor,    setCheckoutBtnColor]    = useState(settings.checkoutBtnColor);
  const [checkoutBtnTextColor,setCheckoutBtnTextColor]= useState(settings.checkoutBtnTextColor);
  const [annEnabled,          setAnnEnabled]          = useState(settings.announcementEnabled);
  const [annText,             setAnnText]             = useState(settings.announcementText);
  const [annBg,               setAnnBg]               = useState(settings.announcementBg);
  const [annColor,            setAnnColor]            = useState(settings.announcementColor);
  const [discountEnabled,     setDiscountEnabled]     = useState(settings.discountEnabled);
  const [discount1Code,       setDiscount1Code]       = useState(settings.discount1Code);
  const [discount1Pct,        setDiscount1Pct]        = useState(String(settings.discount1Pct));
  const [discount2Code,       setDiscount2Code]       = useState(settings.discount2Code);
  const [discount2Pct,        setDiscount2Pct]        = useState(String(settings.discount2Pct));

  function handleSave() {
    const data = {
      enabled: String(enabled),
      progressEnabled: String(progressEnabled),
      progressGoal, progressMessage, freeShippingMsg,
      checkoutBtnText, checkoutBtnColor, checkoutBtnTextColor,
      announcementEnabled: String(annEnabled),
      announcementText: annText, announcementBg: annBg, announcementColor: annColor,
      discountEnabled: String(discountEnabled),
      discount1Code, discount1Pct, discount2Code, discount2Pct,
    };
    submit(data, { method: "post" });
  }

  return (
    <Page
      title="⚙️  Settings"
      backAction={{ content: "Dashboard", url: "/app" }}
      primaryAction={{ content: saving ? "Saving…" : "Save Settings", onAction: handleSave, loading: saving }}
    >
      <BlockStack gap="500">

        {/* ── Enable / Disable ─────────────────── */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <Text variant="headingMd" fontWeight="bold">🛒  Corner Cart Status</Text>
                <Text variant="bodyMd" tone="subdued">Toggle the cart drawer on/off for your entire store.</Text>
              </BlockStack>
              <div
                onClick={() => setEnabled(!enabled)}
                style={{
                  width: 52, height: 28, borderRadius: 14, cursor: "pointer",
                  background: enabled ? "#008060" : "#d1d1d1",
                  position: "relative", transition: "background 0.2s",
                }}
              >
                <div style={{
                  position: "absolute", top: 4,
                  left: enabled ? 26 : 4,
                  width: 20, height: 20, borderRadius: "50%",
                  background: "#fff", transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }} />
              </div>
            </InlineStack>
            <Badge tone={enabled ? "success" : "critical"}>{enabled ? "Active" : "Disabled"}</Badge>
          </BlockStack>
        </Card>

        {/* ── Checkout Button ───────────────── */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" fontWeight="bold">🛍️  Checkout Button</Text>
            <Layout>
              <Layout.Section variant="oneHalf">
                <TextField label="Button Text" value={checkoutBtnText} onChange={setCheckoutBtnText} autoComplete="off" />
              </Layout.Section>
              <Layout.Section variant="oneHalf">
                <BlockStack gap="200">
                  <Text variant="bodyMd">Button Color</Text>
                  <InlineStack gap="300" blockAlign="center">
                    <input type="color" value={checkoutBtnColor}
                      onChange={(e) => setCheckoutBtnColor(e.target.value)}
                      style={{ width: 44, height: 44, border: "none", borderRadius: 8, cursor: "pointer" }} />
                    <Text variant="bodySm" tone="subdued">{checkoutBtnColor}</Text>
                    <div style={{ width: 100, height: 36, borderRadius: 8, background: checkoutBtnColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: checkoutBtnTextColor, fontSize: 13, fontWeight: 600 }}>{checkoutBtnText || "Checkout"}</span>
                    </div>
                  </InlineStack>
                </BlockStack>
              </Layout.Section>
            </Layout>
          </BlockStack>
        </Card>

        {/* ── Progress Bar ─────────────────── */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <Text variant="headingMd" fontWeight="bold">📊  Free Shipping Progress Bar</Text>
              <div onClick={() => setProgressEnabled(!progressEnabled)}
                style={{ width: 52, height: 28, borderRadius: 14, cursor: "pointer", background: progressEnabled ? "#008060" : "#d1d1d1", position: "relative", transition: "background 0.2s" }}>
                <div style={{ position: "absolute", top: 4, left: progressEnabled ? 26 : 4, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </div>
            </InlineStack>
            <Layout>
              <Layout.Section variant="oneHalf">
                <TextField
                  label="Free Shipping Goal (in cents)"
                  helpText="5000 = $50.00"
                  value={progressGoal}
                  onChange={setProgressGoal}
                  type="number"
                  autoComplete="off"
                />
              </Layout.Section>
              <Layout.Section variant="oneHalf">
                <TextField label="Progress Message" helpText='Use {amount} for remaining amount' value={progressMessage} onChange={setProgressMessage} autoComplete="off" />
              </Layout.Section>
            </Layout>
            <TextField label="Success Message (when goal reached)" value={freeShippingMsg} onChange={setFreeShippingMsg} autoComplete="off" />
          </BlockStack>
        </Card>

        {/* ── Discount ─────────────────────── */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <Text variant="headingMd" fontWeight="bold">🏷️  Auto Upsell Discounts</Text>
                <Text variant="bodyMd" tone="subdued">Automatically apply discount when upsell items are added to cart.</Text>
              </BlockStack>
              <div onClick={() => setDiscountEnabled(!discountEnabled)}
                style={{ width: 52, height: 28, borderRadius: 14, cursor: "pointer", background: discountEnabled ? "#008060" : "#d1d1d1", position: "relative", transition: "background 0.2s" }}>
                <div style={{ position: "absolute", top: 4, left: discountEnabled ? 26 : 4, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </div>
            </InlineStack>
            <Layout>
              <Layout.Section variant="oneHalf">
                <BlockStack gap="300">
                  <Text variant="bodyMd" fontWeight="semibold">When 1 upsell item added:</Text>
                  <TextField label="Discount Code" value={discount1Code} onChange={setDiscount1Code} autoComplete="off" />
                  <TextField label="Discount %" value={discount1Pct} onChange={setDiscount1Pct} type="number" suffix="%" autoComplete="off" />
                </BlockStack>
              </Layout.Section>
              <Layout.Section variant="oneHalf">
                <BlockStack gap="300">
                  <Text variant="bodyMd" fontWeight="semibold">When 2+ upsell items added:</Text>
                  <TextField label="Discount Code" value={discount2Code} onChange={setDiscount2Code} autoComplete="off" />
                  <TextField label="Discount %" value={discount2Pct} onChange={setDiscount2Pct} type="number" suffix="%" autoComplete="off" />
                </BlockStack>
              </Layout.Section>
            </Layout>
          </BlockStack>
        </Card>

        {/* ── Announcement ─────────────────── */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <Text variant="headingMd" fontWeight="bold">📢  Announcement Bar</Text>
                <Text variant="bodyMd" tone="subdued">Show a promo banner inside the cart drawer.</Text>
              </BlockStack>
              <div onClick={() => setAnnEnabled(!annEnabled)}
                style={{ width: 52, height: 28, borderRadius: 14, cursor: "pointer", background: annEnabled ? "#008060" : "#d1d1d1", position: "relative", transition: "background 0.2s" }}>
                <div style={{ position: "absolute", top: 4, left: annEnabled ? 26 : 4, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </div>
            </InlineStack>
            <TextField label="Announcement Text" value={annText} onChange={setAnnText} autoComplete="off" />
            <InlineStack gap="400">
              <BlockStack gap="100">
                <Text variant="bodySm">Background Color</Text>
                <input type="color" value={annBg} onChange={(e) => setAnnBg(e.target.value)}
                  style={{ width: 44, height: 44, border: "none", borderRadius: 8, cursor: "pointer" }} />
              </BlockStack>
              <BlockStack gap="100">
                <Text variant="bodySm">Text Color</Text>
                <input type="color" value={annColor} onChange={(e) => setAnnColor(e.target.value)}
                  style={{ width: 44, height: 44, border: "none", borderRadius: 8, cursor: "pointer" }} />
              </BlockStack>
              {annEnabled && (
                <div style={{ background: annBg, color: annColor, borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, alignSelf: "flex-end" }}>
                  {annText || "Your announcement here"}
                </div>
              )}
            </InlineStack>
          </BlockStack>
        </Card>

        <Button variant="primary" size="large" onClick={handleSave} loading={saving}>
          {saving ? "Saving…" : "✓  Save All Settings"}
        </Button>

      </BlockStack>
    </Page>
  );
}
