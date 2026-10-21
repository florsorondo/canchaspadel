const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const { FieldValue } = require("firebase-admin/firestore");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
admin.initializeApp();

const db = admin.firestore();

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});
const preferenceClient = new Preference(mpClient);
const paymentClient = new Payment(mpClient);

const FUNCTIONS_BASE_URL =
  process.env.FUNCTIONS_BASE_URL ||
  "https://us-central1-arenasanvicente.cloudfunctions.net/api";
const FRONTEND_BASE_URL =
  process.env.FRONTEND_BASE_URL || "http://localhost:5173";
const PENDING_EXPIRY_MINUTES =
  Number(process.env.BOOKING_PENDING_EXPIRY_MINUTES) || 30;
const PENDING_EXPIRY_MS = PENDING_EXPIRY_MINUTES * 60 * 1000;

const DIAS_SEMANA_POR_INDICE = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
];

const getDayOfWeek = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  return DIAS_SEMANA_POR_INDICE[dateObj.getDay()];
};

const regenerateCourtDates = async (courtId, arenaId, availableDays, availableHours) => {
  const existingSnapshot = await db
    .collection("court_dates")
    .where("field_id", "==", courtId)
    .get();

  // IDs fijos por cancha/día/hora: si se guarda dos veces a la vez, se pisa el mismo doc en vez de duplicarlo
  const days = [...new Set(availableDays)];
  const hours = [...new Set(availableHours)];
  const courtDateId = (day, hour) => `${courtId}_${day}_${hour}`;
  const newIds = new Set(days.flatMap((day) => hours.map((hour) => courtDateId(day, hour))));

  const batch = db.batch();

  existingSnapshot.docs
    .filter((doc) => !newIds.has(doc.id))
    .forEach((doc) => batch.delete(doc.ref));

  days.forEach((day) => {
    hours.forEach((hour) => {
      const courtDateRef = db.collection("court_dates").doc(courtDateId(day, hour));

      batch.set(courtDateRef, {
        field_id: courtId,
        arena_id: arenaId,
        day,
        hour,
        enabled: true,
        created_at: FieldValue.serverTimestamp(),
      });
    });
  });

  await batch.commit();
};

// Una inscripción ocupa cupo si está pagada, o si está pendiente de pago y no venció
const registrationOccupiesSpot = (registration, now = Date.now()) => {
  if (registration.status === "cancelled") return false;

  if (
    registration.status === "pending" &&
    registration.created_at &&
    now - registration.created_at.toMillis() > PENDING_EXPIRY_MS
  ) {
    return false;
  }

  return true;
};

const REGISTRATION_REF_PREFIX = "inscripcion:";

const isBookingBlocking = (bookingData, now = Date.now()) => {
  if (bookingData.status === "cancelled") return false;

  // Solo vencen las pendientes online (esperando Mercado Pago); una carga manual
  // sin pagar se cobra en el club y tiene que seguir ocupando el turno
  if (
    bookingData.status === "pending" &&
    bookingData.source !== "manual" &&
    bookingData.created_at &&
    now - bookingData.created_at.toMillis() > PENDING_EXPIRY_MS
  ) {
    return false;
  }

  return true;
};

/* ======================================================
   AUTH MIDDLEWARE
====================================================== */

const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const match = authHeader.match(/^Bearer (.+)$/);

    if (!match) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const decoded = await admin.auth().verifyIdToken(match[1]);
    req.uid = decoded.uid;

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
};

const resolveArenaId = async (req) => {
  if (req.params.arenaId) return req.params.arenaId;
  if (req.body?.arena_id) return req.body.arena_id;

  const lookups = [
    ["courtId", "courts"],
    ["paymentMethodId", "payment_methods"],
    ["couponId", "coupons"],
    ["eventId", "events"],
    ["bookingId", "bookings"],
  ];

  for (const [param, collection] of lookups) {
    if (req.params[param]) {
      const doc = await db.collection(collection).doc(req.params[param]).get();
      return doc.exists ? doc.data().arena_id : null;
    }
  }

  return null;
};

// Empleados del complejo: un doc por usuario en arena_staff (id = uid de Firebase Auth)
const getStaffDoc = (uid) => db.collection("arena_staff").doc(uid).get();

// "owner", "employee" o null si el usuario no pertenece al complejo
const getArenaRole = async (arenaDoc, uid) => {
  if (!arenaDoc.exists) return null;
  if (arenaDoc.data().auth_id === uid) return "owner";

  const staffDoc = await getStaffDoc(uid);

  return staffDoc.exists && staffDoc.data().arena_id === arenaDoc.id ? "employee" : null;
};

const verifyArenaRole = (allowedRoles) => async (req, res, next) => {
  try {
    const arenaId = await resolveArenaId(req);

    if (!arenaId) {
      return res.status(404).json({ message: "Recurso no encontrado" });
    }

    const arenaDoc = await db.collection("arena").doc(arenaId).get();
    const role = await getArenaRole(arenaDoc, req.uid);

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "No autorizado" });
    }

    req.arenaId = arenaId;
    req.arenaRole = role;

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error de autorización" });
  }
};

const verifyArenaMember = verifyArenaRole(["owner", "employee"]);
const verifyArenaOwner = verifyArenaRole(["owner"]);

/* ======================================================
   BOOKING / COUPON HELPERS
====================================================== */

// Revisa TODAS las reservas del turno (puede haber canceladas y activas a la vez)
const getSlotState = async (transaction, { courtId, date, time }) => {
  const slotQuery = db
    .collection("bookings")
    .where("court_id", "==", courtId)
    .where("date", "==", date)
    .where("time", "==", time);

  const slotSnap = await transaction.get(slotQuery);

  const taken = slotSnap.docs.some((doc) => isBookingBlocking(doc.data()));
  const staleBookingRefs = slotSnap.docs
    .filter((doc) => doc.data().status === "pending" && !isBookingBlocking(doc.data()))
    .map((doc) => doc.ref);

  return { taken, staleBookingRefs };
};

const reserveSlot = async (transaction, { arenaId, courtId, date, time }) => {
  const { taken, staleBookingRefs } = await getSlotState(transaction, {
    courtId,
    date,
    time,
  });

  if (taken) {
    throw new Error("Horario no disponible");
  }

  const dayBookingsQuery = db
    .collection("bookings")
    .where("arena_id", "==", arenaId)
    .where("date", "==", date);

  const dayBookings = await transaction.get(dayBookingsQuery);

  // Siguiente al mayor ya usado: con size + 1 se repetía el número al borrar un bloqueo del día
  const reservationNumber =
    Math.max(0, ...dayBookings.docs.map((doc) => Number(doc.data().reservation_number) || 0)) + 1;

  const [year, month, day] = date.split("-");
  const refId = `${day}-${month}-${year}-${reservationNumber}`;

  return { staleBookingRefs, refId, reservationNumber };
};

const normalizeCouponCode = (code) => String(code || "").trim().toUpperCase();

// Devuelve el motivo por el que el cupón no se puede usar, o null si es válido
const getCouponError = (coupon) => {
  if (!coupon) return "Cupón inválido";
  if (!coupon.active) return "Este cupón no está activo";

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  });

  if (coupon.valid_from && today < coupon.valid_from) {
    return "Este cupón todavía no está vigente";
  }
  if (coupon.valid_to && today > coupon.valid_to) return "Cupón vencido";

  return null;
};

const couponQuery = (arenaId, code) =>
  db
    .collection("coupons")
    .where("arena_id", "==", arenaId)
    .where("code", "==", normalizeCouponCode(code))
    .limit(1);

const findValidCoupon = async (transaction, arenaId, code) => {
  if (!normalizeCouponCode(code)) return null;

  const snapshot = await transaction.get(couponQuery(arenaId, code));
  const coupon = snapshot.empty
    ? null
    : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

  const couponError = getCouponError(coupon);

  if (couponError) {
    const error = new Error(couponError);
    error.isCouponError = true;
    throw error;
  }

  return coupon;
};

const applyCouponDiscount = (amount, coupon) => {
  if (!coupon) return amount;

  const discounted =
    coupon.type === "percentage"
      ? amount - (amount * Number(coupon.value || 0)) / 100
      : amount - Number(coupon.value || 0);

  return Math.max(Math.round(discounted), 0);
};

/* ======================================================
   GETS
====================================================== */
app.get("/my-arena/:authId", verifyAuth, async (req, res) => {
  try {
    if (req.params.authId !== req.uid) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const snapshot = await db
      .collection("arena")
      .where("auth_id", "==", req.uid)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return res.json({ id: doc.id, ...doc.data(), role: "owner" });
    }

    const staffDoc = await getStaffDoc(req.uid);
    const arenaDoc = staffDoc.exists
      ? await db.collection("arena").doc(staffDoc.data().arena_id).get()
      : null;

    if (!arenaDoc?.exists) {
      return res.status(404).json({ message: "Tu cuenta no tiene acceso a ningún complejo" });
    }

    return res.json({ id: arenaDoc.id, ...arenaDoc.data(), role: "employee" });
  } catch (error) {
    return res.status(500).json({
      message: "Error obteniendo arena",
    });
  }
});

app.get("/arena/:arenaId", async (req, res) => {
  try {
    const { arenaId } = req.params;

    const arenaDoc = await db.collection("arena").doc(arenaId).get();

    if (!arenaDoc.exists) {
      return res.status(404).json({
        message: "Arena no encontrada",
      });
    }

    return res.json({
      id: arenaDoc.id,
      ...arenaDoc.data(),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error interno",
    });
  }
});

app.get("/arena/:arenaId/courts", async (req, res) => {
  try {
    const { arenaId } = req.params;

    const snapshot = await db
      .collection("courts")
      .where("arena_id", "==", arenaId)
      .where("available", "==", true)
      .get();

    const courts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(courts);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error interno",
    });
  }
});

app.get("/arena/:arenaId/payment-methods", async (req, res) => {
  try {
    const { arenaId } = req.params;
    const includeUnavailable = req.query.all === "true";

    let query = db
      .collection("payment_methods")
      .where("arena_id", "==", arenaId);

    if (!includeUnavailable) {
      query = query.where("available", "==", true);
    }

    const snapshot = await query.get();

    const methods = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(methods);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error interno",
    });
  }
});

app.get("/arena/:arenaId/coupons", verifyAuth, verifyArenaMember, async (req, res) => {
  try {
    const { arenaId } = req.params;
    const includeInactive = req.query.all === "true";

    let query = db.collection("coupons").where("arena_id", "==", arenaId);

    if (!includeInactive) {
      query = query.where("active", "==", true);
    }

    const snapshot = await query.get();

    const coupons = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(coupons);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error interno",
    });
  }
});

app.get("/arena/:arenaId/bookings", verifyAuth, verifyArenaMember, async (req, res) => {
  try {
    const { arenaId } = req.params;

    const snapshot = await db
      .collection("bookings")
      .where("arena_id", "==", arenaId)
      .get();

    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(bookings);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error interno",
    });
  }
});

app.get("/courts/:courtId/availability", async (req, res) => {
  try {
    const { courtId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Falta el parámetro date",
      });
    }

    const courtDoc = await db.collection("courts").doc(courtId).get();

    if (!courtDoc.exists) {
      return res.status(404).json({
        message: "Cancha no encontrada",
      });
    }

    const dayOfWeek = getDayOfWeek(date);

    const templateSnapshot = await db
      .collection("court_dates")
      .where("field_id", "==", courtId)
      .where("day", "==", dayOfWeek)
      .where("enabled", "==", true)
      .get();

    const hoursTemplate = [...new Set(templateSnapshot.docs.map((doc) => doc.data().hour))];

    const bookingsSnapshot = await db
      .collection("bookings")
      .where("court_id", "==", courtId)
      .where("date", "==", date)
      .get();

    const now = Date.now();

    const takenHours = new Set(
      bookingsSnapshot.docs
        .filter((doc) => isBookingBlocking(doc.data(), now))
        .map((doc) => doc.data().time)
    );

    const hours = hoursTemplate.map((hour) => ({
      hour,
      taken: takenHours.has(hour),
    }));

    return res.json({ hours });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error obteniendo disponibilidad",
    });
  }
});

app.get("/bookings/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    const doc = await db.collection("bookings").doc(bookingId).get();

    if (!doc.exists) {
      return res.status(404).json({
        message: "Reserva no encontrada",
      });
    }

    return res.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error obteniendo reserva",
    });
  }
});

app.get("/courts/:courtId/dates", async (req, res) => {
  try {
    const { courtId } = req.params;

    console.log("courtId recibido:", courtId);

    const snapshot = await db
      .collection("court_dates")
      .where("field_id", "==", courtId)
      .get();

    const dates = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("cantidad encontrada:", dates.length);

    return res.json(dates);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error obteniendo horarios de la cancha",
    });
  }
});

/* ======================================================
   POST ARENA
====================================================== */

app.post("/arena", verifyAuth, async (req, res) => {
  try {
    const body = req.body;

    const existingSnapshot = await db
      .collection("arena")
      .where("auth_id", "==", req.uid)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      return res.status(409).json({
        message: "Ya existe un complejo para este usuario",
      });
    }

    if ((await getStaffDoc(req.uid)).exists) {
      return res.status(403).json({
        message: "Una cuenta de empleado no puede crear un complejo",
      });
    }

    const arenaRef = await db.collection("arena").add({
      name: body.name,
      address: body.address,
      phone: body.phone,
      auth_id: req.uid,
      instagram: body.instagram || "",
      logo_url: body.logo_url || "",
      available: true,
      created_at: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      message: "Arena creada",
      arena_id: arenaRef.id,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error creando arena",
    });
  }
});

app.patch("/arena/:arenaId", verifyAuth, verifyArenaMember, async (req, res) => {
  try {
    const { arenaId } = req.params;
    const {
      name,
      address,
      phone,
      instagram,
      description,
      opening_time,
      closing_time,
      days_open,
      deposit_amount,
    } = req.body;

    await db.collection("arena").doc(arenaId).update({
      name,
      address,
      phone,
      instagram: instagram || "",
      description: description || "",
      opening_time: opening_time || "",
      closing_time: closing_time || "",
      days_open: Array.isArray(days_open) ? days_open : [],
      deposit_amount: Number(deposit_amount) || 0,
      updated_at: FieldValue.serverTimestamp(),
    });

    return res.json({
      message: "Arena actualizada",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error actualizando arena",
    });
  }
});

/* ======================================================
   EQUIPO (EMPLEADOS DEL COMPLEJO) — SOLO DUEÑO
====================================================== */

app.get("/arena/:arenaId/staff", verifyAuth, verifyArenaOwner, async (req, res) => {
  try {
    const snapshot = await db
      .collection("arena_staff")
      .where("arena_id", "==", req.params.arenaId)
      .get();

    const staff = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return res.json(staff);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error obteniendo el equipo" });
  }
});

app.post("/arena/:arenaId/staff", verifyAuth, verifyArenaOwner, async (req, res) => {
  try {
    const { arenaId } = req.params;
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email) {
      return res.status(400).json({ message: "Completá nombre y email" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "La contraseña tiene que tener al menos 6 caracteres",
      });
    }

    let user;

    try {
      user = await admin.auth().createUser({ email, password, displayName: name });
    } catch (error) {
      if (error.code === "auth/email-already-exists") {
        return res.status(409).json({ message: "Ya existe una cuenta con ese email" });
      }
      if (error.code === "auth/invalid-email") {
        return res.status(400).json({ message: "El email no es válido" });
      }
      throw error;
    }

    await db.collection("arena_staff").doc(user.uid).set({
      arena_id: arenaId,
      name,
      email,
      role: "employee",
      created_by: req.uid,
      created_at: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({ message: "Empleado creado", id: user.uid });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creando el empleado" });
  }
});

app.delete("/arena/:arenaId/staff/:staffId", verifyAuth, verifyArenaOwner, async (req, res) => {
  try {
    const { arenaId, staffId } = req.params;
    const staffRef = db.collection("arena_staff").doc(staffId);
    const staffDoc = await staffRef.get();

    if (!staffDoc.exists || staffDoc.data().arena_id !== arenaId) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    await staffRef.delete();

    // Se borra la cuenta para que no pueda volver a iniciar sesión
    await admin
      .auth()
      .deleteUser(staffId)
      .catch((error) => {
        if (error.code !== "auth/user-not-found") throw error;
      });

    return res.json({ message: "Empleado eliminado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error eliminando el empleado" });
  }
});

/* ======================================================
   POST COURT
====================================================== */

app.post("/courts", verifyAuth, verifyArenaMember, async (req, res) => {

  try {

    const body = req.body;

    const {

      arena_id,

      name,

      description,

      available_days,

      available_hours,

      price,

      image_url,

    } = body;

    if (!arena_id || !name || !available_days || !available_hours) {

      return res.status(400).json({

        message: "Faltan campos obligatorios",

      });

    }

    if (!Array.isArray(available_days) || !Array.isArray(available_hours)) {

      return res.status(400).json({

        message: "available_days y available_hours deben ser arrays",

      });

    }

    const courtRef = await db.collection("courts").add({

      arena_id,

      name,

      description: description || "",

      available_days,

      available_hours,

      price: Number(price) || 0,

      image_url: image_url || "",

      available: true,

      created_at: FieldValue.serverTimestamp(),

    });

    await regenerateCourtDates(courtRef.id, arena_id, available_days, available_hours);

    return res.status(201).json({

      message: "Cancha creada correctamente",

      court_id: courtRef.id,

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      message: "Error creando cancha",

    });

  }

});

/* ======================================================
   POST PAYMENT METHOD
====================================================== */

app.post("/payment-methods", verifyAuth, verifyArenaMember, async (req, res) => {
  try {
    const body = req.body;

    const paymentRef = await db.collection("payment_methods").add({
      arena_id: body.arena_id,
      name: body.name,
      type: body.type,
      alias: body.alias || "",
      requires_deposit: body.requires_deposit || false,
      available: true,
      created_at: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      message: "Metodo de pago creado",
      payment_method_id: paymentRef.id,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error creando metodo de pago",
    });
  }
});

app.patch(
  "/payment-methods/:paymentMethodId",
  verifyAuth,
  verifyArenaMember,
  async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    const { available } = req.body;

    await db.collection("payment_methods").doc(paymentMethodId).update({
      available,
      updated_at: FieldValue.serverTimestamp(),
    });

    return res.json({
      message: "Metodo de pago actualizado",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error actualizando metodo de pago",
    });
  }
});

/* ======================================================
   POST COUPON
====================================================== */

app.post("/coupons", verifyAuth, verifyArenaMember, async (req, res) => {
  try {
    const body = req.body;

    if (!body.arena_id || !body.code || !body.type || !body.value) {
      return res.status(400).json({
        message: "Faltan campos obligatorios",
      });
    }

    const existing = await couponQuery(body.arena_id, body.code).get();

    if (!existing.empty) {
      return res.status(409).json({
        message: "Ya existe un cupón con ese código",
      });
    }

    const couponRef = await db.collection("coupons").add({
      arena_id: body.arena_id,
      code: normalizeCouponCode(body.code),
      type: body.type,
      value: Number(body.value) || 0,
      active: true,
      valid_from: body.valid_from || null,
      valid_to: body.valid_to || null,
      created_at: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      message: "Cupon creado",
      coupon_id: couponRef.id,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error creando cupon",
    });
  }
});

app.patch("/coupons/:couponId", verifyAuth, verifyArenaMember, async (req, res) => {
  try {
    const { couponId } = req.params;
    const { active, value, valid_from, valid_to } = req.body;

    const updates = { updated_at: FieldValue.serverTimestamp() };

    if (typeof active === "boolean") updates.active = active;
    if (value !== undefined) updates.value = Number(value) || 0;
    if (valid_from !== undefined) updates.valid_from = valid_from || null;
    if (valid_to !== undefined) updates.valid_to = valid_to || null;

    await db.collection("coupons").doc(couponId).update(updates);

    return res.json({ message: "Cupón actualizado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error actualizando cupón" });
  }
});

app.post("/arena/:arenaId/coupons/validate", async (req, res) => {
  try {
    const { arenaId } = req.params;
    const { code, court_id } = req.body;

    if (!code || !court_id) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const courtDoc = await db.collection("courts").doc(court_id).get();

    if (!courtDoc.exists) {
      return res.status(404).json({ message: "Cancha no encontrada" });
    }

    const snapshot = await couponQuery(arenaId, code).get();
    const coupon = snapshot.empty
      ? null
      : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

    const couponError = getCouponError(coupon);

    if (couponError) {
      return res.status(400).json({ valid: false, message: couponError });
    }

    const amount = Number(courtDoc.data().price) || 0;
    const discountedAmount = applyCouponDiscount(amount, coupon);

    return res.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      amount,
      discounted_amount: discountedAmount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error validando cupón" });
  }
});


app.patch("/bookings/:bookingId", verifyAuth, verifyArenaMember, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status requerido",
      });
    }

    await db.collection("bookings").doc(bookingId).update({
      status,
      updated_at: FieldValue.serverTimestamp(),
    });

    return res.json({
      message: "Reserva actualizada",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error actualizando reserva",
    });
  }
});

app.post("/bookings/:bookingId/cancel", async (req, res) => {
  try {
    const { bookingId } = req.params;

    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    if (bookingSnap.data().status === "completed") {
      return res.status(400).json({
        message: "No se puede cancelar una reserva ya finalizada",
      });
    }

    await bookingRef.update({
      status: "cancelled",
      updated_at: FieldValue.serverTimestamp(),
    });

    return res.json({ message: "Reserva cancelada" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error cancelando reserva" });
  }
});
/* ======================================================
   POST BOOKING
====================================================== */

app.post("/bookings", async (req, res) => {
  try {
    const body = req.body;

    const {
      arena_id,
      court_id,
      date,
      time,
      customer_name,
      customer_email,
      customer_phone,
      payment_option,
      coupon_code,
    } = body;

    if (!arena_id || !court_id || !date || !time || !customer_name) {
      return res.status(400).json({
        message: "Faltan campos obligatorios",
      });
    }

    if (payment_option && !["full", "deposit"].includes(payment_option)) {
      return res.status(400).json({
        message: "payment_option inválido",
      });
    }

    const result = await db.runTransaction(async (transaction) => {
      const courtRef = db.collection("courts").doc(court_id);
      const courtSnap = await transaction.get(courtRef);

      if (!courtSnap.exists) {
        throw new Error("Cancha no encontrada");
      }

      const { staleBookingRefs, refId, reservationNumber } = await reserveSlot(
        transaction,
        { arenaId: arena_id, courtId: court_id, date, time }
      );

      const basePrice = Number(courtSnap.data().price) || 0;
      const coupon = await findValidCoupon(transaction, arena_id, coupon_code);
      const amount = applyCouponDiscount(basePrice, coupon);

      let depositAmount = 0;

      if (payment_option === "deposit") {
        const arenaRef = db.collection("arena").doc(arena_id);
        const arenaSnap = await transaction.get(arenaRef);
        const configuredDeposit = Number(arenaSnap.data()?.deposit_amount) || 0;
        depositAmount = Math.min(configuredDeposit, amount);
      }

      staleBookingRefs.forEach((staleRef) => {
        transaction.update(staleRef, {
          status: "cancelled",
          updated_at: FieldValue.serverTimestamp(),
        });
      });

      const bookingRef = db.collection("bookings").doc();

      transaction.set(bookingRef, {
        ref_id: refId,
        reservation_number: reservationNumber,

        arena_id,
        court_id,
        date,
        time,
        customer_name,
        customer_email: customer_email || "",
        customer_phone: customer_phone || "",

        amount,
        deposit_amount: depositAmount,
        payment_option: payment_option || null,
        coupon_code: coupon ? coupon.code : null,

        status: "pending",
        source: "online",
        created_at: FieldValue.serverTimestamp(),
      });

      return {
        booking_id: bookingRef.id,
        ref_id: refId,
        amount,
        depositAmount,
      };
    });

    let initPoint = null;

    if (payment_option) {
      const unitPrice =
        payment_option === "deposit" ? result.depositAmount : result.amount;

      // Si Mercado Pago no genera el pago, se cancela la reserva para no dejar el turno bloqueado
      try {
        const preference = await preferenceClient.create({
          body: {
            items: [
              {
                title: `Reserva ${result.ref_id}`,
                quantity: 1,
                unit_price: unitPrice,
                currency_id: "ARS",
              },
            ],
            external_reference: result.booking_id,
            notification_url: `${FUNCTIONS_BASE_URL}/webhooks/mercadopago`,
            back_urls: {
              success: `${FRONTEND_BASE_URL}/booking/${arena_id}/confirmacion?booking_id=${result.booking_id}`,
              pending: `${FRONTEND_BASE_URL}/booking/${arena_id}/confirmacion?booking_id=${result.booking_id}`,
              failure: `${FRONTEND_BASE_URL}/booking/${arena_id}/confirmacion?booking_id=${result.booking_id}`,
            },
            auto_return: "approved",
          },
        });

        await db.collection("bookings").doc(result.booking_id).update({
          mp_preference_id: preference.id,
        });

        initPoint = preference.init_point;
      } catch (mpError) {
        console.error("Error creando la preferencia de Mercado Pago:", mpError);

        await db.collection("bookings").doc(result.booking_id).update({
          status: "cancelled",
          cancel_reason: "payment_init_failed",
          updated_at: FieldValue.serverTimestamp(),
        });

        return res.status(502).json({
          message: "No se pudo iniciar el pago. Probá de nuevo en unos minutos.",
        });
      }
    }

    return res.status(201).json({
      message: "Reserva creada",
      booking_id: result.booking_id,
      ref_id: result.ref_id,
      init_point: initPoint,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "Horario no disponible") {
      return res.status(400).json({
        message: "Horario no disponible",
      });
    }

    if (error.message === "Cancha no encontrada") {
      return res.status(404).json({
        message: "Cancha no encontrada",
      });
    }

    if (error.isCouponError) {
      return res.status(400).json({
        message: error.message,
        coupon_error: true,
      });
    }

    return res.status(500).json({
      message: "Error creando reserva",
    });
  }
});

/* ======================================================
   RESERVA MANUAL (ADMIN)
====================================================== */

app.post(
  "/arena/:arenaId/bookings/manual",
  verifyAuth,
  verifyArenaMember,
  async (req, res) => {
    try {
      const { arenaId } = req.params;
      const { court_id, date, time, customer_name, customer_phone, payment_method, mark_paid } =
        req.body;

      if (!court_id || !date || !time || !customer_name) {
        return res.status(400).json({
          message: "Faltan campos obligatorios",
        });
      }

      const result = await db.runTransaction(async (transaction) => {
        const courtRef = db.collection("courts").doc(court_id);
        const courtSnap = await transaction.get(courtRef);

        if (!courtSnap.exists || courtSnap.data().arena_id !== arenaId) {
          throw new Error("Cancha no encontrada");
        }

        const { staleBookingRefs, refId, reservationNumber } = await reserveSlot(
          transaction,
          { arenaId, courtId: court_id, date, time }
        );

        const amount = Number(courtSnap.data().price) || 0;

        staleBookingRefs.forEach((staleRef) => {
          transaction.update(staleRef, {
            status: "cancelled",
            updated_at: FieldValue.serverTimestamp(),
          });
        });

        const bookingRef = db.collection("bookings").doc();

        transaction.set(bookingRef, {
          ref_id: refId,
          reservation_number: reservationNumber,

          arena_id: arenaId,
          court_id,
          date,
          time,
          customer_name,
          customer_email: "",
          customer_phone: customer_phone || "",

          amount,
          deposit_amount: 0,
          payment_option: null,
          coupon_code: null,
          payment_method: payment_method || "efectivo",

          status: mark_paid ? "paid" : "pending",
          source: "manual",
          created_by: req.uid,
          created_at: FieldValue.serverTimestamp(),
        });

        return { booking_id: bookingRef.id, ref_id: refId };
      });

      return res.status(201).json({
        message: "Reserva cargada",
        booking_id: result.booking_id,
        ref_id: result.ref_id,
      });
    } catch (error) {
      console.error(error);

      if (error.message === "Horario no disponible") {
        return res.status(400).json({ message: "Horario no disponible" });
      }

      if (error.message === "Cancha no encontrada") {
        return res.status(404).json({ message: "Cancha no encontrada" });
      }

      return res.status(500).json({ message: "Error creando reserva" });
    }
  }
);

/* ======================================================
   BLOQUEO DE HORARIOS (TORNEOS, ETC.)
====================================================== */

app.post(
  "/arena/:arenaId/blocks",
  verifyAuth,
  verifyArenaMember,
  async (req, res) => {
    try {
      const { arenaId } = req.params;
      const { court_id, date, times, reason } = req.body;

      if (!court_id || !date || !Array.isArray(times) || times.length === 0) {
        return res.status(400).json({
          message: "Faltan campos obligatorios",
        });
      }

      const courtSnap = await db.collection("courts").doc(court_id).get();

      if (!courtSnap.exists || courtSnap.data().arena_id !== arenaId) {
        return res.status(404).json({ message: "Cancha no encontrada" });
      }

      const created = [];
      const skipped = [];

      for (const time of [...new Set(times)]) {
        const blocked = await db.runTransaction(async (transaction) => {
          const { taken } = await getSlotState(transaction, {
            courtId: court_id,
            date,
            time,
          });

          if (taken) {
            return false;
          }

          const blockRef = db.collection("bookings").doc();

          transaction.set(blockRef, {
            arena_id: arenaId,
            court_id,
            date,
            time,
            customer_name: reason?.trim() || "Horario bloqueado",
            customer_email: "",
            customer_phone: "",
            amount: 0,
            deposit_amount: 0,
            payment_option: null,
            coupon_code: null,
            reason: reason?.trim() || "",
            status: "blocked",
            source: "block",
            created_by: req.uid,
            created_at: FieldValue.serverTimestamp(),
          });

          return true;
        });

        if (blocked) {
          created.push(time);
        } else {
          skipped.push(time);
        }
      }

      return res.status(201).json({
        message: "Horarios bloqueados",
        created,
        skipped,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error bloqueando horarios" });
    }
  }
);

app.delete("/bookings/:bookingId", verifyAuth, verifyArenaMember, async (req, res) => {
  try {
    const { bookingId } = req.params;

    await db.collection("bookings").doc(bookingId).delete();

    return res.json({ message: "Reserva eliminada" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error eliminando reserva" });
  }
});

/* ======================================================
   MERCADO PAGO WEBHOOK
====================================================== */

app.post("/webhooks/mercadopago", async (req, res) => {
  try {
    const paymentId = req.query["data.id"] || req.body?.data?.id;
    const topic = req.query.type || req.body?.type;

    if (!paymentId || topic !== "payment") {
      return res.sendStatus(200);
    }

    const payment = await paymentClient.get({ id: paymentId });
    const bookingId = payment.external_reference;
    const mpStatus = payment.status;

    if (!bookingId) {
      return res.sendStatus(200);
    }

    if (bookingId.startsWith(REGISTRATION_REF_PREFIX)) {
      const registrationRef = db
        .collection("event_registrations")
        .doc(bookingId.slice(REGISTRATION_REF_PREFIX.length));
      const registrationSnap = await registrationRef.get();

      if (!registrationSnap.exists || registrationSnap.data().mp_payment_id === String(paymentId)) {
        return res.sendStatus(200);
      }

      if (mpStatus === "approved") {
        await registrationRef.update({
          status: "paid",
          mp_payment_id: String(paymentId),
          paid_at: FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp(),
        });
      } else if (mpStatus === "rejected" || mpStatus === "cancelled") {
        await registrationRef.update({
          status: "cancelled",
          mp_payment_id: String(paymentId),
          updated_at: FieldValue.serverTimestamp(),
        });
      }

      return res.sendStatus(200);
    }

    await db.runTransaction(async (transaction) => {
      const bookingRef = db.collection("bookings").doc(bookingId);
      const bookingSnap = await transaction.get(bookingRef);

      if (!bookingSnap.exists) return;

      const booking = bookingSnap.data();

      if (booking.mp_payment_id === String(paymentId)) {
        return;
      }

      if (mpStatus === "approved") {
        transaction.update(bookingRef, {
          status: booking.payment_option === "deposit" ? "deposit_paid" : "paid",
          mp_payment_id: String(paymentId),
          paid_at: FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp(),
        });
      } else if (mpStatus === "rejected" || mpStatus === "cancelled") {
        transaction.update(bookingRef, {
          status: "cancelled",
          mp_payment_id: String(paymentId),
          updated_at: FieldValue.serverTimestamp(),
        });
      }
    });

    return res.sendStatus(200);
  } catch (error) {
    console.error("Error procesando webhook de Mercado Pago:", error);
    return res.sendStatus(200);
  }
});

app.patch("/courts/:courtId", verifyAuth, verifyArenaMember, async (req, res) => {
  try {
    const { courtId } = req.params;
    const {
      name,
      description,
      available_days,
      available_hours,
      available,
      price,
      image_url,
    } = req.body;

    if (!Array.isArray(available_days) || !Array.isArray(available_hours)) {
      return res.status(400).json({
        message: "available_days y available_hours deben ser arrays",
      });
    }

    const courtDoc = await db.collection("courts").doc(courtId).get();

    if (!courtDoc.exists) {
      return res.status(404).json({
        message: "Cancha no encontrada",
      });
    }

    await db.collection("courts").doc(courtId).update({
      name,
      description: description || "",
      available_days,
      available_hours,
      available,
      price: Number(price) || 0,
      image_url: image_url || courtDoc.data().image_url || "",
      updated_at: FieldValue.serverTimestamp(),
    });

    await regenerateCourtDates(
      courtId,
      courtDoc.data().arena_id,
      available_days,
      available_hours
    );

    return res.json({
      message: "Cancha actualizada",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error actualizando cancha",
    });
  }
});

app.delete("/courts/:courtId", verifyAuth, verifyArenaMember, async (req, res) => {
  try {
    const { courtId } = req.params;

    await db.collection("courts").doc(courtId).update({
      available: false,
      deleted_at: FieldValue.serverTimestamp(),
    });

    return res.json({
      message: "Cancha eliminada",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error eliminando cancha",
    });
  }
});
/* ======================================================
   EVENTOS / CANCHA LIBRE
====================================================== */

app.post("/events", verifyAuth, verifyArenaMember, async (req, res) => {
  try {
    const { arena_id, court_id, title, date, time, end_time, spots, price, deposit } = req.body;

    // Turnos que ocupa la cancha libre (si no mandan "times", es un solo turno)
    const times = Array.isArray(req.body.times) && req.body.times.length > 0
      ? [...new Set(req.body.times)].sort()
      : [time];

    if (!arena_id || !court_id || !title || !date || !times[0] || !spots) {
      return res.status(400).json({
        message: "Faltan campos obligatorios",
      });
    }

    const eventId = await db.runTransaction(async (transaction) => {
      const takenTimes = [];

      for (const slotTime of times) {
        const { taken } = await getSlotState(transaction, {
          courtId: court_id,
          date,
          time: slotTime,
        });

        if (taken) takenTimes.push(slotTime);
      }

      if (takenTimes.length > 0) {
        const error = new Error(`Horario no disponible: ${takenTimes.join(", ")}`);
        error.isSlotTaken = true;
        throw error;
      }

      const eventRef = db.collection("events").doc();

      transaction.set(eventRef, {
        arena_id,
        court_id,
        title,
        date,
        time: times[0],
        end_time: end_time || null,
        times,
        spots: Number(spots) || 0,
        price: Number(price) || 0,
        deposit: Number(deposit) || 0,
        status: "active",
        created_at: FieldValue.serverTimestamp(),
      });

      times.forEach((slotTime) => {
        transaction.set(db.collection("bookings").doc(), {
          arena_id,
          court_id,
          date,
          time: slotTime,
          customer_name: `Cancha libre: ${title}`,
          customer_email: "",
          customer_phone: "",
          amount: 0,
          deposit_amount: 0,
          payment_option: null,
          coupon_code: null,
          reason: title,
          event_id: eventRef.id,
          status: "blocked",
          source: "event",
          created_by: req.uid,
          created_at: FieldValue.serverTimestamp(),
        });
      });

      return eventRef.id;
    });

    return res.status(201).json({
      message: "Evento creado",
      event_id: eventId,
    });
  } catch (error) {
    console.error(error);

    if (error.isSlotTaken) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Error creando evento",
    });
  }
});

app.get("/arena/:arenaId/events", async (req, res) => {
  try {
    const { arenaId } = req.params;

    const snapshot = await db
      .collection("events")
      .where("arena_id", "==", arenaId)
      .where("status", "==", "active")
      .get();

    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(events);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error obteniendo eventos",
    });
  }
});

app.get("/events/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    const eventDoc = await db.collection("events").doc(eventId).get();

    if (!eventDoc.exists) {
      return res.status(404).json({
        message: "Evento no encontrado",
      });
    }

    const registrationsSnapshot = await db
      .collection("event_registrations")
      .where("event_id", "==", eventId)
      .get();

    const event = eventDoc.data();
    const occupied = registrationsSnapshot.docs.filter((doc) =>
      registrationOccupiesSpot(doc.data())
    ).length;
    const spotsLeft = Math.max((event.spots || 0) - occupied, 0);

    return res.json({
      id: eventDoc.id,
      ...event,
      spots_left: spotsLeft,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error obteniendo evento",
    });
  }
});

app.post("/events/:eventId/register", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, last_name, email, phone } = req.body;

    if (!name || !last_name || !email || !phone) {
      return res.status(400).json({
        message: "Faltan campos obligatorios",
      });
    }

    const result = await db.runTransaction(async (transaction) => {
      const eventRef = db.collection("events").doc(eventId);
      const eventSnap = await transaction.get(eventRef);

      if (!eventSnap.exists || eventSnap.data().status !== "active") {
        throw new Error("Evento no encontrado");
      }

      const event = eventSnap.data();

      const registrationsQuery = db
        .collection("event_registrations")
        .where("event_id", "==", eventId);

      const registrationsSnap = await transaction.get(registrationsQuery);
      const occupied = registrationsSnap.docs.filter((doc) =>
        registrationOccupiesSpot(doc.data())
      ).length;

      if (occupied >= (event.spots || 0)) {
        throw new Error("Cupos completos");
      }

      // Se cobra la seña del evento; si no tiene seña, el precio completo
      const price = Number(event.price) || 0;
      const deposit = Number(event.deposit) || 0;
      const amountToPay = deposit > 0 ? Math.min(deposit, price || deposit) : price;

      const registrationRef = db.collection("event_registrations").doc();

      transaction.set(registrationRef, {
        event_id: eventId,
        arena_id: event.arena_id,
        name,
        last_name,
        email,
        phone,
        amount: amountToPay,
        status: amountToPay > 0 ? "pending" : "confirmed",
        created_at: FieldValue.serverTimestamp(),
      });

      return { registrationId: registrationRef.id, amountToPay, title: event.title };
    });

    if (result.amountToPay <= 0) {
      return res.status(201).json({ message: "Registro exitoso" });
    }

    try {
      const backUrl = `${FRONTEND_BASE_URL}/cancha-libre/${eventId}`;

      const preference = await preferenceClient.create({
        body: {
          items: [
            {
              title: `Seña cancha libre: ${result.title}`,
              quantity: 1,
              unit_price: result.amountToPay,
              currency_id: "ARS",
            },
          ],
          external_reference: `${REGISTRATION_REF_PREFIX}${result.registrationId}`,
          notification_url: `${FUNCTIONS_BASE_URL}/webhooks/mercadopago`,
          back_urls: { success: backUrl, pending: backUrl, failure: backUrl },
          auto_return: "approved",
        },
      });

      await db.collection("event_registrations").doc(result.registrationId).update({
        mp_preference_id: preference.id,
      });

      return res.status(201).json({
        message: "Registro creado",
        init_point: preference.init_point,
      });
    } catch (mpError) {
      console.error("Error creando la preferencia de Mercado Pago:", mpError);

      await db.collection("event_registrations").doc(result.registrationId).update({
        status: "cancelled",
        cancel_reason: "payment_init_failed",
        updated_at: FieldValue.serverTimestamp(),
      });

      return res.status(502).json({
        message: "No se pudo iniciar el pago. Probá de nuevo en unos minutos.",
      });
    }
  } catch (error) {
    console.error(error);

    if (error.message === "Cupos completos") {
      return res.status(400).json({
        message: "Cupos completos",
      });
    }

    if (error.message === "Evento no encontrado") {
      return res.status(404).json({
        message: "Evento no encontrado",
      });
    }

    return res.status(500).json({
      message: "Error registrando jugador",
    });
  }
});

app.get(
  "/events/:eventId/registrations",
  verifyAuth,
  verifyArenaMember,
  async (req, res) => {
    try {
      const { eventId } = req.params;

      const snapshot = await db
        .collection("event_registrations")
        .where("event_id", "==", eventId)
        .get();

      const registrations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.json(registrations);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error obteniendo anotados" });
    }
  }
);

app.patch("/events/:eventId", verifyAuth, verifyArenaMember, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, spots, price, date, time, title } = req.body;

    // Fecha y hora no se editan: el bloqueo del turno quedaría en el horario viejo
    if (date || time) {
      return res.status(400).json({
        message: "Para cambiar fecha u hora, cancelá el evento y creá uno nuevo",
      });
    }

    const updates = { updated_at: FieldValue.serverTimestamp() };

    if (status) updates.status = status;
    if (spots !== undefined) updates.spots = Number(spots) || 0;
    if (price !== undefined) updates.price = Number(price) || 0;
    if (title) updates.title = title;

    await db.collection("events").doc(eventId).update(updates);

    if (status === "cancelled") {
      const blockSnapshot = await db
        .collection("bookings")
        .where("event_id", "==", eventId)
        .where("status", "==", "blocked")
        .get();

      const batch = db.batch();

      blockSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          status: "cancelled",
          updated_at: FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
    }

    return res.json({ message: "Evento actualizado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error actualizando evento" });
  }
});

/* ======================================================
   EXPORT
====================================================== */

exports.api = onRequest(app);