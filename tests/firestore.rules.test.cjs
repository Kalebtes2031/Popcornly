const test = require("node:test");
const assert = require("node:assert/strict");
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
  updateDoc,
} = require("firebase/firestore");

const projectId = "popcornly2-rules-test";
const rules = fs.readFileSync(path.join(__dirname, "..", "firestore.rules"), "utf8");

function getEmulatorHostAndPort() {
  const hostValue = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
  const [host, portText] = hostValue.split(":");
  return {
    host,
    port: Number(portText || "8080"),
  };
}

let testEnv;

test.before(async () => {
  const { host, port } = getEmulatorHostAndPort();
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      host,
      port,
      rules,
    },
  });
});

test.after(async () => {
  await testEnv.cleanup();
});

test.beforeEach(async () => {
  await testEnv.clearFirestore();
});

test("favorites: user can create own favorite", async () => {
  const db = testEnv.authenticatedContext("user_1").firestore();

  await assertSucceeds(
    setDoc(doc(db, "favorites", "fav_1"), {
      userId: "user_1",
      itemId: 100,
      type: "movie",
      title: "Dune",
      poster: null,
      savedAt: new Date().toISOString(),
    })
  );
});

test("favorites: user cannot create favorite for another user", async () => {
  const db = testEnv.authenticatedContext("user_1").firestore();

  await assertFails(
    setDoc(doc(db, "favorites", "fav_2"), {
      userId: "user_2",
      itemId: 200,
      type: "tv",
      title: "Dark",
      poster: null,
      savedAt: new Date().toISOString(),
    })
  );
});

test("favorites: unauthenticated user cannot write", async () => {
  const db = testEnv.unauthenticatedContext().firestore();

  await assertFails(
    setDoc(doc(db, "favorites", "fav_3"), {
      userId: "user_1",
      itemId: 300,
      type: "movie",
      title: "Interstellar",
      poster: null,
      savedAt: new Date().toISOString(),
    })
  );
});

test("users: owner can update username only", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();
    await setDoc(doc(adminDb, "users", "user_1"), {
      uid: "user_1",
      email: "user1@example.com",
      username: "oldname",
      createdAt: new Date().toISOString(),
    });
  });

  const db = testEnv.authenticatedContext("user_1").firestore();

  await assertSucceeds(
    updateDoc(doc(db, "users", "user_1"), {
      username: "newname",
    })
  );

  await assertFails(
    updateDoc(doc(db, "users", "user_1"), {
      email: "hacker@example.com",
    })
  );
});

test("users: non-owner cannot read user document", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();
    await setDoc(doc(adminDb, "users", "user_1"), {
      uid: "user_1",
      email: "user1@example.com",
      username: "owner",
      createdAt: new Date().toISOString(),
    });
  });

  const db = testEnv.authenticatedContext("user_2").firestore();
  await assertFails(getDoc(doc(db, "users", "user_1")));
});

test("metrics: auth can create and increment count by one", async () => {
  const db = testEnv.authenticatedContext("user_1").firestore();
  const metricsRef = doc(db, "metrics", "m1");

  await assertSucceeds(
    setDoc(metricsRef, {
      searchTerm: "dune",
      movie_id: 438631,
      title: "Dune",
      poster_url: "",
      count: 1,
    })
  );

  await assertSucceeds(
    updateDoc(metricsRef, {
      count: 2,
    })
  );
});

test("metrics: cannot modify immutable fields", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();
    await setDoc(doc(adminDb, "metrics", "m2"), {
      searchTerm: "dark",
      movie_id: 123,
      title: "Dark",
      poster_url: "",
      count: 7,
    });
  });

  const db = testEnv.authenticatedContext("user_1").firestore();
  const metricsRef = doc(db, "metrics", "m2");

  await assertFails(
    updateDoc(metricsRef, {
      title: "Changed Title",
      count: 8,
    })
  );

  const snap = await getDoc(metricsRef);
  assert.equal(snap.exists(), true);
});
