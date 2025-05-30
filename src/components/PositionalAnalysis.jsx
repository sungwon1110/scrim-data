import React, { useState } from 'react';
import { 
  Card, CardContent, Typography, Box, Tabs, Tab, 
  Table, TableBody, TableCell, TableHead, TableRow,
  Grid, Paper, Chip, Divider, LinearProgress
} from '@mui/material';
import { 
  CompareArrows, ArrowUpward, ArrowDownward, Remove,
  Timeline, AssessmentOutlined, TrendingUp, TrendingDown
} from '@mui/icons-material';

/**
 * 포지션별 심층 분석 컴포넌트
 * 각 포지션별 상대 플레이어와의 비교 분석 결과 표시
 */
const PositionalAnalysis = ({ gameData }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  
  if (!gameData || !gameData.positionAnalysis) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            포지션별 분석 데이터가 없습니다
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  const { positionAnalysis, basicInfo } = gameData;
  const positions = Object.keys(positionAnalysis.positionAnalysis || {});
  
  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  
  return (
    <Card sx={{ mb: 3, backgroundColor: '#1E1E2F', color: 'white' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          포지션별 심층 분석
        </Typography>
        
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ 
            mb: 2,
            '& .MuiTab-root': { 
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-selected': { color: 'white' }
            }
          }}
        >
          <Tab label="팀 개요" />
          {positions.map((position, index) => (
            <Tab key={position} label={formatPosition(position)} />
          ))}
        </Tabs>
        
        {/* 팀 개요 탭 */}
        {selectedTab === 0 && (
          <TeamOverview overallAnalysis={positionAnalysis.overallAnalysis} />
        )}
        
        {/* 포지션별 탭 */}
        {selectedTab > 0 && selectedTab <= positions.length && (
          <PositionMatchup 
            position={positions[selectedTab - 1]} 
            matchupData={positionAnalysis.positionAnalysis[positions[selectedTab - 1]]} 
          />
        )}
      </CardContent>
    </Card>
  );
};

/**
 * 팀 개요 컴포넌트
 * 팀 전체 통계 및 리소스 분배 효율 표시
 */
const TeamOverview = ({ overallAnalysis }) => {
  if (!overallAnalysis) return null;
  
  const { blueTeam, redTeam, differences, resourceDistribution, positionAdvantages, overallAdvantage, overallWinner } = overallAnalysis;
  
  return (
    <Grid container spacing={2}>
      {/* 팀 기본 통계 */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }}>
          <Typography variant="subtitle1" gutterBottom>
            팀 통계 비교
          </Typography>
          
          <Table size="small" sx={{ '& .MuiTableCell-root': { color: 'white', borderColor: 'rgba(255, 255, 255, 0.1)' } }}>
            <TableHead>
              <TableRow>
                <TableCell>지표</TableCell>
                <TableCell align="right">블루팀</TableCell>
                <TableCell align="center">차이</TableCell>
                <TableCell align="left">레드팀</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <StatRow 
                label="킬" 
                blueValue={blueTeam.totalKills} 
                redValue={redTeam.totalKills} 
                diff={differences.totalKills} 
              />
              <StatRow 
                label="데스" 
                blueValue={blueTeam.totalDeaths} 
                redValue={redTeam.totalDeaths} 
                diff={differences.totalDeaths}
                inversed={true}
              />
              <StatRow 
                label="어시스트" 
                blueValue={blueTeam.totalAssists} 
                redValue={redTeam.totalAssists} 
                diff={differences.totalAssists} 
              />
              <StatRow 
                label="골드" 
                blueValue={blueTeam.totalGold} 
                redValue={redTeam.totalGold} 
                diff={differences.totalGold}
                format={formatGold}
              />
              <StatRow 
                label="데미지" 
                blueValue={blueTeam.totalDamage} 
                redValue={redTeam.totalDamage} 
                diff={differences.totalDamage}
                format={formatNumber}
              />
              <StatRow 
                label="CS" 
                blueValue={blueTeam.totalCs} 
                redValue={redTeam.totalCs} 
                diff={differences.totalCs} 
              />
              <StatRow 
                label="시야 점수" 
                blueValue={blueTeam.totalVision} 
                redValue={redTeam.totalVision} 
                diff={differences.totalVision} 
              />
              <StatRow 
                label="KDA" 
                blueValue={blueTeam.kda} 
                redValue={redTeam.kda} 
                diff={blueTeam.kda - redTeam.kda}
                format={value => value.toFixed(2)}
              />
            </TableBody>
          </Table>
        </Paper>
      </Grid>
      
      {/* 포지션별 어드밴티지 */}
      {positionAdvantages && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                포지션별 라인전 우위
              </Typography>
              <Chip 
                label={`전체: ${overallWinner === 'blue' ? '블루팀' : '레드팀'} 우위 (${Math.abs(overallAdvantage).toFixed(2)})`} 
                color={overallWinner === 'blue' ? 'primary' : 'error'}
                size="small"
              />
            </Box>
            
            <Grid container spacing={1}>
              {Object.entries(positionAdvantages).map(([position, data]) => (
                <Grid item xs={12} sm={6} md={2.4} key={position}>
                  <Paper 
                    sx={{ 
                      p: 1.5, 
                      backgroundColor: data.winner === 'blue' ? 'rgba(83, 131, 232, 0.2)' : 'rgba(232, 64, 87, 0.2)',
                      border: `1px solid ${data.winner === 'blue' ? '#5383e8' : '#e84057'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="body2" gutterBottom>{formatPosition(position)}</Typography>
                    <Typography 
                      variant="h6" 
                      color={data.winner === 'blue' ? 'primary.main' : 'error.main'}
                    >
                      {data.winner === 'blue' ? '블루' : '레드'}
                    </Typography>
                    <Box sx={{ width: '100%', mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={data.winner === 'blue' ? 50 + (data.magnitude * 25) : 50 - (data.magnitude * 25)}
                        color={data.winner === 'blue' ? 'primary' : 'error'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ mt: 0.5 }}>
                      우위도: {data.magnitude.toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      )}
      
      {/* 리소스 분배 효율 */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }}>
          <Typography variant="subtitle1" gutterBottom>
            블루팀 리소스 분배
          </Typography>
          
          <ResourceDistribution 
            distribution={resourceDistribution.blue}
            teamColor="#5383e8"
          />
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }}>
          <Typography variant="subtitle1" gutterBottom>
            레드팀 리소스 분배
          </Typography>
          
          <ResourceDistribution 
            distribution={resourceDistribution.red}
            teamColor="#e84057"
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

/**
 * 리소스 분배 효율 컴포넌트
 */
const ResourceDistribution = ({ distribution, teamColor }) => {
  if (!distribution || !distribution.playerDistributions) return null;
  
  return (
    <Box>
      {distribution.playerDistributions.map((player, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">
              {player.name} ({formatPosition(player.position)})
            </Typography>
            <Typography variant="body2" color={player.damageEfficiency >= 1 ? 'success.main' : 'error.main'}>
              효율: {player.damageEfficiency.toFixed(2)}x
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" sx={{ width: '50px' }}>골드:</Typography>
            <Box sx={{ flexGrow: 1, mx: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={player.goldShare} 
                sx={{ 
                  height: 8, 
                  borderRadius: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: teamColor
                  }
                }}
              />
            </Box>
            <Typography variant="caption">{player.goldShare.toFixed(1)}%</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ width: '50px' }}>데미지:</Typography>
            <Box sx={{ flexGrow: 1, mx: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={player.damageShare} 
                sx={{ 
                  height: 8, 
                  borderRadius: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: player.damageEfficiency >= 1 ? '#4caf50' : '#e84057'
                  }
                }}
              />
            </Box>
            <Typography variant="caption">{player.damageShare.toFixed(1)}%</Typography>
          </Box>
        </Box>
      ))}
      
      <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2">캐리 골드 점유율:</Typography>
        <Typography variant="body2">{distribution.carryGoldShare.toFixed(1)}%</Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="body2">캐리 효율:</Typography>
        <Typography 
          variant="body2" 
          color={distribution.carryEfficiency >= 1 ? 'success.main' : 'error.main'}
        >
          {distribution.carryEfficiency.toFixed(2)}x
        </Typography>
      </Box>
    </Box>
  );
};

/**
 * 포지션 매치업 컴포넌트
 * 같은 포지션의 두 플레이어 비교 분석
 */
const PositionMatchup = ({ position, matchupData }) => {
  if (!matchupData) return null;
  
  const { champions, players, comparison } = matchupData;
  const { blue, red } = players;
  
  // 매치업 승자 판단
  const winner = comparison.overallWinner;
  const advantage = comparison.advantage;
  const advantageLevel = getAdvantageLevel(advantage);
  
  return (
    <Grid container spacing={2}>
      {/* 매치업 요약 */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                backgroundColor: '#5383e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1
              }}>
                <Typography variant="subtitle1">{formatPosition(position, true)}</Typography>
              </Box>
              <Typography variant="subtitle1">
                {blue.name} ({champions.blue.name})
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Chip 
                icon={<CompareArrows />}
                label={`${advantageLevel} 우위`} 
                color={winner === 'blue' ? 'primary' : 'error'}
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" display="block">
                승자: {winner === 'blue' ? '블루팀' : '레드팀'} ({advantage.toFixed(2)} 점수차)
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1">
                {red.name} ({champions.red.name})
              </Typography>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                backgroundColor: '#e84057',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: 1
              }}>
                <Typography variant="subtitle1">{formatPosition(position, true)}</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Grid>
      
      {/* 플레이어 통계 비교 */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }}>
          <Typography variant="subtitle1" gutterBottom>
            플레이어 통계 비교
          </Typography>
          
          <Table size="small" sx={{ '& .MuiTableCell-root': { color: 'white', borderColor: 'rgba(255, 255, 255, 0.1)' } }}>
            <TableHead>
              <TableRow>
                <TableCell>지표</TableCell>
                <TableCell align="right">블루팀</TableCell>
                <TableCell align="center">차이</TableCell>
                <TableCell align="left">레드팀</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <StatRow 
                label="KDA" 
                blueValue={blue.stats.kda} 
                redValue={red.stats.kda} 
                diff={comparison.kdaDiff}
                format={value => value.toFixed(2)}
              />
              <StatRow 
                label="킬" 
                blueValue={blue.stats.kills} 
                redValue={red.stats.kills} 
                diff={blue.stats.kills - red.stats.kills} 
              />
              <StatRow 
                label="데스" 
                blueValue={blue.stats.deaths} 
                redValue={red.stats.deaths} 
                diff={blue.stats.deaths - red.stats.deaths}
                inversed={true}
              />
              <StatRow 
                label="어시스트" 
                blueValue={blue.stats.assists} 
                redValue={red.stats.assists} 
                diff={blue.stats.assists - red.stats.assists} 
              />
              <StatRow 
                label="CS" 
                blueValue={blue.stats.cs} 
                redValue={red.stats.cs} 
                diff={comparison.csDiff}
              />
              <StatRow 
                label="골드" 
                blueValue={blue.stats.gold} 
                redValue={red.stats.gold} 
                diff={comparison.goldDiff}
                format={formatGold}
              />
              <StatRow 
                label="챔피언 데미지" 
                blueValue={blue.stats.damage} 
                redValue={red.stats.damage} 
                diff={comparison.damageDiff}
                format={formatNumber}
              />
              <StatRow 
                label="시야 점수" 
                blueValue={blue.stats.vision} 
                redValue={red.stats.vision} 
                diff={comparison.visionDiff}
              />
            </TableBody>
          </Table>
        </Paper>
      </Grid>
      
      {/* 핵심 지표 차트 */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white' }}>
          <Typography variant="subtitle1" gutterBottom>
            핵심 지표 격차
          </Typography>
          
          <KeyMetricBar 
            label="CS 격차" 
            value={comparison.csDiff} 
            maxValue={30}
            icon={<Timeline />}
          />
          <KeyMetricBar 
            label="골드 격차" 
            value={comparison.goldDiff} 
            maxValue={2000}
            icon={<AssessmentOutlined />}
            format={value => `${formatGold(Math.abs(value))} ${value >= 0 ? '앞섬' : '뒤짐'}`}
          />
          <KeyMetricBar 
            label="데미지 격차" 
            value={comparison.damageDiff} 
            maxValue={5000}
            icon={value => value >= 0 ? <TrendingUp /> : <TrendingDown />}
            format={value => `${formatNumber(Math.abs(value))} ${value >= 0 ? '더 가함' : '덜 가함'}`}
          />
          <KeyMetricBar 
            label="KDA 격차" 
            value={comparison.kdaDiff} 
            maxValue={3}
            icon={<CompareArrows />}
            format={value => value.toFixed(2)}
          />
          <KeyMetricBar 
            label="시야 점수 격차" 
            value={comparison.visionDiff} 
            maxValue={20}
            icon={<CompareArrows />}
            format={value => value.toFixed(0)}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

/**
 * 통계 행 컴포넌트
 * 두 팀의 통계 값과 차이를 표시
 */
const StatRow = ({ label, blueValue, redValue, diff, format, inversed = false }) => {
  // 값 포맷팅 함수
  const formatValue = format || (val => val);
  
  // 값이 높을수록 좋은지 또는 낮을수록 좋은지 판단
  const isPositive = inversed ? diff < 0 : diff > 0;
  const isNeutral = diff === 0;
  
  // 차이 색상 결정
  let diffColor = 'text.secondary';
  if (!isNeutral) {
    diffColor = isPositive ? 'primary.main' : 'error.main';
  }
  
  return (
    <TableRow>
      <TableCell>{label}</TableCell>
      <TableCell align="right">{formatValue(blueValue)}</TableCell>
      <TableCell align="center" sx={{ color: diffColor }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isNeutral ? (
            <Remove fontSize="small" />
          ) : isPositive ? (
            <ArrowUpward fontSize="small" color="primary" />
          ) : (
            <ArrowDownward fontSize="small" color="error" />
          )}
          {formatValue(Math.abs(diff))}
        </Box>
      </TableCell>
      <TableCell align="left">{formatValue(redValue)}</TableCell>
    </TableRow>
  );
};

/**
 * 핵심 지표 바 차트
 */
const KeyMetricBar = ({ label, value, maxValue, icon, format }) => {
  // 값 정규화 (-100% ~ +100%)
  const normalizedValue = Math.max(Math.min(value / maxValue, 1), -1) * 100;
  
  // 파란색 또는 빨간색 결정
  const isPositive = value >= 0;
  const barColor = isPositive ? '#5383e8' : '#e84057';
  
  // 텍스트 포맷팅
  const formatText = format || (val => val);
  
  // 아이콘 렌더링
  const renderIcon = () => {
    if (typeof icon === 'function') {
      return icon(value);
    }
    return icon;
  };
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {renderIcon()}
          <Typography variant="body2" sx={{ ml: 0.5 }}>
            {label}
          </Typography>
        </Box>
        <Typography variant="body2" color={isPositive ? 'primary.main' : 'error.main'}>
          {formatText(value)}
        </Typography>
      </Box>
      
      <Box sx={{ position: 'relative', height: 8, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 1 }}>
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: isPositive ? '50%' : `calc(50% - ${Math.abs(normalizedValue)}%)`,
          right: isPositive ? `calc(50% - ${normalizedValue}%)` : '50%',
          bottom: 0,
          backgroundColor: barColor,
          borderRadius: 1
        }} />
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: '50%', 
          bottom: 0, 
          width: 1, 
          backgroundColor: 'rgba(255, 255, 255, 0.5)' 
        }} />
      </Box>
    </Box>
  );
};

/**
 * 포지션 이름 포맷팅
 * @param {string} position - 포지션 이름
 * @param {boolean} short - 짧은 버전 반환 여부
 * @returns {string} 포맷팅된 포지션 이름
 */
const formatPosition = (position, short = false) => {
  if (!position) return '';
  
  const positionMap = {
    TOP: short ? '탑' : '탑',
    JUNGLE: short ? '정글' : '정글',
    MIDDLE: short ? '미드' : '미드',
    BOTTOM: short ? '원딜' : '원딜',
    UTILITY: short ? '서폿' : '서포터'
  };
  
  return positionMap[position] || position;
};

/**
 * 어드밴티지 레벨 결정
 * @param {number} advantage - 어드밴티지 점수
 * @returns {string} 어드밴티지 레벨
 */
const getAdvantageLevel = (advantage) => {
  if (advantage >= 0.8) return '압도적';
  if (advantage >= 0.5) return '명확한';
  if (advantage >= 0.2) return '소폭';
  return '근소한';
};

/**
 * 골드 포맷팅
 * @param {number} gold - 골드
 * @returns {string} 포맷팅된 골드 문자열
 */
const formatGold = (gold) => {
  if (gold >= 1000) {
    return `${(gold / 1000).toFixed(1)}k`;
  }
  return gold.toString();
};

/**
 * 숫자 포맷팅 (천 단위 구분)
 * @param {number} num - 숫자
 * @returns {string} 포맷팅된 숫자
 */
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default PositionalAnalysis; 