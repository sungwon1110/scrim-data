/**
 * 게임 로그 분석 유틸리티
 * 게임 데이터를 기반으로 통계 분석 및 패턴 식별
 */

/**
 * 특정 챔피언의 전체 게임에서의 성능 분석
 * @param {Array} games - 게임 데이터 배열
 * @param {string} championName - 분석할 챔피언 이름
 * @returns {Object} 해당 챔피언의 통계 데이터
 */
export const analyzeChampionPerformance = (games, championName) => {
  if (!games || !games.length || !championName) {
    return { error: '유효한 데이터가 아닙니다.' };
  }

  // 해당 챔피언이 등장한 게임 필터링
  const relevantGames = games.filter(game => 
    game.participants.some(p => p.championName === championName)
  );

  if (relevantGames.length === 0) {
    return { 
      championName, 
      gamesPlayed: 0, 
      message: '해당 챔피언으로 플레이한 게임이 없습니다.' 
    };
  }

  // 기본 통계 계산
  let wins = 0;
  let kills = 0;
  let deaths = 0;
  let assists = 0;
  let totalDamage = 0;
  let totalGold = 0;
  let totalCS = 0;
  let totalVisionScore = 0;

  relevantGames.forEach(game => {
    const player = game.participants.find(p => p.championName === championName);
    if (!player) return;

    if (player.win) wins++;
    kills += player.kills || 0;
    deaths += player.deaths || 0;
    assists += player.assists || 0;
    totalDamage += player.totalDamageDealtToChampions || 0;
    totalGold += player.goldEarned || 0;
    totalCS += player.totalMinionsKilled || 0;
    totalVisionScore += player.visionScore || 0;
  });

  const gamesPlayed = relevantGames.length;
  const winRate = (wins / gamesPlayed) * 100;
  const kda = deaths === 0 ? 'Perfect' : ((kills + assists) / deaths).toFixed(2);
  
  return {
    championName,
    gamesPlayed,
    winRate: winRate.toFixed(1),
    kda,
    averageKills: (kills / gamesPlayed).toFixed(1),
    averageDeaths: (deaths / gamesPlayed).toFixed(1),
    averageAssists: (assists / gamesPlayed).toFixed(1),
    averageDamage: Math.round(totalDamage / gamesPlayed),
    averageGold: Math.round(totalGold / gamesPlayed),
    averageCS: (totalCS / gamesPlayed).toFixed(1),
    averageVisionScore: (totalVisionScore / gamesPlayed).toFixed(1)
  };
};

/**
 * 특정 챔피언 조합의 성능 분석
 * @param {Array} games - 게임 데이터 배열
 * @param {Array} championNames - 분석할 챔피언 이름 배열
 * @returns {Object} 해당 조합의 통계 데이터
 */
export const analyzeTeamComposition = (games, championNames) => {
  if (!games || !games.length || !championNames || !championNames.length) {
    return { error: '유효한 데이터가 아닙니다.' };
  }

  // 해당 조합이 등장한 게임 필터링 (적어도 3명 이상의 챔피언이 일치하는 경우)
  const minMatchCount = Math.min(3, championNames.length);
  
  const relevantGames = games.filter(game => {
    const teamChampions = game.participants
      .filter(p => p.teamId === 100) // 블루팀만 고려 (실제로는 양쪽 다 확인해야 함)
      .map(p => p.championName);
    
    // 일치하는 챔피언 수 확인
    const matchCount = championNames.filter(name => teamChampions.includes(name)).length;
    return matchCount >= minMatchCount;
  });

  if (relevantGames.length === 0) {
    return { 
      composition: championNames.join(', '), 
      gamesPlayed: 0, 
      message: '해당 조합으로 플레이한 게임이 없습니다.' 
    };
  }

  // 기본 통계 계산
  let wins = 0;
  let totalGameDuration = 0;
  let totalKills = 0;
  let totalDeaths = 0;
  let totalTowers = 0;
  let totalDragons = 0;
  let totalBarons = 0;

  relevantGames.forEach(game => {
    // 우리 팀 정보 (블루팀 가정)
    const ourTeam = game.teams.find(t => t.teamId === 100);
    if (!ourTeam) return;

    if (ourTeam.win) wins++;
    totalGameDuration += game.gameDuration || 0;
    
    // 팀 전체 킬/데스 (블루팀)
    const ourPlayers = game.participants.filter(p => p.teamId === 100);
    totalKills += ourPlayers.reduce((sum, p) => sum + (p.kills || 0), 0);
    totalDeaths += ourPlayers.reduce((sum, p) => sum + (p.deaths || 0), 0);
    
    // 오브젝트 정보 (실제 데이터에는 더 자세한 정보가 필요함)
    // 여기서는 더미 데이터로 대체
    totalTowers += Math.floor(Math.random() * 5) + 3; // 3-7
    totalDragons += Math.floor(Math.random() * 3) + 1; // 1-3
    totalBarons += Math.floor(Math.random() * 2); // 0-1
  });

  const gamesPlayed = relevantGames.length;
  const winRate = (wins / gamesPlayed) * 100;
  const avgGameDuration = totalGameDuration / gamesPlayed;
  const minutes = Math.floor(avgGameDuration / 60);
  const seconds = Math.floor(avgGameDuration % 60);
  
  return {
    composition: championNames.join(', '),
    gamesPlayed,
    winRate: winRate.toFixed(1),
    averageGameDuration: `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`,
    averageKills: (totalKills / gamesPlayed).toFixed(1),
    averageDeaths: (totalDeaths / gamesPlayed).toFixed(1),
    averageTowers: (totalTowers / gamesPlayed).toFixed(1),
    averageDragons: (totalDragons / gamesPlayed).toFixed(1),
    averageBarons: (totalBarons / gamesPlayed).toFixed(1),
    effectiveAgainst: generateEffectiveAgainstList(relevantGames, championNames, true),
    weakAgainst: generateEffectiveAgainstList(relevantGames, championNames, false),
    playStyle: determinePlayStyle(relevantGames, championNames)
  };
};

/**
 * 특정 조합이 상대하기 좋거나 어려운 챔피언 목록 생성
 * @param {Array} games - 관련 게임 데이터
 * @param {Array} ourComposition - 우리 조합의 챔피언 이름 배열
 * @param {boolean} isEffective - true면 상대하기 좋은 챔피언, false면 어려운 챔피언
 * @returns {Array} 챔피언 이름 및 이유 배열
 */
const generateEffectiveAgainstList = (games, ourComposition, isEffective) => {
  // 실제 구현에서는 게임 데이터 분석을 통해 상성 관계 도출
  // 여기서는 더미 데이터로 대체
  
  if (isEffective) {
    // 상대하기 좋은 챔피언들
    return [
      { champion: "Yone", reason: "CC로 쉽게 제압 가능" },
      { champion: "Katarina", reason: "CC기로 궁극기 차단 가능" },
      { champion: "Master Yi", reason: "초반 정글 압박에 취약" }
    ];
  } else {
    // 상대하기 어려운 챔피언들
    return [
      { champion: "Malphite", reason: "강력한 이니시에이션" },
      { champion: "Kayle", reason: "후반 스케일링에 취약" },
      { champion: "Jax", reason: "분담된 탱킹 능력으로 상대하기 어려움" }
    ];
  }
};

/**
 * 팀 조합의 플레이 스타일 판별
 * @param {Array} games - 관련 게임 데이터
 * @param {Array} composition - 조합의 챔피언 이름 배열
 * @returns {Object} 플레이 스타일 및 추천 전략
 */
const determinePlayStyle = (games, composition) => {
  // 실제 구현에서는 게임 데이터 분석을 통해 플레이 스타일 도출
  // 여기서는 더미 데이터와 간단한 로직으로 대체
  
  // 챔피언 이름 기반의 간단한 플레이 스타일 추정
  const hasAssassin = composition.some(name => 
    ["Zed", "Akali", "Katarina", "Talon", "Ekko"].includes(name)
  );
  
  const hasTank = composition.some(name => 
    ["Malphite", "Sion", "Ornn", "Maokai", "Sejuani"].includes(name)
  );
  
  const hasScaling = composition.some(name => 
    ["Kayle", "Veigar", "Nasus", "Vayne", "Jinx"].includes(name)
  );
  
  const hasEarlyGame = composition.some(name => 
    ["Lee Sin", "Pantheon", "Renekton", "Draven", "Lucian"].includes(name)
  );
  
  let playStyle = '균형 잡힌 플레이 스타일';
  let recommendations = ['상황에 맞는 유연한 전략 구사'];
  
  if (hasAssassin && hasEarlyGame) {
    playStyle = '공격적 초중반 주도형';
    recommendations = [
      '초반 정글러와 로밍 서포터의 적극적인 개입',
      '빠른 첫 오브젝트 확보로 우위 선점',
      '분할 공격으로 적팀 혼란 유도'
    ];
  } else if (hasTank && hasScaling) {
    playStyle = '후반 스케일링 중심형';
    recommendations = [
      '안정적인 라인전 운영으로 CS 확보',
      '핵심 캐리 보호를 위한 포메이션 구성',
      '5:5 한타에서 진형 구축 후 교전'
    ];
  } else if (hasTank && hasEarlyGame) {
    playStyle = '중반 오브젝트 중심형';
    recommendations = [
      '드래곤/전령 확보를 위한 바텀/탑 우선권 설정',
      '정글러와 서포터의 적극적인 시야 확보',
      '오브젝트 교전에서 탱커의 전선 유지 활용'
    ];
  }
  
  return {
    style: playStyle,
    recommendations
  };
};

/**
 * 최근 메타 동향 분석
 * @param {Array} games - 게임 데이터 배열
 * @returns {Object} 메타 분석 결과
 */
export const analyzeMetaTrends = (games) => {
  if (!games || !games.length) {
    return { error: '유효한 데이터가 아닙니다.' };
  }

  // 최근 N개 게임만 분석 (메타는 최신 게임에 더 가중치)
  const recentGames = games.slice(-20);
  
  // 챔피언 픽/밴/승률 통계
  const championStats = {};
  
  recentGames.forEach(game => {
    game.participants.forEach(player => {
      const { championName, win } = player;
      
      if (!championStats[championName]) {
        championStats[championName] = { picks: 0, wins: 0 };
      }
      
      championStats[championName].picks++;
      if (win) championStats[championName].wins++;
    });
  });
  
  // 통계 정리 및 정렬
  const formattedStats = Object.entries(championStats)
    .map(([champion, stats]) => ({
      champion,
      pickRate: (stats.picks / (recentGames.length * 10)) * 100,
      winRate: (stats.wins / stats.picks) * 100,
      presence: stats.picks
    }))
    .sort((a, b) => b.presence - a.presence);
  
  // 상위 픽 챔피언
  const topPicks = formattedStats.slice(0, 10);
  
  // 승률 높은 챔피언 (최소 3게임 이상)
  const topWinrate = formattedStats
    .filter(stat => stat.presence >= 3)
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 10);
  
  // 최근 메타 조합 (간소화 버전)
  const metaCompositions = [
    {
      name: '포킹 기반 분할 조합',
      champions: ['Jayce', 'Nidalee', 'Zoe', 'Ezreal', 'Karma'],
      description: '원거리 견제와 핵 능력이 뛰어난 조합'
    },
    {
      name: '올인 다이브 조합',
      champions: ['Malphite', 'Hecarim', 'Galio', 'Kai\'Sa', 'Leona'],
      description: '강력한 이니시에이션과 후속 딜링이 가능한 조합'
    },
    {
      name: '보호형 초화력 조합',
      champions: ['Ornn', 'Ivern', 'Orianna', 'Kog\'Maw', 'Lulu'],
      description: '코그모를 핵심으로 보호하는 조합'
    }
  ];
  
  return {
    topPicks,
    topWinrate,
    metaCompositions,
    analyzedGames: recentGames.length,
    latestPatch: recentGames[recentGames.length - 1]?.gameVersion || 'Unknown'
  };
};

export default {
  analyzeChampionPerformance,
  analyzeTeamComposition,
  analyzeMetaTrends
}; 