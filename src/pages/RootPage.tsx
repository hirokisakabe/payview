import { useRef, useState } from "react";
import { addPayments } from "../data/addPayments";
import { usePaymentsFiles } from "../data/usePaymentsFiles";

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

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <p>ファイルアップロード</p>
        <input
          className="file-input file-input-ghost"
          type="file"
          name="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />
        <button
          className="btn max-w-40"
          type="button"
          onClick={() => void handleSubmit()}
        >
          アップロード
        </button>
      </div>

      <div>
        <p>ファイル一覧</p>
        {files && (
          <ul className="list">
            {files.map((file, index) => (
              <li key={index} className="list-row">
                <a href={`/payments/${file.fileName}`}>{file.fileName}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
