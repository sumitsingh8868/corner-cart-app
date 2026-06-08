import db from "../db.server";

export async function getSettings(shop) {
  return db.cartSettings.upsert({
    where: { shop },
    update: {},
    create: { shop },
  });
}

export async function updateSettings(shop, data) {
  return db.cartSettings.upsert({
    where: { shop },
    update: data,
    create: { shop, ...data },
  });
}

export async function getUpsellProducts(shop) {
  return db.upsellProduct.findMany({
    where: { shop },
    orderBy: { position: "asc" },
  });
}

export async function createUpsellProduct(shop, data) {
  const count = await db.upsellProduct.count({ where: { shop } });
  return db.upsellProduct.create({
    data: { shop, position: count, ...data },
  });
}

export async function updateUpsellProduct(id, shop, data) {
  return db.upsellProduct.updateMany({
    where: { id, shop },
    data,
  });
}

export async function deleteUpsellProduct(id, shop) {
  return db.upsellProduct.deleteMany({ where: { id, shop } });
}
