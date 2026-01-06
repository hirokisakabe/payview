import { type ReactNode } from "react";
import { render } from "@testing-library/react";
import {
  RouterProvider,
  createRouter,
  createMemoryHistory,
  createRootRoute,
  createRoute,
} from "@tanstack/react-router";
import Encoding from "encoding-japanese";
import { db } from "../data/db";

/**
 * Clear all database tables
 */
export async function clearDatabase(): Promise<void> {
  await db.paymentFiles.clear();
  await db.categories.clear();
  await db.categoryRules.clear();
}

/**
 * Encode string to Shift-JIS and create a File
 */
function encodeToShiftJIS(content: string, fileName: string): File {
  const unicodeArray = Encoding.stringToCode(content);
  const sjisArray = Encoding.convert(unicodeArray, {
    from: "UNICODE",
    to: "SJIS",
  });
  const uint8Array = new Uint8Array(sjisArray);
  return new File([uint8Array], fileName, { type: "text/csv" });
}

/**
 * Create a test CSV file with Shift-JIS encoding (7 column format)
 * Format: date,name,price,count,noname1,noname2,noname3
 */
export function createTestCsvFile(
  fileName: string,
  rows: Array<{
    date: string;
    name: string;
    price: number;
    count?: number;
  }>,
): File {
  // No header row - csv-parse uses columns array for mapping
  const dataRows = rows.map(
    (row) => `${row.date},${row.name},${row.price},${row.count ?? 1},,,`,
  );
  const csvContent = dataRows.join("\r\n");

  return encodeToShiftJIS(csvContent, fileName);
}

/**
 * Create an empty CSV file (no data rows)
 */
export function createEmptyCsvFile(fileName: string): File {
  // Empty content = no rows
  return encodeToShiftJIS("", fileName);
}

/**
 * Create an invalid CSV file (wrong format - will fail Zod validation)
 */
export function createInvalidCsvFile(fileName: string): File {
  // Invalid data that won't parse correctly (missing required fields)
  const content = "invalid,csv,not-a-number,also-not-a-number,,,";
  return encodeToShiftJIS(content, fileName);
}

type RenderWithRouterOptions = {
  initialPath?: string;
  component: ReactNode;
};

/**
 * Render a component with TanStack Router for testing
 */
export function renderWithRouter({
  initialPath = "/",
  component,
}: RenderWithRouterOptions) {
  const rootRoute = createRootRoute({
    component: () => component,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
  });

  const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/settings",
  });

  const paymentsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/payments/$fileName",
  });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    settingsRoute,
    paymentsRoute,
  ]);

  const memoryHistory = createMemoryHistory({
    initialEntries: [initialPath],
  });

  const router = createRouter({
    routeTree,
    history: memoryHistory,
  });

  return render(<RouterProvider router={router} />);
}
