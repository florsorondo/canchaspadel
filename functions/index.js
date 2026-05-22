const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const { FieldValue } = require("firebase-admin/firestore");
admin.initializeApp();

const db = admin.firestore();

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

/* ======================================================
   GETS
====================================================== */

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

    const snapshot = await db
      .collection("payment_methods")
      .where("arena_id", "==", arenaId)
      .where("available", "==", true)
      .get();

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

app.get("/arena/:arenaId/coupons", async (req, res) => {
  try {
    const { arenaId } = req.params;

    const snapshot = await db
      .collection("coupons")
      .where("arena_id", "==", arenaId)
      .where("active", "==", true)
      .get();

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

app.get("/arena/:arenaId/bookings", async (req, res) => {
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

app.post("/arena", async (req, res) => {
  try {
    const body = req.body;

    const arenaRef = await db.collection("arena").add({
      name: body.name,
      address: body.address,
      phone: body.phone,
      auth_id: body.auth_id,
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

/* ======================================================
   POST COURT
====================================================== */

app.post("/courts", async (req, res) => {

  try {

    const body = req.body;

    const {

      arena_id,

      name,

      description,

      available_days,

      available_hours,

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

      available: true,

      created_at: FieldValue.serverTimestamp(),

    });

    const batch = db.batch();

    available_days.forEach((day) => {

      available_hours.forEach((hour) => {

        const courtDateRef = db.collection("court_dates").doc();

        batch.set(courtDateRef, {

          field_id: courtRef.id,

          arena_id,

          day,

          hour,

          enabled: true,

          created_at: FieldValue.serverTimestamp(),

        });

      });

    });

    await batch.commit();

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

app.post("/payment-methods", async (req, res) => {
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

/* ======================================================
   POST COUPON
====================================================== */

app.post("/coupons", async (req, res) => {
  try {
    const body = req.body;

    const couponRef = await db.collection("coupons").add({
      arena_id: body.arena_id,
      code: body.code,
      type: body.type,
      value: body.value,
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
    } = body;

    // VALIDACIONES
    if (
      !arena_id ||
      !court_id ||
      !date ||
      !time ||
      !customer_name
    ) {
      return res.status(400).json({
        message: "Faltan campos obligatorios",
      });
    }

    // VALIDAR SI YA EXISTE RESERVA
    const existingBooking = await db
      .collection("bookings")
      .where("court_id", "==", court_id)
      .where("date", "==", date)
      .where("time", "==", time)
      .limit(1)
      .get();

    if (!existingBooking.empty) {
      return res.status(400).json({
        message: "Horario no disponible",
      });
    }

    // CREAR RESERVA
    const bookingRef = await db.collection("bookings").add({
      arena_id,
      court_id,
      date,
      time,
      customer_name,
      customer_email,
      customer_phone,
      status: "pending",
      created_at: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      message: "Reserva creada",
      booking_id: bookingRef.id,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error creando reserva",
    });
  }
});

/* ======================================================
   EXPORT
====================================================== */

exports.api = onRequest(app);