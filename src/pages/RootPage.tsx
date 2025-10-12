import { useRef, useState } from "react";
import { addPayments } from "../data/addPayments";
import { usePaymentsFiles } from "../data/usePaymentsFiles";
import { deletePaymentFile } from "../data/deletePaymentFile";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";

export function RootPage() {
  const files = usePaymentsFiles();

  const [selectedFiles, setSelectedFiles] = useState<File[]>();
  const fileInputRef = useRef(null);

  const handleFilesSelect = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    setSelectedFiles(Array.from(files));
  };

  const handleSubmit = async () => {
    if (!selectedFiles) {
      return;
    }

    const addPaymentsResult = await addPayments(selectedFiles);

    if (addPaymentsResult.isErr()) {
      switch (addPaymentsResult.error.name) {
        case "AddPaymentsConstraintError":
          alert(
            `ファイルは既に登録されています。別のファイルを選択してください。`,
          );
          break;
        case "AddPaymentsUnknownError":
          alert(
            `ファイルの登録に失敗しました: ${addPaymentsResult.error.message}`,
          );
          break;
      }

      return;
    }

    setSelectedFiles(undefined);
    if (fileInputRef.current) {
      (fileInputRef.current as HTMLInputElement).value = "";
    }
  };

  const uploadButtonDisabled = !selectedFiles;

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
          multiple
          ref={fileInputRef}
          onChange={(e) => handleFilesSelect(e.target.files)}
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
          <p>マイページでWEB明細書をCSV形式で取得して登録してください。</p>
        </div>
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
