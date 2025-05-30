import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, Typography, Box, Button, CircularProgress, Alert, Snackbar } from '@mui/material';
import { CloudUpload, DragIndicator, CheckCircle, Error } from '@mui/icons-material';
import { batchProcessRoflFiles } from '../utils/roflParser';

/**
 * ROFL 파일 드롭존 컴포넌트
 * 리그 오브 레전드 리플레이 파일을 업로드하고 처리하는 UI
 */
const RoflDropzone = ({ onFilesProcessed }) => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // 파일 드롭 처리
  const onDrop = useCallback(acceptedFiles => {
    const roflFiles = acceptedFiles.filter(file => file.name.endsWith('.rofl'));
    
    if (roflFiles.length === 0) {
      setSnackbarMessage('ROFL 파일만 업로드 가능합니다.');
      setSnackbarOpen(true);
      return;
    }
    
    setFiles(prevFiles => [...prevFiles, ...roflFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/octet-stream': ['.rofl'] },
    maxFiles: 10
  });

  // 파일 처리 시작
  const handleProcess = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setProcessedCount(0);
    setError(null);
    
    try {
      // 통합된 ReplayBook 모듈을 사용하여 ROFL 파일 분석
      const results = await batchProcessRoflFiles(files);
      
      if (results.length > 0) {
        onFilesProcessed(results);
        setSnackbarMessage(`${results.length}개 파일 처리 완료`);
        setSnackbarOpen(true);
        setFiles([]);
      } else {
        setError('처리된 파일이 없습니다.');
      }
    } catch (err) {
      console.error('파일 처리 오류:', err);
      setError(err.message || '파일 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 파일 목록 삭제
  const handleClearFiles = () => {
    setFiles([]);
    setError(null);
  };

  // 스낵바 닫기
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Card sx={{ mb: 3, backgroundColor: '#1E1E2F', color: 'white' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          리플레이 파일 업로드
        </Typography>
        
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'rgba(255, 255, 255, 0.3)',
            borderRadius: 2,
            p: 3,
            mb: 2,
            textAlign: 'center',
            backgroundColor: isDragActive ? 'rgba(156, 39, 176, 0.1)' : 'transparent',
            transition: 'all 0.2s',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'rgba(156, 39, 176, 0.05)'
            }
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload fontSize="large" color="primary" />
          <Typography variant="body1" sx={{ mt: 1 }}>
            {isDragActive
              ? '파일을 여기에 놓으세요...'
              : 'ROFL 파일을 드래그 앤 드롭하거나 클릭하여 선택하세요'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            .rofl 확장자 파일만 지원합니다 (최대 10개)
          </Typography>
        </Box>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            리플레이 파일 분석 방법:
          </Typography>
          <Typography variant="caption">
            1. 리그 오브 레전드 클라이언트에서 경기 후 다시보기를 저장하세요.
            <br />
            2. ROFL 파일을 위 영역에 업로드하세요.
            <br />
            3. '파일 처리' 버튼을 클릭하여 분석을 시작하세요.
            <br />
            4. 분석이 완료되면 결과가 자동으로 표시됩니다.
          </Typography>
        </Alert>
        
        {files.length > 0 && (
          <>
            <Typography variant="subtitle2" gutterBottom>
              선택된 파일 ({files.length})
            </Typography>
            <Box
              sx={{
                maxHeight: '150px',
                overflowY: 'auto',
                mb: 2,
                p: 1,
                borderRadius: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.2)'
              }}
            >
              {files.map((file, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    borderBottom: index < files.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                  }}
                >
                  <DragIndicator sx={{ color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(file.size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleClearFiles}
                disabled={isProcessing}
              >
                초기화
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleProcess}
                disabled={isProcessing}
                startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
              >
                {isProcessing ? '처리 중...' : '파일 처리'}
              </Button>
            </Box>
          </>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
        />
      </CardContent>
    </Card>
  );
};

export default RoflDropzone; 