import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useFileNavigation } from "../hooks/useFileNavigation";

type Props = {
  fileName: string;
  activeTab: "breakdown" | "payments";
};

export function FileNavigation({ fileName, activeTab }: Props) {
  const nav = useFileNavigation(fileName);

  if (nav.status === "loading") {
    return <h2 className="text-primary-content text-lg">{fileName}</h2>;
  }

  return (
    <div className="flex items-center gap-2">
      {nav.hasPrev ? (
        <Link
          to="/payments/$fileName"
          params={{ fileName: nav.prevFile! }}
          search={{ tab: activeTab }}
          className="btn btn-ghost btn-sm"
        >
          <ArrowLeftIcon className="mr-1 inline h-4 w-4" />
          前へ
        </Link>
      ) : (
        <button type="button" className="btn btn-ghost btn-sm" disabled>
          <ArrowLeftIcon className="mr-1 inline h-4 w-4" />
          前へ
        </button>
      )}

      <h2 className="text-primary-content flex-1 text-center text-lg">
        {fileName}
      </h2>

      {nav.hasNext ? (
        <Link
          to="/payments/$fileName"
          params={{ fileName: nav.nextFile! }}
          search={{ tab: activeTab }}
          className="btn btn-ghost btn-sm"
        >
          次へ
          <ArrowRightIcon className="ml-1 inline h-4 w-4" />
        </Link>
      ) : (
        <button type="button" className="btn btn-ghost btn-sm" disabled>
          次へ
          <ArrowRightIcon className="ml-1 inline h-4 w-4" />
        </button>
      )}
    </div>
  );
}
