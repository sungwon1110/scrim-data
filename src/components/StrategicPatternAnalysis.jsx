import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, Divider, Chip, LinearProgress } from '@mui/material';
import { identifyStrategicPatterns } from '../utils/teamAnalysis';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StrategicPatternAnalysis = ({ games }) => {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (games && Array.isArray(games) && games.length > 0) {
      const result = identifyStrategicPatterns(games);
      setAnalysis(result);
    }
  }, [games]);

  if (!analysis) {
    return (
      <Card sx={{ mb: 3, backgroundColor: '#1E1E2F', color: 'white' }}>
        <CardContent>
          <Typography variant="h6">전략 패턴 분석</Typography>
          <Typography variant="body2">분석할 데이터가 없습니다. 최소 2개 이상의 게임이 필요합니다.</Typography>
        </CardContent>
      </Card>
    );
  }

  // 오류 처리
  if (analysis.error) {
    return (
      <Card sx={{ mb: 3, backgroundColor: '#1E1E2F', color: 'white' }}>
        <CardContent>
          <Typography variant="h6">전략 패턴 분석</Typography>
          <Typography variant="body2" color="error">{analysis.error}</Typography>
        </CardContent>
      </Card>
    );
  }

  // 패턴 빈도 차트 데이터 (상위 5개)
  const topPatterns = analysis.patterns.slice(0, 5);
  const patternFrequencyData = {
    labels: topPatterns.map(p => p.pattern),
    datasets: [
      {
        label: '사용 빈도 (%)',
        data: topPatterns.map(p => p.percentage),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        }
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'white',
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
          }
        }
      }
    }
  };

  return (
    <Card sx={{ mb: 3, backgroundColor: '#1E1E2F', color: 'white' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>전략 패턴 분석</Typography>
        <Typography variant="subtitle2" gutterBottom>
          총 {analysis.totalGames}개 게임 기반
        </Typography>
        
        {/* 패턴 빈도 차트 */}
        <Box sx={{ height: 300, mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            자주 사용하는 전략 패턴 (상위 5개)
          </Typography>
          <Bar data={patternFrequencyData} options={chartOptions} />
        </Box>
        
        <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        
        {/* 성공적인 패턴 */}
        <Typography variant="subtitle1" gutterBottom>
          성공적인 전략 패턴 (승률 기준)
        </Typography>
        
        {analysis.successfulPatterns.length > 0 ? (
          <Grid container spacing={2}>
            {analysis.successfulPatterns.slice(0, 4).map((pattern, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card variant="outlined" sx={{ backgroundColor: 'rgba(30,30,47,0.5)' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      {pattern.pattern}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ minWidth: 80 }}>
                        승률: {pattern.winRate}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={pattern.winRate} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 5,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: pattern.winRate > 60 ? 'success.main' : 'primary.main',
                        }
                      }} 
                    />
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={`${pattern.games}게임`} 
                        size="small" 
                        sx={{ mt: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2">
            분석할 충분한 데이터가 없습니다. 더 많은 게임을 플레이하여 패턴을 수집하세요.
          </Typography>
        )}
        
        {/* 모든 패턴 목록 */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            모든 식별된 패턴
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {analysis.patterns.map((pattern, index) => (
              <Chip 
                key={index}
                label={`${pattern.pattern} (${pattern.percentage}%)`}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StrategicPatternAnalysis; 