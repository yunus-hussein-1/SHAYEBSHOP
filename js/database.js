let _supabase = null;
let _dbSession = null;

function dbIsConfigured() {
  const c = window.ALSHAYEB_DB_CONFIG || {};
  return Boolean(c.supabaseUrl && c.supabaseAnonKey);
}

function dbClient() {
  if (!_supabase && dbIsConfigured()) {
    _supabase = window.supabase.createClient(
      ALSHAYEB_DB_CONFIG.supabaseUrl,
      ALSHAYEB_DB_CONFIG.supabaseAnonKey
    );
  }
  return _supabase;
}

function dbRowToStore(row, products) {
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    ownerName: row.owner_name,
    storeName: row.store_name,
    tagline: row.tagline,
    logo: row.logo,
    banner: row.banner,
    rating: Number(row.rating),
    sales: row.sales,
    revenue: Number(row.revenue),
    reviews: row.reviews || [],
    banned: row.banned || false,
    banReason: row.ban_reason || "",
    agreedCommission: row.agreed_commission || false,
    products: (products || []).map(dbRowToProduct)
  };
}

function dbRowToProduct(row) {
  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    category: row.category,
    featured: row.featured,
    sales: row.sales,
    image: row.image
  };
}

function dbStoreToRow(store) {
  return {
    id: store.id,
    user_id: store.userId || null,
    slug: store.slug,
    owner_name: store.ownerName,
    store_name: store.storeName,
    tagline: store.tagline,
    logo: store.logo,
    banner: store.banner,
    rating: store.rating ?? 5,
    sales: store.sales ?? 0,
    revenue: store.revenue ?? 0,
    reviews: store.reviews || [],
    banned: store.banned || false,
    ban_reason: store.banReason || null,
    agreed_commission: store.agreedCommission || false
  };
}

function dbProductToRow(product, storeId) {
  return {
    id: product.id,
    store_id: storeId,
    title: product.title,
    price: product.price,
    category: product.category,
    featured: product.featured || false,
    sales: product.sales || 0,
    image: product.image
  };
}

async function dbRestoreSession() {
  const sb = dbClient();
  if (!sb) return null;
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { _dbSession = null; return null; }

  const { data: profile } = await sb.from("profiles").select("*").eq("id", session.user.id).single();
  const founderEmail = (ALSHAYEB_DB_CONFIG.founderEmail || "").toLowerCase();
  const isFounder = profile?.role === "founder" || session.user.email?.toLowerCase() === founderEmail;

  _dbSession = {
    userId: session.user.id,
    name: profile?.name || session.user.user_metadata?.name || session.user.user_metadata?.full_name || "",
    email: session.user.email,
    storeId: profile?.store_id || null,
    role: isFounder ? "founder" : (profile?.role || "buyer"),
    emailVerified: Boolean(session.user.email_confirmed_at)
  };
  return _dbSession;
}

async function dbFetchAllStores(includeBanned = false) {
  const sb = dbClient();
  let query = sb.from("stores").select("*").order("created_at", { ascending: false });
  if (!includeBanned) query = query.eq("banned", false);
  const { data: storeRows, error } = await query;
  if (error) throw error;
  const { data: productRows } = await sb.from("products").select("*");
  return (storeRows || []).map((row) =>
    dbRowToStore(row, (productRows || []).filter((p) => p.store_id === row.id))
  );
}

async function dbSaveAllStores(stores) {
  const sb = dbClient();
  for (const store of stores) {
    const { error: storeErr } = await sb.from("stores").upsert(dbStoreToRow(store));
    if (storeErr) throw storeErr;
    if (store.products?.length) {
      const { error: prodErr } = await sb.from("products").upsert(store.products.map((p) => dbProductToRow(p, store.id)));
      if (prodErr) throw prodErr;
    }
  }
}

async function dbDeleteStore(storeId) {
  const sb = dbClient();
  await sb.from("products").delete().eq("store_id", storeId);
  const { error } = await sb.from("stores").delete().eq("id", storeId);
  if (error) throw error;
}

async function dbBanStore(storeId, banned, reason = "") {
  const sb = dbClient();
  const { error } = await sb.from("stores").update({ banned, ban_reason: reason }).eq("id", storeId);
  if (error) throw error;
}

async function dbDeleteProduct(productId) {
  const sb = dbClient();
  const { error } = await sb.from("products").delete().eq("id", productId);
  if (error) throw error;
}

async function dbSignUp(name, email, password) {
  const sb = dbClient();
  const redirectTo = (ALSHAYEB_DB_CONFIG.siteDomain || window.location.origin) + "/login.html";
  const { data, error } = await sb.auth.signUp({
    email, password,
    options: { data: { name }, emailRedirectTo: redirectTo }
  });
  if (error) throw error;
  return data;
}

async function dbSignIn(email, password) {
  const sb = dbClient();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user?.email_confirmed_at) {
    await sb.auth.signOut();
    throw new Error("يجب تأكيد بريدك الإلكتروني أولاً. افحص صندوق الوارد.");
  }
  await dbRestoreSession();
  return data;
}

async function dbSignInWithGoogle() {
  const sb = dbClient();
  const redirectTo = (ALSHAYEB_DB_CONFIG.siteDomain || window.location.origin) + "/login.html";
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo }
  });
  if (error) throw error;
}

async function dbHandleOAuthCallback() {
  const sb = dbClient();
  const { data: { session } } = await sb.auth.getSession();
  if (session) await dbRestoreSession();
  return session;
}

async function dbSignOut() {
  const sb = dbClient();
  await sb.auth.signOut();
  _dbSession = null;
}

async function dbUpdateProfileStoreId(userId, storeId) {
  const sb = dbClient();
  await sb.from("profiles").update({ store_id: storeId, role: "seller" }).eq("id", userId);
  if (_dbSession) { _dbSession.storeId = storeId; _dbSession.role = "seller"; }
}

async function dbGetCart() {
  const sb = dbClient();
  if (!_dbSession?.userId) return [];
  const { data, error } = await sb.from("cart_items").select("*").eq("user_id", _dbSession.userId);
  if (error) throw error;
  return (data || []).map((r) => ({ storeId: r.store_id, productId: r.product_id, qty: r.qty }));
}

async function dbSaveCart(items) {
  const sb = dbClient();
  if (!_dbSession?.userId) return;
  await sb.from("cart_items").delete().eq("user_id", _dbSession.userId);
  if (items.length) {
    await sb.from("cart_items").insert(items.map((i) => ({
      user_id: _dbSession.userId, store_id: i.storeId, product_id: i.productId, qty: i.qty
    })));
  }
}

async function dbIncrementSales(productId, storeId, qty, amount) {
  const sb = dbClient();
  await sb.rpc("increment_product_sales", { p_product_id: productId, p_qty: qty });
  await sb.rpc("increment_store_stats", { p_store_id: storeId, p_qty: qty, p_amount: amount });
}

async function dbCreateOrder(order) {
  const sb = dbClient();
  const { error } = await sb.from("orders").insert({
    id: order.id,
    user_id: order.userId,
    store_id: order.storeId,
    items: order.items,
    total_syp: order.totalSyp,
    commission_syp: order.commissionSyp || 0,
    seller_amount_syp: order.sellerAmountSyp || 0,
    payment_method: "store",
    buyer_name: order.buyerName,
    buyer_phone: order.buyerPhone,
    buyer_address: order.buyerAddress,
    status: "pending"
  });
  if (error) throw error;
}

async function dbFetchOrders() {
  const sb = dbClient();
  const { data, error } = await sb.from("orders").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

async function dbUpdateOrderStatus(orderId, status) {
  const sb = dbClient();
  const { error } = await sb.from("orders").update({ status }).eq("id", orderId);
  if (error) throw error;
}

function dbCurrentUser() {
  return _dbSession;
}
