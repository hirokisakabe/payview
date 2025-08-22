import { useRef, useState } from "react";
import { addPayments } from "../data/addPayments";
import { usePaymentsFiles } from "../data/usePaymentsFiles";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";

export function RootPage() {
  const files = usePaymentsFiles();

  const [selectedFile, setSelectedFile] = useState<File>();
  const fileInputRef = useRef(null);

  const handleFileSelect = (file: File | undefined) => {
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      return;
    }

    void (await addPayments(selectedFile));

    setSelectedFile(undefined);
    if (fileInputRef.current) {
      (fileInputRef.current as HTMLInputElement).value = "";
    }
  };

  const uploadButtonDisabled = !selectedFile;

  return (
    <div className="flex flex-col gap-10">
      <span className="text-secondary-content text-sm">
        某銀行のクレジットカード利用明細をわかりやすく表示するアプリ
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="text-primary-content text-lg">ファイルアップロード</h2>
        <input
          className="file-input file-input-ghost"
          type="file"
          name="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />
        <button
          className={clsx(
            "btn btn-primary max-w-40",
            uploadButtonDisabled && "btn-disabled",
          )}
          type="button"
          onClick={() => void handleSubmit()}
          disabled={uploadButtonDisabled}
        >
          アップロード
        </button>
      </div>

      <div>
        <h2 className="text-primary-content text-lg">ファイル一覧</h2>
        {files && (
          <ul className="menu bg-base-200 rounded-box w-full">
            {files.map((file, index) => (
              <li key={index}>
                <Link
                  to="/$fileName/payments"
                  params={{ fileName: file.fileName }}
                >
                  {file.fileName}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
