const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = require("@firebase/rules-unit-testing");
const {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} = require("firebase/firestore");

const projectId = "popcornly2-auth-favorites-integration";
const rules = fs.readFileSync(path.join(__dirname, "..", "..", "firestore.rules"), "utf8");

function emulatorHostAndPort() {
  const hostValue = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
  const [host, portText] = hostValue.split(":");
  return { host, port: Number(portText || "8080") };
}

let testEnv;

test.before(async () => {
  const { host, port } = emulatorHostAndPort();
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { host, port, rules },
  });
});

test.after(async () => {
  await testEnv.cleanup();
});

test.beforeEach(async () => {
  await testEnv.clearFirestore();
});

test("authenticated user can create profile + add/list/delete own favorite", async () => {
  const uid = "user_1";
  const db = testEnv.authenticatedContext(uid).firestore();

  await assertSucceeds(
    setDoc(doc(db, "users", uid), {
      uid,
      email: "user1@example.com",
      username: "moviefan",
      createdAt: new Date().toISOString(),
    })
  );

  await assertSucceeds(
    setDoc(doc(db, "favorites", "fav_1"), {
      userId: uid,
      itemId: 550,
      type: "movie",
      title: "Fight Club",
      poster: null,
      savedAt: new Date().toISOString(),
    })
  );

  const listQuery = query(collection(db, "favorites"), where("userId", "==", uid));
  const snap = await assertSucceeds(getDocs(listQuery));
  if (snap.size !== 1) {
    throw new Error(`Expected 1 favorite, got ${snap.size}`);
  }

  await assertSucceeds(deleteDoc(doc(db, "favorites", "fav_1")));
  const removed = await assertSucceeds(getDoc(doc(db, "favorites", "fav_1")));
  if (removed.exists()) {
    throw new Error("Favorite should be deleted");
  }
});

test("authenticated user cannot read another user's favorites", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();
    await setDoc(doc(adminDb, "favorites", "fav_seed"), {
      userId: "user_A",
      itemId: 680,
      type: "movie",
      title: "Pulp Fiction",
      poster: null,
      savedAt: new Date().toISOString(),
    });
  });

  const db = testEnv.authenticatedContext("user_B").firestore();
  const crossUserQuery = query(collection(db, "favorites"), where("userId", "==", "user_A"));
  await assertFails(getDocs(crossUserQuery));
});

test("unauthenticated user cannot create favorite", async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(
    setDoc(doc(db, "favorites", "fav_unauth"), {
      userId: "user_1",
      itemId: 13,
      type: "movie",
      title: "Forrest Gump",
      poster: null,
      savedAt: new Date().toISOString(),
    })
  );
});
