import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, LinearProgress, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, IconButton, Alert } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { TeamGoals } from '../utils/teamAnalysis';

const TeamGoalsTracker = ({ games }) => {
  const [goals, setGoals] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    name: '',
    metric: 'killParticipation',
    target: 0,
    unit: '%'
  });

  // 초기 목표 설정
  useEffect(() => {
    // 로컬 스토리지에서 목표 불러오기
    const savedGoals = localStorage.getItem('teamGoals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      // 기본 목표 설정
      setGoals(TeamGoals.defaultGoals);
    }
  }, []);

  // 목표 저장
  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem('teamGoals', JSON.stringify(goals));
    }
  }, [goals]);

  // 목표 추가 대화상자 열기
  const handleOpenDialog = () => {
    setEditingGoal(null);
    setNewGoal({
      name: '',
      metric: 'killParticipation',
      target: 0,
      unit: '%'
    });
    setDialogOpen(true);
  };

  // 목표 편집 대화상자 열기
  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setNewGoal({
      name: goal.name,
      metric: goal.metric,
      target: goal.target,
      unit: goal.unit
    });
    setDialogOpen(true);
  };

  // 대화상자 닫기
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // 목표 저장
  const handleSaveGoal = () => {
    if (newGoal.name.trim() === '' || newGoal.target <= 0) {
      return;
    }

    if (editingGoal) {
      // 목표 수정
      setGoals(goals.map(g => 
        g.id === editingGoal.id 
          ? { ...g, name: newGoal.name, metric: newGoal.metric, target: parseFloat(newGoal.target), unit: newGoal.unit }
          : g
      ));
    } else {
      // 새 목표 추가
      const newId = Math.max(0, ...goals.map(g => g.id)) + 1;
      setGoals([
        ...goals,
        {
          id: newId,
          name: newGoal.name,
          metric: newGoal.metric,
          target: parseFloat(newGoal.target),
          unit: newGoal.unit
        }
      ]);
    }

    setDialogOpen(false);
  };

  // 목표 삭제
  const handleDeleteGoal = (goalId) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };

  // 목표 지표 옵션
  const metricOptions = [
    { value: 'killParticipation', label: '킬 관여율', unit: '%' },
    { value: 'visionScore', label: '시야 점수', unit: '점' },
    { value: 'csPerMinute', label: '분당 CS', unit: '개' },
    { value: 'damagePerMinute', label: '분당 데미지', unit: '점' },
    { value: 'objectiveControl', label: '오브젝트 점유율', unit: '%' }
  ];

  // 지표 변경 시 단위도 자동 변경
  const handleMetricChange = (e) => {
    const metric = e.target.value;
    const option = metricOptions.find(opt => opt.value === metric);
    
    setNewGoal({
      ...newGoal,
      metric,
      unit: option ? option.unit : newGoal.unit
    });
  };

  return (
    <Card sx={{ mb: 3, backgroundColor: '#1E1E2F', color: 'white' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">팀 목표 추적</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            size="small"
            onClick={handleOpenDialog}
          >
            목표 추가
          </Button>
        </Box>
        
        {goals.length === 0 ? (
          <Alert severity="info" sx={{ backgroundColor: 'rgba(41, 98, 255, 0.1)', color: 'white' }}>
            설정된 목표가 없습니다. 새 목표를 추가해보세요.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {goals.map(goal => {
              const progress = TeamGoals.calculateProgress(goal, games);
              
              return (
                <Grid item xs={12} md={6} key={goal.id}>
                  <Card variant="outlined" sx={{ backgroundColor: 'rgba(30,30,47,0.5)' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {goal.name}
                        </Typography>
                        <Box>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditGoal(goal)}
                            sx={{ color: 'rgba(255,255,255,0.6)' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteGoal(goal.id)}
                            sx={{ color: 'rgba(255,255,255,0.6)' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, mb: 1 }}>
                        <Typography variant="body2">
                          목표: {goal.target}{goal.unit}
                        </Typography>
                        <Typography variant="body2">
                          현재: {progress.currentValue || 0}{goal.unit}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ position: 'relative' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={progress.progress || 0} 
                          sx={{ 
                            height: 10, 
                            borderRadius: 5,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: progress.achieved ? 'success.main' : 'primary.main',
                            }
                          }} 
                        />
                        {progress.achieved && (
                          <CheckCircleIcon 
                            color="success" 
                            sx={{ 
                              position: 'absolute', 
                              right: -10, 
                              top: -5, 
                              backgroundColor: '#1E1E2F', 
                              borderRadius: '50%' 
                            }} 
                          />
                        )}
                      </Box>
                      
                      <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
                        {progress.progress || 0}% 달성
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
        
        {/* 목표 추가/편집 대화상자 */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} PaperProps={{ sx: { backgroundColor: '#1E1E2F', color: 'white' } }}>
          <DialogTitle>{editingGoal ? '목표 편집' : '새 목표 추가'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="목표 이름"
              type="text"
              fullWidth
              variant="outlined"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-input': { color: 'white' }
              }}
            />
            
            <TextField
              select
              margin="dense"
              label="지표"
              fullWidth
              variant="outlined"
              value={newGoal.metric}
              onChange={handleMetricChange}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-input': { color: 'white' },
                '& .MuiSelect-icon': { color: 'rgba(255, 255, 255, 0.7)' }
              }}
              SelectProps={{
                native: true,
              }}
            >
              {metricOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </TextField>
            
            <TextField
              margin="dense"
              label="목표 수치"
              type="number"
              fullWidth
              variant="outlined"
              value={newGoal.target}
              onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
              InputProps={{
                endAdornment: <InputAdornment position="end" sx={{ color: 'white' }}>{newGoal.unit}</InputAdornment>,
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-input': { color: 'white' }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              취소
            </Button>
            <Button onClick={handleSaveGoal} variant="contained">
              저장
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TeamGoalsTracker; 