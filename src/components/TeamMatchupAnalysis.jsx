import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, LinearProgress, Divider, Chip, Avatar } from '@mui/material';
import { analyzeTeamMatchup } from '../utils/teamAnalysis';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Chart.js 등록
ChartJS.register(ArcElement, Tooltip, Legend);

const TeamMatchupAnalysis = ({ gameData }) => {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (gameData && gameData.participants && gameData.participants.length > 0) {
      const result = analyzeTeamMatchup(gameData);
      setAnalysis(result);
    }
  }, [gameData]);

  if (!analysis) {
    return (
      <Card sx={{ mb: 3, backgroundColor: '#1E1E2F', color: 'white' }}>
        <CardContent>
          <Typography variant="h6">팀 매치업 분석</Typography>
          <Typography variant="body2">분석할 데이터가 없습니다.</Typography>
        </CardContent>
      </Card>
    );
  }

  // 오류 처리
  if (analysis.error) {
    return (
      <Card sx={{ mb: 3, backgroundColor: '#1E1E2F', color: 'white' }}>
        <CardContent>
          <Typography variant="h6">팀 매치업 분석</Typography>
          <Typography variant="body2" color="error">{analysis.error}</Typography>
        </CardContent>
      </Card>
    );
  }

  // 승률 예측 차트 데이터
  const winProbabilityData = {
    labels: ['블루팀', '레드팀'],
    datasets: [
      {
        data: [analysis.team1.winProbability, analysis.team2.winProbability],
        backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: 'white',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}% 승리 확률`;
          }
        }
      }
    }
  };

  return (
    <Card sx={{ mb: 3, backgroundColor: '#1E1E2F', color: 'white' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>팀 매치업 분석</Typography>
        
        <Grid container spacing={3}>
          {/* 승률 예측 파이 차트 */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" align="center" gutterBottom>
              승리 확률
            </Typography>
            <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
              <Pie data={winProbabilityData} options={chartOptions} />
            </Box>
          </Grid>
          
          {/* 팀 KDA 비교 */}
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle1" gutterBottom>
              팀 KDA 비교
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">블루팀</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ mr: 1 }}>
                    {analysis.team1.kda.ratio}
                  </Typography>
                  <Typography variant="caption">
                    ({analysis.team1.kda.kills}/{analysis.team1.kda.deaths}/{analysis.team1.kda.assists})
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2">레드팀</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ mr: 1 }}>
                    {analysis.team2.kda.ratio}
                  </Typography>
                  <Typography variant="caption">
                    ({analysis.team2.kda.kills}/{analysis.team2.kda.deaths}/{analysis.team2.kda.assists})
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {/* 팀 강점 */}
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    블루팀 강점
                  </Typography>
                  {analysis.team1.strengths.map((strength, index) => (
                    <Chip 
                      key={index}
                      label={strength}
                      size="small"
                      sx={{ m: 0.5, backgroundColor: 'rgba(54, 162, 235, 0.2)' }}
                    />
                  ))}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    레드팀 강점
                  </Typography>
                  {analysis.team2.strengths.map((strength, index) => (
                    <Chip 
                      key={index}
                      label={strength}
                      size="small"
                      sx={{ m: 0.5, backgroundColor: 'rgba(255, 99, 132, 0.2)' }}
                    />
                  ))}
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        
        {/* 포지션별 매치업 분석 */}
        <Typography variant="subtitle1" gutterBottom>
          포지션별 매치업
        </Typography>
        
        <Grid container spacing={2}>
          {Object.entries(analysis.positionMatchups).map(([position, matchup]) => (
            <Grid item xs={12} sm={6} md={4} key={position}>
              <Card variant="outlined" sx={{ backgroundColor: 'rgba(30,30,47,0.5)' }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    {position}
                  </Typography>
                  
                  <Grid container spacing={1}>
                    <Grid item xs={5}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, mb: 1 }}>
                          {matchup.team1Player.championName.charAt(0)}
                        </Avatar>
                        <Typography variant="caption" noWrap>
                          {matchup.team1Player.championName}
                        </Typography>
                        <Typography variant="body2">
                          KDA: {matchup.team1Player.kda}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Typography variant="h6">VS</Typography>
                    </Grid>
                    
                    <Grid item xs={5}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'error.main', width: 40, height: 40, mb: 1 }}>
                          {matchup.team2Player.championName.charAt(0)}
                        </Avatar>
                        <Typography variant="caption" noWrap>
                          {matchup.team2Player.championName}
                        </Typography>
                        <Typography variant="body2">
                          KDA: {matchup.team2Player.kda}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Chip 
                      label={
                        matchup.advantage === 'team1' 
                          ? '블루팀 유리' 
                          : matchup.advantage === 'team2' 
                            ? '레드팀 유리' 
                            : '균등'
                      }
                      size="small"
                      color={
                        matchup.advantage === 'team1' 
                          ? 'primary' 
                          : matchup.advantage === 'team2' 
                            ? 'error' 
                            : 'default'
                      }
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TeamMatchupAnalysis; 