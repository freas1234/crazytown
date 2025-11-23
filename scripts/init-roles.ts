/**
 * Simple script to initialize default roles and permissions
 * Run with: npx tsx scripts/init-roles.ts
 * or: npm run init-roles
 */

// Load environment variables
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env") });

import { createDefaultRoles } from "../app/models/Role";

async function main() {
  try {
    console.log("🚀 Initializing default roles and permissions...");

    await createDefaultRoles();

    console.log("✅ Default roles initialized successfully!");
    console.log("   - Owner (full access)");
    console.log("   - Admin (full access)");
    console.log("   - User (no admin permissions)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing roles:", error);
    process.exit(1);
  }
}

main();
