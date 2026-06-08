import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page, Layout, Card, Button, Text, BlockStack,
  InlineStack, Badge, Box, Banner, Divider,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getSettings, getUpsellProducts } from "../models/settings.server";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const settings = await getSettings(session.shop);
  const upsells = await getUpsellProducts(session.shop);
  return json({ settings, upsellCount: upsells.length, shop: session.shop });
}

export default function Dashboard() {
  const { settings, upsellCount, shop } = useLoaderData();
  const navigate = useNavigate();

  const cards = [
    {
      icon: "🛒",
      title: "Upsell Products",
      desc: "Configure which products to upsell in the cart drawer and what discount to apply.",
      count: upsellCount,
      countLabel: "products configured",
      color: "#008060",
      bg: "#f0faf6",
      border: "#b3dfd0",
      action: () => navigate("/app/upsell"),
      actionLabel: "Manage Upsells",
    },
    {
      icon: "🏷️",
      title: "Discount Codes",
      desc: `UPSELL10 (${settings.discount1Pct}%) for 1 item • UPSELL15 (${settings.discount2Pct}%) for 2+ items`,
      count: settings.discountEnabled ? "ON" : "OFF",
      countLabel: "discount status",
      color: "#8C5AE0",
      bg: "#f8f4ff",
      border: "#d4c2f7",
      action: () => navigate("/app/settings"),
      actionLabel: "Configure",
    },
    {
      icon: "📊",
      title: "Progress Bar",
      desc: `Free shipping unlocks at $${(settings.progressGoal / 100).toFixed(0)}. Message: "${settings.progressMessage.slice(0, 40)}..."`,
      count: settings.progressEnabled ? "ON" : "OFF",
      countLabel: "progress bar",
      color: "#2C6ECB",
      bg: "#f0f5ff",
      border: "#b3c9f0",
      action: () => navigate("/app/settings#progress"),
      actionLabel: "Configure",
    },
    {
      icon: "📢",
      title: "Announcement Bar",
      desc: settings.announcementEnabled
        ? `"${settings.announcementText.slice(0, 50)}..."`
        : "Show a promotional banner inside the cart drawer.",
      count: settings.announcementEnabled ? "ON" : "OFF",
      countLabel: "announcement",
      color: "#B98900",
      bg: "#fff9ed",
      border: "#f0d080",
      action: () => navigate("/app/settings#announcement"),
      actionLabel: "Configure",
    },
  ];

  return (
    <Page
      title="Corner Cart — Dashboard"
      subtitle={`Store: ${shop}`}
      primaryAction={{
        content: "⚙️  Settings",
        onAction: () => navigate("/app/settings"),
      }}
      secondaryActions={[
        { content: "🛒  Manage Upsells", onAction: () => navigate("/app/upsell") },
      ]}
    >
      <BlockStack gap="600">

        {/* ── Status Banner ─────────────────────────── */}
        <Banner
          title={settings.enabled ? "✅  Corner Cart is Active" : "⚠️  Corner Cart is Disabled"}
          tone={settings.enabled ? "success" : "warning"}
          action={{ content: settings.enabled ? "View Settings" : "Enable Now", url: "/app/settings" }}
        >
          <p>
            {settings.enabled
              ? "Your cart drawer is live on your store. Customers see upsells, discounts and the progress bar."
              : "Enable Corner Cart from Settings to activate the cart drawer on your store."}
          </p>
        </Banner>

        {/* ── Stats Row ─────────────────────────────── */}
        <Layout>
          <Layout.Section variant="oneThird">
            <StatCard emoji="🛒" label="Upsell Products" value={upsellCount} color="#008060" bg="#f0faf6" />
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <StatCard
              emoji="🏷️"
              label="Auto Discount"
              value={settings.discountEnabled ? "Active" : "Off"}
              color="#8C5AE0"
              bg="#f8f4ff"
            />
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <StatCard
              emoji="📊"
              label="Free Shipping at"
              value={`$${(settings.progressGoal / 100).toFixed(0)}`}
              color="#2C6ECB"
              bg="#f0f5ff"
            />
          </Layout.Section>
        </Layout>

        {/* ── Feature Cards ─────────────────────────── */}
        <BlockStack gap="200">
          <Text variant="headingSm" tone="subdued" as="p">FEATURES</Text>
        </BlockStack>
        <Layout>
          {cards.map((card) => (
            <Layout.Section variant="oneHalf" key={card.title}>
              <div style={{ borderRadius: 12, border: `1.5px solid ${card.border}`, overflow: "hidden", height: "100%" }}>
                <Card>
                  <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="start">
                      <InlineStack gap="300" blockAlign="center">
                        <div style={{
                          width: 50, height: 50, borderRadius: 12,
                          background: card.bg, display: "flex",
                          alignItems: "center", justifyContent: "center",
                          fontSize: 26, flexShrink: 0,
                        }}>
                          {card.icon}
                        </div>
                        <BlockStack gap="050">
                          <Text variant="headingMd" fontWeight="bold">{card.title}</Text>
                          <Badge tone={card.count === "ON" || (typeof card.count === "number" && card.count > 0) ? "success" : "new"}>
                            {card.count} {card.countLabel}
                          </Badge>
                        </BlockStack>
                      </InlineStack>
                    </InlineStack>

                    <Text variant="bodyMd" tone="subdued">{card.desc}</Text>
                    <Divider />
                    <Button variant="primary" size="slim" onClick={card.action}>
                      {card.actionLabel} →
                    </Button>
                  </BlockStack>
                </Card>
              </div>
            </Layout.Section>
          ))}
        </Layout>

        {/* ── Quick Setup Guide ─────────────────────── */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" fontWeight="bold">🚀 Quick Setup Guide</Text>
            <BlockStack gap="300">
              {[
                { step: "1", done: true,  text: "App installed successfully" },
                { step: "2", done: upsellCount > 0, text: "Add at least one upsell product" },
                { step: "3", done: settings.discountEnabled, text: "Enable automatic discounts" },
                { step: "4", done: settings.progressEnabled, text: "Configure free shipping progress bar" },
                { step: "5", done: settings.enabled, text: "Activate Corner Cart on your store" },
              ].map((item) => (
                <InlineStack key={item.step} gap="300" blockAlign="center">
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: item.done ? "#008060" : "#f1f1f1",
                    color: item.done ? "#fff" : "#aaa",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, flexShrink: 0,
                  }}>
                    {item.done ? "✓" : item.step}
                  </div>
                  <Text
                    variant="bodyMd"
                    tone={item.done ? "success" : "subdued"}
                    textDecorationLine={item.done ? "line-through" : undefined}
                  >
                    {item.text}
                  </Text>
                </InlineStack>
              ))}
            </BlockStack>
          </BlockStack>
        </Card>

      </BlockStack>
    </Page>
  );
}

function StatCard({ emoji, label, value, color, bg }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "20px 24px", border: `2px solid ${color}22` }}>
      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="bodySm" tone="subdued" fontWeight="semibold">{label.toUpperCase()}</Text>
          <span style={{ fontSize: 22 }}>{emoji}</span>
        </InlineStack>
        <Text variant="heading2xl" as="p" fontWeight="bold">{value}</Text>
      </BlockStack>
    </div>
  );
}
