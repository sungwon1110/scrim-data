import React from "react";

const FileUploader = ({ onFileChange, onSave }) => {
  return (
    <div className="mb-3">
      <label htmlFor="formFile" className="form-label">
        JSON 파일을 넣어주세요
      </label>
      <div className="d-flex align-items-center gap-2 mb-3">
        <input className="form-control file-input" type="file" id="formFile" accept=".json" multiple onChange={onFileChange} />
        <button type="button" className="btn btn-primary save-button" onClick={onSave}>
          저장
        </button>
      </div>
    </div>
  );
};

export default FileUploader;
