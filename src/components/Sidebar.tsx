import { useEffect, useState } from "react";
import "../../public/styles/sidebar.css";

interface SavedFile {
  id: string; // timestamp
  name: string;
  content: string;
}

export function Sidebar({
  onSelect,
  className = "",
}: {
  onSelect: (content: string) => void;
  className?: string;
}) {
  const [files, setFiles] = useState<SavedFile[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("mm_saved_docs");
    if (stored) {
      const arr: SavedFile[] = JSON.parse(stored);
      arr.sort((a, b) => Number(b.id) - Number(a.id)); // newest first
      setFiles(arr);
    }
  }, []);

  /** Saving filed in sorted way */
  const saveFiles = (updated: SavedFile[]) => {
    const sorted = [...updated].sort((a, b) => Number(b.id) - Number(a.id));
    setFiles(sorted);
    localStorage.setItem("mm_saved_docs", JSON.stringify(sorted));
  };

  /** Delete a specific document */
  const deleteFile = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    saveFiles(updated);
  };

  return (
    <div className={`sidebar ${className}`}>
      <h2 className="sidebar-title">📄 Your Documents</h2>

      {files.length === 0 ? (
        <p className="sidebar-empty">No documents yet.</p>
      ) : (
        <div className="sidebar-list">
          {files.map((file) => (
            <div key={file.id} className="sidebar-card">
              <div
                className="sidebar-card-click"
                onClick={() => onSelect(file.content)}
              >
                <h3 className="sidebar-card-title">{file.name}</h3>
                <p className="sidebar-card-preview">
                  {file.content.slice(0, 60)}...
                </p>
              </div>

              {/* Delete Button */}
              <button
                className="sidebar-delete-btn"
                title="Delete document"
                onClick={(e) => {
                  e.stopPropagation(); // prevent open on delete click
                  deleteFile(file.id);
                }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
