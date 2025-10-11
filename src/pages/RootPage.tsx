import { useRef, useState } from "react";
import { addPayments } from "../data/addPayments";
import { usePaymentsFiles } from "../data/usePaymentsFiles";
import { deletePaymentFile } from "../data/deletePaymentFile";
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

  const handleDeleteFile = async (fileName: string) => {
    if (confirm(`「${fileName}」を削除しますか？この操作は取り消せません。`)) {
      await deletePaymentFile(fileName);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <span className="text-secondary-content text-sm">
        某銀行のクレジットカード利用明細をわかりやすく表示するアプリ
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="text-primary-content text-lg">ファイル登録</h2>
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
          登録
        </button>
        <div className="text-info mt-2 text-sm">
          <p>
            登録されたファイルは、ブラウザ内のIndexedDBに安全に保存されます。
          </p>
          <p>
            データはお使いのブラウザ内にのみ保存され、外部に送信されることはありません。
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-primary-content text-lg">ファイル一覧</h2>
        {files && (
          <ul className="menu bg-base-200 rounded-box w-full">
            {files.map((file, index) => (
              <li key={index}>
                <div className="flex w-full items-center justify-between">
                  <Link
                    to="/payments/$fileName"
                    params={{ fileName: file.fileName }}
                    className="flex-1 text-left"
                  >
                    {file.fileName}
                  </Link>
                  <button
                    className="btn btn-sm text-base-content/40 hover:text-error hover:bg-error/5 ml-2 border-none bg-transparent"
                    onClick={() => void handleDeleteFile(file.fileName)}
                    type="button"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
