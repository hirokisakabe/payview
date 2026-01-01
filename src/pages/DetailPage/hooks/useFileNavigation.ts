import { useMemo } from "react";
import { usePaymentsFiles } from "../../../data";

type FileNavigationResult =
  | {
      status: "loading";
      files: [];
      currentIndex: -1;
      prevFile: null;
      nextFile: null;
      hasPrev: false;
      hasNext: false;
    }
  | {
      status: "ready";
      files: string[];
      currentIndex: number;
      prevFile: string | null;
      nextFile: string | null;
      hasPrev: boolean;
      hasNext: boolean;
    };

export function useFileNavigation(
  currentFileName: string,
): FileNavigationResult {
  const paymentFiles = usePaymentsFiles();

  return useMemo(() => {
    if (!paymentFiles) {
      return {
        status: "loading" as const,
        files: [] as [],
        currentIndex: -1 as const,
        prevFile: null,
        nextFile: null,
        hasPrev: false as const,
        hasNext: false as const,
      };
    }

    const sortedFiles = [...paymentFiles]
      .map((f) => f.fileName)
      .sort((a, b) => a.localeCompare(b));

    const currentIndex = sortedFiles.indexOf(currentFileName);
    const prevFile = currentIndex > 0 ? sortedFiles[currentIndex - 1] : null;
    const nextFile =
      currentIndex < sortedFiles.length - 1
        ? sortedFiles[currentIndex + 1]
        : null;

    return {
      status: "ready" as const,
      files: sortedFiles,
      currentIndex,
      prevFile,
      nextFile,
      hasPrev: prevFile !== null,
      hasNext: nextFile !== null,
    };
  }, [paymentFiles, currentFileName]);
}
