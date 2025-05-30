/**
 * 팀 매치업 분석, 챔피언 조합 분석, 전략 패턴 식별 기능
 */

/**
 * 두 팀의 강점과 약점 비교 분석
 * @param {Object} game - 게임 데이터
 * @returns {Object} - 팀 매치업 분석 결과
 */
export const analyzeTeamMatchup = (game) => {
  if (!game || !game.participants || !Array.isArray(game.participants)) {
    return { error: "유효한 게임 데이터가 아닙니다." };
  }

  // 팀별로 플레이어 그룹화
  const team1 = game.participants.filter(p => p.teamId === 100);
  const team2 = game.participants.filter(p => p.teamId === 200);

  // 각 팀의 KDA 계산
  const team1KDA = calculateTeamKDA(team1);
  const team2KDA = calculateTeamKDA(team2);

  // 각 포지션별 매치업 비교
  const positionMatchups = comparePositionMatchups(team1, team2);

  // 객관적인 강점과 약점 분석
  const team1Strengths = identifyTeamStrengths(team1);
  const team2Strengths = identifyTeamStrengths(team2);

  // 승리 확률 예측 (간단한 모델)
  const winProbability = predictWinProbability(team1, team2);

  return {
    team1: {
      kda: team1KDA,
      strengths: team1Strengths,
      winProbability: winProbability.team1,
    },
    team2: {
      kda: team2KDA,
      strengths: team2Strengths,
      winProbability: winProbability.team2,
    },
    positionMatchups,
  };
};

/**
 * 팀 KDA 계산
 * @param {Array} players - 팀 플레이어 배열
 * @returns {Object} - 팀 KDA
 */
const calculateTeamKDA = (players) => {
  const totalKills = players.reduce((sum, p) => sum + (p.kills || 0), 0);
  const totalDeaths = players.reduce((sum, p) => sum + (p.deaths || 0), 0);
  const totalAssists = players.reduce((sum, p) => sum + (p.assists || 0), 0);

  const kda = totalDeaths === 0 
    ? (totalKills + totalAssists) 
    : ((totalKills + totalAssists) / totalDeaths).toFixed(2);

  return {
    kills: totalKills,
    deaths: totalDeaths,
    assists: totalAssists,
    ratio: parseFloat(kda)
  };
};

/**
 * 포지션별 매치업 비교
 * @param {Array} team1 - 팀1 플레이어 배열
 * @param {Array} team2 - 팀2 플레이어 배열
 * @returns {Object} - 포지션별 매치업 분석
 */
const comparePositionMatchups = (team1, team2) => {
  const positions = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
  const matchups = {};

  positions.forEach(position => {
    const player1 = team1.find(p => p.individualPosition === position);
    const player2 = team2.find(p => p.individualPosition === position);

    if (player1 && player2) {
      const player1KDA = calculatePlayerKDA(player1);
      const player2KDA = calculatePlayerKDA(player2);
      
      // 단순 KDA 비교 (실제로는 더 복잡한 지표 사용 가능)
      const advantage = player1KDA > player2KDA 
        ? "team1" 
        : player2KDA > player1KDA 
          ? "team2" 
          : "even";

      matchups[position] = {
        team1Player: {
          championName: player1.championName,
          kda: player1KDA
        },
        team2Player: {
          championName: player2.championName,
          kda: player2KDA
        },
        advantage
      };
    }
  });

  return matchups;
};

/**
 * 플레이어 KDA 계산
 * @param {Object} player - 플레이어 데이터
 * @returns {Number} - KDA 비율
 */
const calculatePlayerKDA = (player) => {
  const kills = player.kills || 0;
  const deaths = player.deaths || 0;
  const assists = player.assists || 0;
  
  return deaths === 0 
    ? kills + assists 
    : parseFloat(((kills + assists) / deaths).toFixed(2));
};

/**
 * 팀의 강점 식별
 * @param {Array} players - 팀 플레이어 배열
 * @returns {Array} - 팀 강점 목록
 */
const identifyTeamStrengths = (players) => {
  const strengths = [];

  // 킬 참여율이 높은지 확인
  const totalKills = players.reduce((sum, p) => sum + (p.kills || 0), 0);
  const totalAssists = players.reduce((sum, p) => sum + (p.assists || 0), 0);
  
  if (totalAssists > totalKills * 2) {
    strengths.push("높은 팀워크 (킬 참여율 높음)");
  }

  // 탑 캐리 여부 확인
  const topPlayer = players.find(p => p.individualPosition === "TOP");
  if (topPlayer && topPlayer.kills > 5) {
    strengths.push("강력한 탑 캐리");
  }

  // 기타 강점들... (실제로는 더 많은 지표 사용)

  return strengths.length > 0 ? strengths : ["특별한 강점이 감지되지 않음"];
};

/**
 * 승리 확률 예측 (간단한 모델)
 * @param {Array} team1 - 팀1 플레이어 배열
 * @param {Array} team2 - 팀2 플레이어 배열
 * @returns {Object} - 각 팀의 승리 확률
 */
const predictWinProbability = (team1, team2) => {
  // 실제 구현에서는 머신러닝 모델이나 복잡한 알고리즘 사용
  // 여기서는 KDA와 골드를 기반으로 간단한 확률 계산
  
  const team1KDA = calculateTeamKDA(team1).ratio;
  const team2KDA = calculateTeamKDA(team2).ratio;
  
  const team1Gold = team1.reduce((sum, p) => sum + (p.goldEarned || 0), 0);
  const team2Gold = team2.reduce((sum, p) => sum + (p.goldEarned || 0), 0);
  
  // 각 지표에 가중치 부여
  const kdaWeight = 0.6;
  const goldWeight = 0.4;
  
  // 팀1의 승리 확률 계산 (0-1 사이의 값)
  let team1Probability = 0.5; // 기본값은 50%
  
  if (team1KDA + team2KDA > 0) {
    team1Probability += kdaWeight * (team1KDA / (team1KDA + team2KDA) - 0.5);
  }
  
  if (team1Gold + team2Gold > 0) {
    team1Probability += goldWeight * (team1Gold / (team1Gold + team2Gold) - 0.5);
  }
  
  // 확률 범위 조정 (0.1-0.9)
  team1Probability = Math.max(0.1, Math.min(0.9, team1Probability));
  
  return {
    team1: parseFloat((team1Probability * 100).toFixed(1)),
    team2: parseFloat(((1 - team1Probability) * 100).toFixed(1))
  };
};

/**
 * 챔피언 조합 분석
 * @param {Array} players - 팀 플레이어 배열
 * @returns {Object} - 챔피언 조합 분석 결과
 */
export const analyzeChampionComposition = (players) => {
  if (!players || !Array.isArray(players) || players.length === 0) {
    return { error: "유효한 플레이어 데이터가 아닙니다." };
  }
  
  // 챔피언 조합 유형 분석
  const compositionType = identifyCompositionType(players);
  
  // 강점 및 약점
  const strengths = getCompositionStrengths(compositionType);
  const weaknesses = getCompositionWeaknesses(compositionType);
  
  // 상성 좋은 조합과 나쁜 조합
  const goodAgainst = getGoodMatchups(compositionType);
  const badAgainst = getBadMatchups(compositionType);
  
  return {
    compositionType,
    strengths,
    weaknesses,
    matchups: {
      goodAgainst,
      badAgainst
    }
  };
};

/**
 * 챔피언 조합 유형 식별
 * @param {Array} players - 팀 플레이어 배열
 * @returns {String} - 조합 유형
 */
const identifyCompositionType = (players) => {
  // 실제 구현에서는 챔피언 태그와 역할에 따라 분류
  // 여기서는 간단한 예시만 제공
  
  // 탱커 수 확인
  const tankCount = players.filter(p => isTank(p.championName)).length;
  
  // 딜러 수 확인
  const damageCount = players.filter(p => isDamageDealer(p.championName)).length;
  
  // 서포터 수 확인
  const supportCount = players.filter(p => isSupport(p.championName)).length;
  
  if (tankCount >= 2 && damageCount >= 2) {
    return "표준 조합";
  } else if (tankCount >= 3) {
    return "탱커 중심 조합";
  } else if (damageCount >= 4) {
    return "공격적 조합";
  } else if (supportCount >= 2) {
    return "보호 중심 조합";
  }
  
  return "혼합 조합";
};

// 챔피언 역할 판별 함수들 (실제로는 챔피언 데이터베이스 사용)
const isTank = (championName) => {
  const tanks = ["Ornn", "Sion", "Maokai", "Malphite", "Sejuani"];
  return tanks.includes(championName);
};

const isDamageDealer = (championName) => {
  const damageDealers = ["Jinx", "Yasuo", "Syndra", "Zed", "Akali"];
  return damageDealers.includes(championName);
};

const isSupport = (championName) => {
  const supports = ["Lulu", "Nami", "Soraka", "Janna", "Yuumi"];
  return supports.includes(championName);
};

// 조합 유형별 특성 (예시)
const getCompositionStrengths = (type) => {
  const strengths = {
    "표준 조합": ["균형 잡힌 전투력", "상황 적응력이 좋음"],
    "탱커 중심 조합": ["높은 생존력", "오브젝트 싸움에 유리"],
    "공격적 조합": ["빠른 파워 스파이크", "초반 주도권 확보 가능"],
    "보호 중심 조합": ["후반 캐리 보호에 탁월", "지속 전투에 강함"],
    "혼합 조합": ["예측하기 어려운 플레이 스타일"]
  };
  
  return strengths[type] || ["데이터 부족"];
};

const getCompositionWeaknesses = (type) => {
  const weaknesses = {
    "표준 조합": ["특출난 강점이 없음"],
    "탱커 중심 조합": ["딜 부족", "후반 약화될 수 있음"],
    "공격적 조합": ["그룹 생존력 낮음", "후반 취약할 수 있음"],
    "보호 중심 조합": ["초반 압박에 약함", "딜 부족할 수 있음"],
    "혼합 조합": ["특정 상황에서 전문성 부족"]
  };
  
  return weaknesses[type] || ["데이터 부족"];
};

const getGoodMatchups = (type) => {
  const goodMatchups = {
    "표준 조합": ["공격적 조합"],
    "탱커 중심 조합": ["공격적 조합"],
    "공격적 조합": ["보호 중심 조합"],
    "보호 중심 조합": ["탱커 중심 조합"],
    "혼합 조합": ["표준 조합"]
  };
  
  return goodMatchups[type] || [];
};

const getBadMatchups = (type) => {
  const badMatchups = {
    "표준 조합": ["혼합 조합"],
    "탱커 중심 조합": ["보호 중심 조합"],
    "공격적 조합": ["표준 조합", "탱커 중심 조합"],
    "보호 중심 조합": ["공격적 조합"],
    "혼합 조합": ["탱커 중심 조합"]
  };
  
  return badMatchups[type] || [];
};

/**
 * 경기 전략 패턴 식별
 * @param {Array} games - 게임 데이터 배열
 * @returns {Object} - 식별된 전략 패턴
 */
export const identifyStrategicPatterns = (games) => {
  if (!games || !Array.isArray(games) || games.length === 0) {
    return { error: "유효한 게임 데이터가 아닙니다." };
  }

  // 전략 패턴 빈도 집계
  const patternFrequency = {};
  
  // 게임별 패턴 분석
  games.forEach(game => {
    const patterns = analyzeGamePatterns(game);
    
    patterns.forEach(pattern => {
      patternFrequency[pattern] = (patternFrequency[pattern] || 0) + 1;
    });
  });
  
  // 빈도별 정렬
  const sortedPatterns = Object.entries(patternFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([pattern, count]) => ({
      pattern,
      frequency: count,
      percentage: parseFloat(((count / games.length) * 100).toFixed(1))
    }));
  
  // 성공한 패턴 식별
  const successfulPatterns = identifySuccessfulPatterns(games);
  
  return {
    totalGames: games.length,
    patterns: sortedPatterns,
    successfulPatterns
  };
};

/**
 * 단일 게임의 전략 패턴 분석
 * @param {Object} game - 게임 데이터
 * @returns {Array} - 식별된 패턴 목록
 */
const analyzeGamePatterns = (game) => {
  const patterns = [];
  
  // 실제 구현에서는 더 복잡한 알고리즘으로 패턴 식별
  // 여기서는 간단한 예시만 제공
  
  // 예: 킬 분포로 전략 추측
  const team1 = game.participants.filter(p => p.teamId === 100);
  const team2 = game.participants.filter(p => p.teamId === 200);
  
  // 팀1의 탑 레이너가 적극적인지
  const topLaner = team1.find(p => p.individualPosition === "TOP");
  if (topLaner && topLaner.kills > 3) {
    patterns.push("탑 캐리 중심");
  }
  
  // 팀1의 정글러가 적극적인지
  const jungler = team1.find(p => p.individualPosition === "JUNGLE");
  if (jungler && jungler.assists > 10) {
    patterns.push("정글 주도권");
  }
  
  // 바텀 레인 주도 전략
  const botLaner = team1.find(p => p.individualPosition === "BOTTOM");
  const support = team1.find(p => p.individualPosition === "UTILITY");
  if (botLaner && support && (botLaner.kills + support.assists) > 15) {
    patterns.push("바텀 중심 플레이");
  }
  
  // 플레이 스타일
  const totalKills = team1.reduce((sum, p) => sum + (p.kills || 0), 0);
  if (totalKills > 20) {
    patterns.push("공격적 플레이 스타일");
  } else if (totalKills < 10) {
    patterns.push("신중한 플레이 스타일");
  }
  
  return patterns;
};

/**
 * 성공적인 전략 패턴 식별
 * @param {Array} games - 게임 데이터 배열
 * @returns {Array} - 성공적인 패턴 목록
 */
const identifySuccessfulPatterns = (games) => {
  // 패턴별 승패 집계
  const patternResults = {};
  
  games.forEach(game => {
    // 우리 팀 가정 (팀 ID 100)
    const ourTeam = game.participants.filter(p => p.teamId === 100);
    const weWon = game.teams.find(t => t.teamId === 100)?.win || false;
    
    const patterns = analyzeGamePatterns({ ...game, participants: ourTeam });
    
    patterns.forEach(pattern => {
      if (!patternResults[pattern]) {
        patternResults[pattern] = { wins: 0, losses: 0 };
      }
      
      if (weWon) {
        patternResults[pattern].wins += 1;
      } else {
        patternResults[pattern].losses += 1;
      }
    });
  });
  
  // 승률 계산 및 정렬
  return Object.entries(patternResults)
    .map(([pattern, { wins, losses }]) => {
      const total = wins + losses;
      const winRate = total > 0 ? parseFloat(((wins / total) * 100).toFixed(1)) : 0;
      
      return {
        pattern,
        winRate,
        games: total
      };
    })
    .filter(p => p.games >= 2) // 최소 2게임 이상 플레이된 패턴만 포함
    .sort((a, b) => b.winRate - a.winRate);
};

/**
 * 팀 목표 설정 및 추적
 */
export const TeamGoals = {
  // 기본 목표 템플릿
  defaultGoals: [
    { id: 1, name: "킬 관여율 70% 이상 달성", metric: "killParticipation", target: 70, unit: "%" },
    { id: 2, name: "시야 점수 평균 30 이상", metric: "visionScore", target: 30, unit: "점" },
    { id: 3, name: "분당 CS 8개 이상", metric: "csPerMinute", target: 8, unit: "개" },
    { id: 4, name: "패시브 플레이 감소", metric: "damagePerMinute", target: 650, unit: "점" },
    { id: 5, name: "오브젝트 중심 플레이", metric: "objectiveControl", target: 65, unit: "%" }
  ],
  
  // 목표 달성도 계산
  calculateProgress: (goal, games) => {
    if (!games || games.length === 0) {
      return { progress: 0, achieved: false };
    }
    
    let currentValue = 0;
    
    switch (goal.metric) {
      case "killParticipation":
        currentValue = calculateAverageKillParticipation(games);
        break;
      case "visionScore":
        currentValue = calculateAverageVisionScore(games);
        break;
      case "csPerMinute":
        currentValue = calculateAverageCSPerMinute(games);
        break;
      case "damagePerMinute":
        currentValue = calculateAverageDamagePerMinute(games);
        break;
      case "objectiveControl":
        currentValue = calculateObjectiveControlRate(games);
        break;
      default:
        return { progress: 0, achieved: false };
    }
    
    const progress = parseFloat(((currentValue / goal.target) * 100).toFixed(1));
    
    return {
      currentValue: parseFloat(currentValue.toFixed(2)),
      progress: Math.min(100, progress),
      achieved: currentValue >= goal.target
    };
  }
};

// 목표 측정 도우미 함수들 (게임 데이터에 따라 조정 필요)
const calculateAverageKillParticipation = (games) => {
  // 구현 필요
  return 65.3; // 예시 값
};

const calculateAverageVisionScore = (games) => {
  // 구현 필요
  return 25.7; // 예시 값
};

const calculateAverageCSPerMinute = (games) => {
  // 구현 필요
  return 7.2; // 예시 값
};

const calculateAverageDamagePerMinute = (games) => {
  // 구현 필요
  return 580; // 예시 값
};

const calculateObjectiveControlRate = (games) => {
  // 구현 필요
  return 58.9; // 예시 값
}; 