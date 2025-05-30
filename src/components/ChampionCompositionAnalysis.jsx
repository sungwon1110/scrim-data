import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Chip, List, ListItem, ListItemText, Divider, Box } from '@mui/material';
import { analyzeChampionComposition } from '../utils/teamAnalysis';

const ChampionCompositionAnalysis = ({ gameData }) => {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (gameData && gameData.participants && gameData.participants.length > 0) {
      // 블루팀 (팀 ID 100) 분석
      const blueTeam = gameData.participants.filter(p => p.teamId === 100);
      if (blueTeam.length > 0) {
        const result = analyzeChampionComposition(blueTeam);
        setAnalysis(result);
      }
    }
  }, [gameData]);

  if (!analysis) {
    return (
      <Card sx={{ mb: 3, backgroundColor: '#1E1E2F', color: 'white' }}>
        <CardContent>
          <Typography variant="h6">챔피언 조합 분석</Typography>
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
          <Typography variant="h6">챔피언 조합 분석</Typography>
          <Typography variant="body2" color="error">{analysis.error}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3, backgroundColor: '#1E1E2F', color: 'white' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>챔피언 조합 분석</Typography>
        
        <Box sx={{ mb: 2 }}>
          <Chip 
            label={analysis.compositionType} 
            color="primary" 
            sx={{ fontWeight: 'bold', fontSize: '1rem' }}
          />
        </Box>
        
        <Grid container spacing={3}>
          {/* 강점 */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              강점
            </Typography>
            <List dense>
              {analysis.strengths.map((strength, index) => (
                <ListItem key={index}>
                  <ListItemText primary={strength} />
                </ListItem>
              ))}
            </List>
          </Grid>
          
          {/* 약점 */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="error" gutterBottom>
              약점
            </Typography>
            <List dense>
              {analysis.weaknesses.map((weakness, index) => (
                <ListItem key={index}>
                  <ListItemText primary={weakness} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        
        {/* 상성 정보 */}
        <Typography variant="subtitle1" gutterBottom>
          상성 관계
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="success.main" gutterBottom>
              상대하기 좋은 조합:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {analysis.matchups.goodAgainst.length > 0 ? (
                analysis.matchups.goodAgainst.map((comp, index) => (
                  <Chip 
                    key={index} 
                    label={comp} 
                    size="small" 
                    sx={{ backgroundColor: 'rgba(76, 175, 80, 0.2)' }}
                  />
                ))
              ) : (
                <Typography variant="body2">데이터 없음</Typography>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="error" gutterBottom>
              상대하기 어려운 조합:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {analysis.matchups.badAgainst.length > 0 ? (
                analysis.matchups.badAgainst.map((comp, index) => (
                  <Chip 
                    key={index} 
                    label={comp} 
                    size="small"
                    sx={{ backgroundColor: 'rgba(244, 67, 54, 0.2)' }}
                  />
                ))
              ) : (
                <Typography variant="body2">데이터 없음</Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ChampionCompositionAnalysis; 