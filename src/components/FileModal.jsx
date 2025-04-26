import React from "react";

const FileModal = ({ isOpen, closeModal, onFileChange, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h5>JSON 파일 업로드</h5>
        <input className="form-control mb-3" type="file" accept=".json" multiple onChange={onFileChange} />
        <div className="d-flex justify-content-end">
          <button className="btn btn-secondary me-2" onClick={closeModal}>
            닫기
          </button>
          <button className="btn btn-primary" onClick={onSave}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileModal;
