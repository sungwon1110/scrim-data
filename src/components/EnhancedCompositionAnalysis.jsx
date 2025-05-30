import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Chip, List, ListItem, ListItemText, Divider, Box, Tabs, Tab, CircularProgress, Button, Paper, LinearProgress, Avatar } from '@mui/material';
import { AllInclusive as AIIcon, Equalizer as StatsIcon, Storage as DataIcon, Check as CheckIcon, Warning as WarningIcon } from '@mui/icons-material';
import { analyzeChampionComposition } from '../utils/teamAnalysis';
import * as riotApiService from '../utils/riotApiService';
import * as gameAnalytics from '../utils/gameAnalytics';
import * as mlPrediction from '../utils/mlPrediction';

// 탭 패널 컴포넌트
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`composition-tabpanel-${index}`}
      aria-labelledby={`composition-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EnhancedCompositionAnalysis = ({ gameData, allGames }) => {
  const [analysis, setAnalysis] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [championsData, setChampionsData] = useState(null);
  const [gameStats, setGameStats] = useState(null);
  const [mlPredictions, setMlPredictions] = useState(null);
  const [error, setError] = useState(null);

  // 기본 분석 (기존 방식)
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

  // Riot API 데이터 가져오기
  const fetchRiotData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. 모든 챔피언 정보 가져오기
      const champData = await riotApiService.getAllChampions(gameData?.gameVersion || '15.8.1');
      setChampionsData(champData);
      
      // 2. 블루팀 조합 분석
      const blueTeam = gameData.participants.filter(p => p.teamId === 100);
      const championNames = blueTeam.map(p => p.championName);
      
      // 3. 조합 시너지 분석
      const synergyResult = riotApiService.calculateTeamSynergy(championNames, champData);
      
      // 4. 게임 로그 기반 분석
      let teamAnalysis = null;
      if (allGames && allGames.length > 0) {
        teamAnalysis = gameAnalytics.analyzeTeamComposition(allGames, championNames);
      }
      
      setGameStats({
        synergyResult,
        teamAnalysis
      });
      
      // 5. 머신러닝 예측
      const redTeam = gameData.participants.filter(p => p.teamId === 200);
      const predictionResult = mlPrediction.predictWinRate(blueTeam, redTeam);
      
      setMlPredictions(predictionResult);
    } catch (err) {
      console.error('데이터 가져오기 오류:', err);
      setError('데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // API 데이터가 아직 로드되지 않았고, 해당 탭으로 이동한 경우 데이터 로드
    if (newValue > 0 && !championsData && !isLoading) {
      fetchRiotData();
    }
  };

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
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<StatsIcon />} label="기본 분석" />
            <Tab icon={<DataIcon />} label="데이터 분석" />
            <Tab icon={<AIIcon />} label="AI 예측" />
          </Tabs>
        </Box>
        
        {/* 기본 분석 탭 */}
        <TabPanel value={tabValue} index={0}>
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
        </TabPanel>
        
        {/* 데이터 분석 탭 */}
        <TabPanel value={tabValue} index={1}>
          {isLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
              <CircularProgress color="primary" />
              <Typography variant="body2" sx={{ mt: 2 }}>데이터 분석 중...</Typography>
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <WarningIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography color="error">{error}</Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mt: 2 }} 
                onClick={fetchRiotData}
              >
                다시 시도
              </Button>
            </Box>
          ) : gameStats ? (
            <Grid container spacing={3}>
              {/* 조합 점수 */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, backgroundColor: 'rgba(30,30,47,0.5)' }}>
                  <Typography variant="subtitle1" gutterBottom>조합 시너지 점수</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                      <CircularProgress 
                        variant="determinate" 
                        value={gameStats.synergyResult.score} 
                        size={60}
                        sx={{ color: gameStats.synergyResult.score > 70 ? 'success.main' : 'primary.main' }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="body2" component="div" color="white">
                          {gameStats.synergyResult.score}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h6">{gameStats.synergyResult.composition}</Typography>
                  </Box>
                  
                  <Typography variant="body2" gutterBottom>시너지 강점:</Typography>
                  <Box sx={{ mb: 2 }}>
                    {gameStats.synergyResult.strengths.map((strength, index) => (
                      <Chip
                        key={index}
                        label={strength}
                        size="small"
                        icon={<CheckIcon />}
                        sx={{ m: 0.5, backgroundColor: 'rgba(76, 175, 80, 0.2)' }}
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="body2" gutterBottom>시너지 약점:</Typography>
                  <Box>
                    {gameStats.synergyResult.weaknesses.map((weakness, index) => (
                      <Chip
                        key={index}
                        label={weakness}
                        size="small"
                        icon={<WarningIcon />}
                        sx={{ m: 0.5, backgroundColor: 'rgba(244, 67, 54, 0.2)' }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>
              
              {/* 게임 데이터 분석 */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, backgroundColor: 'rgba(30,30,47,0.5)' }}>
                  <Typography variant="subtitle1" gutterBottom>게임 데이터 분석</Typography>
                  
                  {gameStats.teamAnalysis ? (
                    <>
                      <Typography variant="body2" gutterBottom>
                        {gameStats.teamAnalysis.gamesPlayed}개 게임 기반 (승률: {gameStats.teamAnalysis.winRate}%)
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" gutterBottom>플레이 스타일:</Typography>
                        <Chip 
                          label={gameStats.teamAnalysis.playStyle.style} 
                          color="primary"
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="caption" display="block">
                          평균 게임 시간: {gameStats.teamAnalysis.averageGameDuration}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" gutterBottom>추천 전략:</Typography>
                      <List dense>
                        {gameStats.teamAnalysis.playStyle.recommendations.map((rec, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemText primary={rec} />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  ) : (
                    <Typography variant="body2">
                      충분한 게임 데이터가 없습니다. 더 많은 게임을 플레이하여 데이터를 수집하세요.
                    </Typography>
                  )}
                </Paper>
              </Grid>
              
              {/* 상대하기 좋은/어려운 챔피언 */}
              {gameStats.teamAnalysis && gameStats.teamAnalysis.effectiveAgainst && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, backgroundColor: 'rgba(30,30,47,0.5)' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>상대하기 좋은 챔피언</Typography>
                        <List dense>
                          {gameStats.teamAnalysis.effectiveAgainst.map((entry, index) => (
                            <ListItem key={index}>
                              <Avatar 
                                alt={entry.champion} 
                                src={`https://ddragon.leagueoflegends.com/cdn/15.8.1/img/champion/${entry.champion}.png`}
                                sx={{ mr: 2, width: 30, height: 30 }}
                              />
                              <ListItemText 
                                primary={entry.champion} 
                                secondary={entry.reason}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>상대하기 어려운 챔피언</Typography>
                        <List dense>
                          {gameStats.teamAnalysis.weakAgainst.map((entry, index) => (
                            <ListItem key={index}>
                              <Avatar 
                                alt={entry.champion} 
                                src={`https://ddragon.leagueoflegends.com/cdn/15.8.1/img/champion/${entry.champion}.png`}
                                sx={{ mr: 2, width: 30, height: 30 }}
                              />
                              <ListItemText 
                                primary={entry.champion} 
                                secondary={entry.reason}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={fetchRiotData}
              >
                데이터 분석 시작
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Riot API와 게임 로그를 활용한 심층 분석을 시작합니다.
              </Typography>
            </Box>
          )}
        </TabPanel>
        
        {/* AI 예측 탭 */}
        <TabPanel value={tabValue} index={2}>
          {isLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
              <CircularProgress color="primary" />
              <Typography variant="body2" sx={{ mt: 2 }}>AI 분석 중...</Typography>
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <WarningIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography color="error">{error}</Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mt: 2 }} 
                onClick={fetchRiotData}
              >
                다시 시도
              </Button>
            </Box>
          ) : mlPredictions ? (
            <Grid container spacing={3}>
              {/* 승률 예측 */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, backgroundColor: 'rgba(30,30,47,0.5)' }}>
                  <Typography variant="subtitle1" gutterBottom>머신러닝 승률 예측</Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="body2" color="primary">블루팀</Typography>
                      <Typography variant="h4">
                        {mlPredictions.blueTeamWinProbability.toFixed(1)}%
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6">VS</Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="body2" color="error">레드팀</Typography>
                      <Typography variant="h4">
                        {mlPredictions.redTeamWinProbability.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      승률 예측 진행도:
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={mlPredictions.blueTeamWinProbability} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        backgroundColor: 'rgba(255,99,132,0.2)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'rgba(54,162,235,0.8)',
                        }
                      }}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                  
                  <Typography variant="body2" gutterBottom>
                    예측 결과: <Chip 
                      label={mlPredictions.predictedWinner === "BLUE" ? "블루팀 승리" : "레드팀 승리"} 
                      color={mlPredictions.predictedWinner === "BLUE" ? "primary" : "error"}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: 'rgba(255,255,255,0.6)' }}>
                    * 이 예측은 챔피언 조합 기반 ML 모델을 사용한 것으로, 실제 게임 결과와 다를 수 있습니다.
                  </Typography>
                </Paper>
              </Grid>
              
              {/* 챔피언 추천 */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, backgroundColor: 'rgba(30,30,47,0.5)' }}>
                  <Typography variant="subtitle1" gutterBottom>이 조합에 어울리는 챔피언 추천</Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      현재 블루팀 조합에 가장 잘 어울리는 챔피언을 확인해보세요.
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'].map(position => {
                      // 해당 포지션의 챔피언이 이미 있는지 확인
                      const hasPosition = gameData.participants
                        .filter(p => p.teamId === 100)
                        .some(p => p.individualPosition === position);
                      
                      if (hasPosition) return null;
                      
                      return (
                        <Grid item xs={12} sm={6} md={4} key={position}>
                          <Paper sx={{ p: 1, backgroundColor: 'rgba(30,30,47,0.8)' }}>
                            <Typography variant="subtitle2" gutterBottom>
                              {position} 추천
                            </Typography>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Button variant="outlined" size="small" color="primary">
                                추천 챔피언 보기
                              </Button>
                            </Box>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={fetchRiotData}
              >
                AI 분석 시작
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                머신러닝 모델을 활용한 승률 예측 및 챔피언 추천을 시작합니다.
              </Typography>
            </Box>
          )}
        </TabPanel>
      </CardContent>
    </Card>
  );
};

export default EnhancedCompositionAnalysis; 