import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, Button, LinearProgress, Card, CardContent, Chip, Alert } from '@mui/material';
import { UploadFile as UploadFileIcon, Delete as DeleteIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { batchProcessRoflFiles } from '../utils/roflParser';

const RoflDropzone = ({ onFilesProcessed }) => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    // 파일 유효성 검사
    const validFiles = acceptedFiles.filter(file => file.name.endsWith('.rofl'));
    const invalidFiles = acceptedFiles.filter(file => !file.name.endsWith('.rofl'));
    
    if (invalidFiles.length > 0) {
      setError(`${invalidFiles.length}개의 파일이 .rofl 형식이 아닙니다. 지원되지 않는 파일은 무시됩니다.`);
      setTimeout(() => setError(null), 5000);
    }
    
    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.rofl']
    }
  });

  const removeFile = (index) => {
    setFiles(files => files.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    
    setProcessing(true);
    setProgress(0);
    
    try {
      // 파일 처리 및 진행률 업데이트
      const results = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const data = await batchProcessRoflFiles([files[i]]);
        results.push(...data);
        
        // 진행률 업데이트
        setProgress(Math.round(((i + 1) / totalFiles) * 100));
      }
      
      // 처리 완료 후 부모 컴포넌트에 결과 전달
      if (results.length > 0) {
        onFilesProcessed(results);
        setFiles([]);
      }
    } catch (err) {
      setError(`파일 처리 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card sx={{ mb: 3, backgroundColor: '#1E1E2F', color: 'white' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>리플레이 파일 업로드</Typography>
        <Typography variant="body2" gutterBottom>
          League of Legends 리플레이 파일(.rofl)을 직접 업로드하여 분석할 수 있습니다.
        </Typography>
        
        {error && (
          <Alert 
            severity="warning" 
            sx={{ mb: 2, backgroundColor: 'rgba(237, 108, 2, 0.1)', color: 'white' }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
        <Paper
          {...getRootProps()}
          elevation={0}
          sx={{
            p: 3,
            mt: 2,
            mb: 2,
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'rgba(255, 255, 255, 0.23)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }
          }}
        >
          <input {...getInputProps()} />
          <UploadFileIcon sx={{ fontSize: 40, color: isDragActive ? 'primary.main' : 'text.secondary', mb: 1 }} />
          {isDragActive ? (
            <Typography>여기에 파일을 놓으세요...</Typography>
          ) : (
            <>
              <Typography>파일을 드래그 앤 드롭하거나 클릭하여 선택하세요</Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                .rofl 파일만 지원됩니다 (League of Legends 리플레이 파일)
              </Typography>
            </>
          )}
        </Paper>
        
        {files.length > 0 && (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                업로드된 파일 ({files.length})
              </Typography>
              
              <Box sx={{ maxHeight: '200px', overflowY: 'auto', pr: 1 }}>
                {files.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1,
                      mb: 1,
                      borderRadius: 1,
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <Typography variant="body2" noWrap sx={{ maxWidth: '80%' }}>
                      {file.name}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => removeFile(index)}
                      sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                      삭제
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={clearFiles}
                disabled={processing}
                sx={{ 
                  borderColor: 'rgba(255, 255, 255, 0.23)', 
                  color: 'white',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }
                }}
              >
                모두 지우기
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={processFiles}
                disabled={processing}
                startIcon={processing ? null : <CheckCircleIcon />}
              >
                {processing ? '처리 중...' : '분석 시작'}
              </Button>
            </Box>
            
            {processing && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="caption" align="center" display="block" sx={{ mt: 1 }}>
                  {progress}% 완료
                </Typography>
              </Box>
            )}
          </>
        )}
        
        <Box sx={{ mt: 2 }}>
          <Chip 
            label="ReplayBook 연동" 
            color="primary"
            size="small"
            sx={{ mr: 1 }}
          />
          <Typography variant="caption">
            ReplayBook에서 저장한 리플레이 파일을 직접 분석할 수 있습니다.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RoflDropzone; 