import { useRef, useState } from "react";
import {
  addPayments,
  AddPaymentsConstraintError,
  AddPaymentsInvalidFileError,
  usePaymentsFiles,
  deletePaymentFile,
} from "../data/payments";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { MonthlyTotalChart } from "./RootPage/components/MonthlyTotalChart";

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
      if (addPaymentsResult.error instanceof AddPaymentsInvalidFileError) {
        alert(`ファイルの形式が不正です: ${addPaymentsResult.error.message}`);
        return;
      }

      if (addPaymentsResult.error instanceof AddPaymentsConstraintError) {
        alert(
          "ファイルは既に登録されています。別のファイルを選択してください。",
        );
        return;
      }

      alert(`ファイルの登録に失敗しました: ${addPaymentsResult.error.message}`);
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
        某緑色の銀行のクレジットカード明細をわかりやすく表示するアプリ
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
          <p>
            某銀行のマイページでWEB明細書をCSV形式で取得して、そのファイルを登録してください。
          </p>
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

      {files && files.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-primary-content text-lg">月別推移</h2>
          <MonthlyTotalChart files={files} />
        </div>
      )}

      <div>
        <h2 className="text-primary-content text-lg">ファイル一覧</h2>
        {files && files.length > 0 ? (
          <ul className="menu bg-base-200 rounded-box w-full">
            {files.map((file, index) => (
              <li key={index}>
                <div className="flex w-full items-center justify-between">
                  <Link
                    to="/payments/$fileName"
                    params={{ fileName: file.fileName }}
                    className="flex-1 text-left"
                  >
                    <span>{file.fileName}</span>
                    <span className="text-base-content/60 ml-4">
                      ¥
                      {file.payments
                        .reduce((acc, p) => acc + p.price, 0)
                        .toLocaleString()}
                    </span>
                  </Link>
                  <button
                    className="btn btn-sm text-base-content/40 hover:text-error hover:bg-error/5 ml-2 border-none bg-transparent"
                    onClick={() => void handleDeleteFile(file.fileName)}
                    type="button"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-base-200 rounded-box text-base-content/60 w-full p-8 text-center">
            <p>登録されているファイルがありません</p>
            <p className="mt-2 text-sm">
              上のフォームからCSVファイルを登録してください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
