import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, useNavigate } from "@remix-run/react";
import {
  Page, Layout, Card, Button, Text, BlockStack, InlineStack,
  TextField, Badge, EmptyState, Box, Divider, Modal, Banner,
  IndexTable, useIndexResourceState,
} from "@shopify/polaris";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import {
  getUpsellProducts, createUpsellProduct,
  updateUpsellProduct, deleteUpsellProduct,
} from "../models/settings.server";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  return json(await getUpsellProducts(session.shop));
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "create") {
    await createUpsellProduct(session.shop, {
      triggerProductId:    form.get("triggerProductId"),
      triggerProductTitle: form.get("triggerProductTitle"),
      upsellVariantId:     form.get("upsellVariantId"),
      upsellProductTitle:  form.get("upsellProductTitle"),
      upsellProductImage:  form.get("upsellProductImage") || "",
      upsellPrice:         parseInt(form.get("upsellPrice") || "0"),
      discountPct:         parseInt(form.get("discountPct") || "10"),
      enabled:             true,
    });
  } else if (intent === "toggle") {
    const product = (await getUpsellProducts(session.shop)).find(p => p.id === form.get("id"));
    if (product) await updateUpsellProduct(form.get("id"), session.shop, { enabled: !product.enabled });
  } else if (intent === "delete") {
    await deleteUpsellProduct(form.get("id"), session.shop);
  }

  return json({ success: true });
}

export default function UpsellPage() {
  const products = useLoaderData();
  const submit = useSubmit();
  const nav = useNavigation();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    triggerProductId: "", triggerProductTitle: "",
    upsellVariantId: "", upsellProductTitle: "",
    upsellProductImage: "", upsellPrice: "0", discountPct: "10",
  });

  function handleCreate() {
    submit({ intent: "create", ...form }, { method: "post" });
    setShowForm(false);
    setForm({ triggerProductId: "", triggerProductTitle: "", upsellVariantId: "", upsellProductTitle: "", upsellProductImage: "", upsellPrice: "0", discountPct: "10" });
  }

  const resourceName = { singular: "upsell", plural: "upsells" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(products);

  return (
    <Page
      title="🛒  Upsell Products"
      backAction={{ content: "Dashboard", url: "/app" }}
      primaryAction={{ content: "＋  Add Upsell Rule", onAction: () => setShowForm(true) }}
    >
      <BlockStack gap="500">

        <Banner tone="info" title="How Upsell Rules Work">
          <p>
            When a <strong>trigger product</strong> is in the cart, the <strong>upsell product</strong> will be shown in the cart drawer.
            Adding the upsell item will automatically apply your configured discount code.
          </p>
        </Banner>

        {/* ── Add Form ──────────────────────────── */}
        {showForm && (
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" fontWeight="bold">➕  New Upsell Rule</Text>
              <Layout>
                <Layout.Section variant="oneHalf">
                  <BlockStack gap="300">
                    <Text variant="bodyMd" fontWeight="semibold">Trigger Product (must be in cart)</Text>
                    <TextField label="Product ID" value={form.triggerProductId}
                      onChange={(v) => setForm({ ...form, triggerProductId: v })}
                      helpText="Shopify product GID e.g. gid://shopify/Product/123" autoComplete="off" />
                    <TextField label="Product Title (display only)" value={form.triggerProductTitle}
                      onChange={(v) => setForm({ ...form, triggerProductTitle: v })} autoComplete="off" />
                  </BlockStack>
                </Layout.Section>
                <Layout.Section variant="oneHalf">
                  <BlockStack gap="300">
                    <Text variant="bodyMd" fontWeight="semibold">Upsell Product (to show in drawer)</Text>
                    <TextField label="Variant ID" value={form.upsellVariantId}
                      onChange={(v) => setForm({ ...form, upsellVariantId: v })}
                      helpText="Shopify variant ID (numeric)" autoComplete="off" />
                    <TextField label="Product Title" value={form.upsellProductTitle}
                      onChange={(v) => setForm({ ...form, upsellProductTitle: v })} autoComplete="off" />
                    <TextField label="Product Image URL" value={form.upsellProductImage}
                      onChange={(v) => setForm({ ...form, upsellProductImage: v })} autoComplete="off" />
                  </BlockStack>
                </Layout.Section>
              </Layout>
              <Layout>
                <Layout.Section variant="oneHalf">
                  <TextField label="Price (cents)" helpText="1999 = $19.99" value={form.upsellPrice}
                    onChange={(v) => setForm({ ...form, upsellPrice: v })} type="number" autoComplete="off" />
                </Layout.Section>
                <Layout.Section variant="oneHalf">
                  <TextField label="Discount %" value={form.discountPct}
                    onChange={(v) => setForm({ ...form, discountPct: v })} type="number" suffix="%" autoComplete="off" />
                </Layout.Section>
              </Layout>
              <InlineStack gap="300">
                <Button variant="primary" onClick={handleCreate} loading={nav.state === "submitting"}>Save Rule</Button>
                <Button onClick={() => setShowForm(false)}>Cancel</Button>
              </InlineStack>
            </BlockStack>
          </Card>
        )}

        {/* ── Products Table ────────────────────── */}
        <Card padding="0">
          {products.length === 0 ? (
            <Box padding="800">
              <EmptyState
                heading="No upsell rules yet"
                action={{ content: "Add First Rule", onAction: () => setShowForm(true) }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Add upsell rules to suggest products inside the cart drawer and boost your AOV.</p>
              </EmptyState>
            </Box>
          ) : (
            <IndexTable
              resourceName={resourceName}
              itemCount={products.length}
              selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
              onSelectionChange={handleSelectionChange}
              headings={[
                { title: "Trigger Product" },
                { title: "Upsell Product" },
                { title: "Discount" },
                { title: "Status" },
                { title: "Actions" },
              ]}
            >
              {products.map((p, i) => (
                <IndexTable.Row id={p.id} key={p.id} selected={selectedResources.includes(p.id)} position={i}>
                  <IndexTable.Cell>
                    <BlockStack gap="050">
                      <Text variant="bodyMd" fontWeight="semibold">{p.triggerProductTitle || "—"}</Text>
                      <Text variant="bodySm" tone="subdued">{p.triggerProductId}</Text>
                    </BlockStack>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <InlineStack gap="200" blockAlign="center">
                      {p.upsellProductImage && (
                        <img src={p.upsellProductImage} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} />
                      )}
                      <BlockStack gap="050">
                        <Text variant="bodyMd" fontWeight="semibold">{p.upsellProductTitle || "—"}</Text>
                        <Text variant="bodySm" tone="subdued">${(p.upsellPrice / 100).toFixed(2)}</Text>
                      </BlockStack>
                    </InlineStack>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Badge tone="warning">{p.discountPct}% off</Badge>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Badge tone={p.enabled ? "success" : "critical"}>{p.enabled ? "Active" : "Disabled"}</Badge>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <InlineStack gap="150">
                      <form method="post" style={{ display: "inline" }}>
                        <input type="hidden" name="intent" value="toggle" />
                        <input type="hidden" name="id" value={p.id} />
                        <Button size="slim" variant="plain" submit>{p.enabled ? "Disable" : "Enable"}</Button>
                      </form>
                      <form method="post" style={{ display: "inline" }}>
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={p.id} />
                        <Button size="slim" variant="plain" tone="critical" submit>Delete</Button>
                      </form>
                    </InlineStack>
                  </IndexTable.Cell>
                </IndexTable.Row>
              ))}
            </IndexTable>
          )}
        </Card>

      </BlockStack>
    </Page>
  );
}
