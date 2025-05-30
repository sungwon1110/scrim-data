/**
 * 포지션별 심층 분석 유틸리티
 * 라인 점유율, 시간대별 경험치/골드/CS 차이 등 분석
 */

/**
 * 포지션별 비교 분석 수행
 * @param {Object} gameData - 게임 데이터
 * @returns {Object} 포지션별 분석 결과
 */
export const analyzePositions = (gameData) => {
  // 플레이어 데이터 추출 및 포지션별 정렬
  const { BluePlayers, RedPlayers } = gameData;
  
  if (!BluePlayers || !RedPlayers) {
    return { error: '플레이어 데이터가 없습니다' };
  }
  
  // 포지션별 데이터 매핑
  const positionPairs = mapPositionPairs(BluePlayers, RedPlayers);
  
  // 포지션별 분석 수행
  const positionAnalysis = {};
  
  for (const [position, { blue, red }] of Object.entries(positionPairs)) {
    // 해당 포지션에 데이터가 있는 경우만 분석
    if (blue && red) {
      positionAnalysis[position] = analyzePositionMatchup(blue, red);
    }
  }
  
  return {
    positionAnalysis,
    overallAnalysis: analyzeTeamComparison(BluePlayers, RedPlayers)
  };
};

/**
 * 블루팀과 레드팀 플레이어를 포지션별로 매핑
 * @param {Array} bluePlayers - 블루팀 플레이어 배열
 * @param {Array} redPlayers - 레드팀 플레이어 배열
 * @returns {Object} 포지션별 매핑 결과
 */
const mapPositionPairs = (bluePlayers, redPlayers) => {
  const positionMap = {
    TOP: { blue: null, red: null },
    JUNGLE: { blue: null, red: null },
    MIDDLE: { blue: null, red: null },
    BOTTOM: { blue: null, red: null },
    UTILITY: { blue: null, red: null }
  };
  
  // 포지션 정규화 함수
  const normalizePosition = (position) => {
    if (!position) return null;
    
    const pos = position.toUpperCase();
    if (pos.includes('TOP')) return 'TOP';
    if (pos.includes('JUNGLE') || pos.includes('JNG')) return 'JUNGLE';
    if (pos.includes('MID')) return 'MIDDLE';
    if (pos.includes('BOT') || pos.includes('ADC') || pos.includes('BOTTOM')) return 'BOTTOM';
    if (pos.includes('SUPP') || pos.includes('UTILITY')) return 'UTILITY';
    
    return null;
  };
  
  // 블루팀 플레이어 매핑
  bluePlayers.forEach(player => {
    const position = normalizePosition(player.TeamPosition || player.individualPosition);
    if (position && positionMap[position]) {
      positionMap[position].blue = player;
    }
  });
  
  // 레드팀 플레이어 매핑
  redPlayers.forEach(player => {
    const position = normalizePosition(player.TeamPosition || player.individualPosition);
    if (position && positionMap[position]) {
      positionMap[position].red = player;
    }
  });
  
  return positionMap;
};

/**
 * 같은 포지션의 두 플레이어 비교 분석
 * @param {Object} bluePlayer - 블루팀 플레이어
 * @param {Object} redPlayer - 레드팀 플레이어
 * @returns {Object} 비교 분석 결과
 */
const analyzePositionMatchup = (bluePlayer, redPlayer) => {
  // 주요 지표 계산
  const csBlue = (bluePlayer.MinionsKilled || 0) + (bluePlayer.NeutralMinionsKilled || 0);
  const csRed = (redPlayer.MinionsKilled || 0) + (redPlayer.NeutralMinionsKilled || 0);
  const csDiff = csBlue - csRed;
  
  const goldBlue = bluePlayer.GoldEarned || 0;
  const goldRed = redPlayer.GoldEarned || 0;
  const goldDiff = goldBlue - goldRed;
  
  const damageBlue = bluePlayer.TotalDamageDealtToChampions || 0;
  const damageRed = redPlayer.TotalDamageDealtToChampions || 0;
  const damageDiff = damageBlue - damageRed;
  
  // KDA 계산
  const kdaBlue = calculateKDA(bluePlayer.ChampionsKilled || 0, bluePlayer.NumDeaths || 0, bluePlayer.Assists || 0);
  const kdaRed = calculateKDA(redPlayer.ChampionsKilled || 0, redPlayer.NumDeaths || 0, redPlayer.Assists || 0);
  
  // 시야 점수 비교
  const visionBlue = bluePlayer.VisionScore || 0;
  const visionRed = redPlayer.VisionScore || 0;
  const visionDiff = visionBlue - visionRed;
  
  // 승자 판단 - 단순 합산으로 변경
  const blueAdvantage = calculateSimpleAdvantage(csDiff, goldDiff, damageDiff, kdaBlue - kdaRed, visionDiff);
  
  return {
    champions: {
      blue: {
        id: bluePlayer.Skin || 0,
        name: bluePlayer.championName || 'Unknown',
      },
      red: {
        id: redPlayer.Skin || 0,
        name: redPlayer.championName || 'Unknown',
      }
    },
    players: {
      blue: {
        name: bluePlayer.Name || 'Unknown',
        stats: {
          kills: bluePlayer.ChampionsKilled || 0,
          deaths: bluePlayer.NumDeaths || 0,
          assists: bluePlayer.Assists || 0,
          kda: kdaBlue,
          cs: csBlue,
          gold: goldBlue,
          damage: damageBlue,
          vision: visionBlue
        }
      },
      red: {
        name: redPlayer.Name || 'Unknown',
        stats: {
          kills: redPlayer.ChampionsKilled || 0,
          deaths: redPlayer.NumDeaths || 0,
          assists: redPlayer.Assists || 0,
          kda: kdaRed,
          cs: csRed,
          gold: goldRed,
          damage: damageRed,
          vision: visionRed
        }
      }
    },
    comparison: {
      csDiff,
      goldDiff,
      damageDiff,
      visionDiff,
      kdaDiff: kdaBlue - kdaRed,
      blueAdvantage,
      overallWinner: blueAdvantage > 0 ? 'blue' : 'red',
      advantage: Math.abs(blueAdvantage)
    }
  };
};

/**
 * 팀 전체 비교 분석
 * @param {Array} bluePlayers - 블루팀 플레이어 배열
 * @param {Array} redPlayers - 레드팀 플레이어 배열
 * @returns {Object} 팀 비교 분석 결과
 */
const analyzeTeamComparison = (bluePlayers, redPlayers) => {
  // 팀 전체 통계 집계
  const blueStats = aggregateTeamStats(bluePlayers);
  const redStats = aggregateTeamStats(redPlayers);
  
  // 팀 간 차이 계산
  const teamDiff = {
    totalKills: blueStats.totalKills - redStats.totalKills,
    totalDeaths: blueStats.totalDeaths - redStats.totalDeaths,
    totalAssists: blueStats.totalAssists - redStats.totalAssists,
    totalGold: blueStats.totalGold - redStats.totalGold,
    totalDamage: blueStats.totalDamage - redStats.totalDamage,
    totalCs: blueStats.totalCs - redStats.totalCs,
    totalVision: blueStats.totalVision - redStats.totalVision
  };
  
  // 리소스 분배 효율 계산
  const blueResourceDistribution = calculateResourceDistribution(bluePlayers);
  const redResourceDistribution = calculateResourceDistribution(redPlayers);
  
  // 포지션별 비교 단순화
  const positionPairs = mapPositionPairs(bluePlayers, redPlayers);
  const positionAdvantages = {};
  
  for (const [position, { blue, red }] of Object.entries(positionPairs)) {
    if (blue && red) {
      // 주요 지표 계산
      const csBlue = (blue.MinionsKilled || 0) + (blue.NeutralMinionsKilled || 0);
      const csRed = (red.MinionsKilled || 0) + (red.NeutralMinionsKilled || 0);
      const csDiff = csBlue - csRed;
      
      const goldBlue = blue.GoldEarned || 0;
      const goldRed = red.GoldEarned || 0;
      const goldDiff = goldBlue - goldRed;
      
      const damageBlue = blue.TotalDamageDealtToChampions || 0;
      const damageRed = red.TotalDamageDealtToChampions || 0;
      const damageDiff = damageBlue - damageRed;
      
      // KDA 계산
      const kdaBlue = calculateKDA(blue.ChampionsKilled || 0, blue.NumDeaths || 0, blue.Assists || 0);
      const kdaRed = calculateKDA(red.ChampionsKilled || 0, red.NumDeaths || 0, red.Assists || 0);
      
      // 시야 점수 비교
      const visionBlue = blue.VisionScore || 0;
      const visionRed = red.VisionScore || 0;
      const visionDiff = visionBlue - visionRed;
      
      // 단순 합산으로 어드밴티지 계산
      const blueAdvantage = calculateSimpleAdvantage(csDiff, goldDiff, damageDiff, kdaBlue - kdaRed, visionDiff);
      
      positionAdvantages[position] = {
        advantage: blueAdvantage,
        winner: blueAdvantage > 0 ? 'blue' : 'red',
        magnitude: Math.abs(blueAdvantage)
      };
    }
  }
  
  // 팀 전체 어드밴티지 계산 (직접적인 지표 기반)
  const overallAdvantage = calculateSimpleAdvantage(
    teamDiff.totalCs,
    teamDiff.totalGold, 
    teamDiff.totalDamage,
    blueStats.kda - redStats.kda,
    teamDiff.totalVision
  );
  
  return {
    blueTeam: blueStats,
    redTeam: redStats,
    differences: teamDiff,
    positionAdvantages,
    overallAdvantage,
    overallWinner: overallAdvantage > 0 ? 'blue' : 'red',
    resourceDistribution: {
      blue: blueResourceDistribution,
      red: redResourceDistribution
    }
  };
};

/**
 * 팀 전체 통계 집계
 * @param {Array} players - 플레이어 배열
 * @returns {Object} 집계된 팀 통계
 */
const aggregateTeamStats = (players) => {
  const totalKills = players.reduce((sum, p) => sum + (p.ChampionsKilled || 0), 0);
  const totalDeaths = players.reduce((sum, p) => sum + (p.NumDeaths || 0), 0);
  const totalAssists = players.reduce((sum, p) => sum + (p.Assists || 0), 0);
  const totalGold = players.reduce((sum, p) => sum + (p.GoldEarned || 0), 0);
  const totalDamage = players.reduce((sum, p) => sum + (p.TotalDamageDealtToChampions || 0), 0);
  const totalCs = players.reduce((sum, p) => sum + ((p.MinionsKilled || 0) + (p.NeutralMinionsKilled || 0)), 0);
  const totalVision = players.reduce((sum, p) => sum + (p.VisionScore || 0), 0);
  
  return {
    totalKills,
    totalDeaths,
    totalAssists,
    totalGold,
    totalDamage,
    totalCs,
    totalVision,
    kda: calculateKDA(totalKills, totalDeaths, totalAssists)
  };
};

/**
 * 리소스 분배 효율 계산
 * @param {Array} players - 플레이어 배열
 * @returns {Object} 리소스 분배 효율 분석 결과
 */
const calculateResourceDistribution = (players) => {
  const totalGold = players.reduce((sum, p) => sum + (p.GoldEarned || 0), 0);
  const totalDamage = players.reduce((sum, p) => sum + (p.TotalDamageDealtToChampions || 0), 0);
  
  // 각 플레이어의 골드 점유율과 데미지 점유율 계산
  const distributions = players.map(player => {
    const goldShare = totalGold > 0 ? ((player.GoldEarned || 0) / totalGold) * 100 : 0;
    const damageShare = totalDamage > 0 ? ((player.TotalDamageDealtToChampions || 0) / totalDamage) * 100 : 0;
    
    // 골드 대비 데미지 효율
    const damageEfficiency = goldShare > 0 ? damageShare / goldShare : 0;
    
    return {
      name: player.Name || 'Unknown',
      position: player.TeamPosition || player.individualPosition || 'Unknown',
      goldShare,
      damageShare,
      damageEfficiency
    };
  });
  
  // 팀 전체의 리소스 분배 효율 계산
  // 캐리 포지션(미드, 원딜)에 골드가 많이 분배되었는지
  const carryPositions = distributions.filter(d => 
    d.position.toUpperCase().includes('MID') || 
    d.position.toUpperCase().includes('BOT') || 
    d.position.toUpperCase().includes('ADC') ||
    d.position.toUpperCase().includes('BOTTOM')
  );
  
  const carryGoldShare = carryPositions.reduce((sum, p) => sum + p.goldShare, 0);
  const carryDamageShare = carryPositions.reduce((sum, p) => sum + p.damageShare, 0);
  
  return {
    playerDistributions: distributions,
    carryGoldShare,
    carryDamageShare,
    carryEfficiency: carryGoldShare > 0 ? carryDamageShare / carryGoldShare : 0,
    // 골드 점유율의 표준편차 (낮을수록 골드가 고르게 분배됨)
    goldDistributionStdDev: calculateStdDev(distributions.map(d => d.goldShare))
  };
};

/**
 * 단순 어드밴티지 점수 계산 (가중치 시스템 없이 정규화만 적용)
 * @param {Number} csDiff - CS 차이
 * @param {Number} goldDiff - 골드 차이
 * @param {Number} damageDiff - 데미지 차이
 * @param {Number} kdaDiff - KDA 차이
 * @param {Number} visionDiff - 시야 점수 차이
 * @returns {Number} 어드밴티지 점수
 */
const calculateSimpleAdvantage = (csDiff, goldDiff, damageDiff, kdaDiff, visionDiff) => {
  // 단순 정규화 기준값
  const normValues = {
    cs: 30,
    gold: 1500,
    damage: 5000,
    kda: 3,
    vision: 20
  };
  
  // 값 정규화
  const normalizedCs = normalizeValue(csDiff, normValues.cs);
  const normalizedGold = normalizeValue(goldDiff, normValues.gold);
  const normalizedDamage = normalizeValue(damageDiff, normValues.damage);
  const normalizedKda = normalizeValue(kdaDiff, normValues.kda);
  const normalizedVision = normalizeValue(visionDiff, normValues.vision);
  
  // 단순 평균
  return (normalizedCs + normalizedGold + normalizedDamage + normalizedKda + normalizedVision) / 5;
};

/**
 * KDA 계산
 * @param {Number} kills - 킬
 * @param {Number} deaths - 데스
 * @param {Number} assists - 어시스트
 * @returns {Number} KDA
 */
const calculateKDA = (kills, deaths, assists) => {
  return deaths === 0 ? kills + assists : (kills + assists) / deaths;
};

/**
 * 값을 -1 ~ 1 사이로 정규화
 * @param {Number} value - 원본 값
 * @param {Number} maxValue - 최대 기준값
 * @returns {Number} 정규화된 값
 */
const normalizeValue = (value, maxValue) => {
  return Math.max(Math.min(value / maxValue, 1), -1);
};

/**
 * 표준편차 계산
 * @param {Array} values - 값 배열
 * @returns {Number} 표준편차
 */
const calculateStdDev = (values) => {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
};

export default {
  analyzePositions
}; 