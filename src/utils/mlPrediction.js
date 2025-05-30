/**
 * 머신러닝 기반 예측 모델
 * 팀 조합 승률 예측 및 최적 조합 추천
 */

// 간단한 로지스틱 회귀 모델을 흉내낸 함수
// 실제 머신러닝 구현 시 TensorFlow.js 등의 라이브러리 사용 필요
class SimpleLogisticModel {
  constructor() {
    // 가상의 모델 가중치 (실제로는 학습된 가중치 사용)
    this.weights = {
      // 챔피언 ID별 가중치 (실제로는 더 많은 특성 사용)
      championWeights: {
        // 탑
        114: 0.12, // Fiora
        122: -0.05, // Darius
        54: -0.08, // Malphite
        92: 0.14, // Riven
        86: 0.06, // Garen
        14: -0.09, // Sion
        
        // 정글
        64: 0.09, // Lee Sin
        11: -0.04, // Master Yi
        104: 0.02, // Graves
        35: 0.13, // Shaco
        121: 0.11, // Kha'Zix
        254: -0.07, // Vi
        
        // 미드
        157: 0.03, // Yasuo
        245: -0.02, // Ekko
        238: 0.07, // Zed
        7: 0.10, // LeBlanc
        101: 0.08, // Xerath
        34: -0.03, // Anivia
        
        // 원딜
        236: 0.11, // Lucian
        29: -0.06, // Twitch
        21: 0.04, // Miss Fortune
        145: 0.12, // Kai'Sa
        67: 0.15, // Vayne
        18: -0.04, // Tristana
        
        // 서폿
        412: 0.08, // Thresh
        40: -0.05, // Janna
        432: 0.03, // Bard
        25: 0.09, // Morgana
        16: 0.14, // Soraka
        78: -0.11 // Poppy
      },
      
      // 포지션별 가중치
      positionWeights: {
        TOP: 0.15,
        JUNGLE: 0.25,
        MIDDLE: 0.20,
        BOTTOM: 0.25,
        UTILITY: 0.15
      },
      
      // 조합 시너지 매트릭스 (실제로는 더 복잡한 구조)
      synergyMatrix: {
        // [챔피언1ID, 챔피언2ID]: 시너지 점수
        "114_64": 0.15, // Fiora + Lee Sin
        "157_412": 0.18, // Yasuo + Thresh
        "121_16": 0.12, // Kha'Zix + Soraka
        "67_16": 0.25, // Vayne + Soraka
        "236_412": 0.20, // Lucian + Thresh
        "54_254": 0.16, // Malphite + Vi
        "54_101": 0.17, // Malphite + Xerath
        "35_7": 0.22, // Shaco + LeBlanc
        "92_35": 0.14 // Riven + Shaco
      },
      
      // 기본 편향값
      bias: 0.02
    };
  }
  
  // 승률 예측 함수
  predict(blueTeam, redTeam) {
    // 각 팀의 기본 점수 계산
    const blueScore = this._calculateTeamScore(blueTeam);
    const redScore = this._calculateTeamScore(redTeam);
    
    // 시그모이드 함수를 사용한 승률 계산
    const scoreDiff = blueScore - redScore;
    const winProbability = this._sigmoid(scoreDiff);
    
    return {
      blueTeamWinProbability: winProbability * 100,
      redTeamWinProbability: (1 - winProbability) * 100,
      blueTeamScore: blueScore,
      redTeamScore: redScore,
      predictedWinner: winProbability > 0.5 ? "BLUE" : "RED"
    };
  }
  
  // 팀 점수 계산
  _calculateTeamScore(team) {
    if (!team || !Array.isArray(team) || team.length === 0) {
      return 0;
    }
    
    let score = this.weights.bias;
    
    // 각 챔피언별 가중치 합산
    team.forEach(champion => {
      const { championId, individualPosition } = champion;
      
      // 챔피언 ID 가중치
      if (this.weights.championWeights[championId]) {
        score += this.weights.championWeights[championId];
      }
      
      // 포지션 가중치
      if (this.weights.positionWeights[individualPosition]) {
        score += this.weights.positionWeights[individualPosition] * 0.1;
      }
    });
    
    // 시너지 점수 계산
    for (let i = 0; i < team.length; i++) {
      for (let j = i + 1; j < team.length; j++) {
        const champId1 = team[i].championId;
        const champId2 = team[j].championId;
        
        // 시너지 확인 (양방향)
        const synergyKey1 = `${champId1}_${champId2}`;
        const synergyKey2 = `${champId2}_${champId1}`;
        
        if (this.weights.synergyMatrix[synergyKey1]) {
          score += this.weights.synergyMatrix[synergyKey1];
        } else if (this.weights.synergyMatrix[synergyKey2]) {
          score += this.weights.synergyMatrix[synergyKey2];
        }
      }
    }
    
    return score;
  }
  
  // 시그모이드 함수
  _sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }
}

// 모델 인스턴스 생성
const predictionModel = new SimpleLogisticModel();

/**
 * 팀 조합 승률 예측
 * @param {Array} blueTeam - 블루팀 참가자 배열
 * @param {Array} redTeam - 레드팀 참가자 배열
 * @returns {Object} 승률 예측 결과
 */
export const predictWinRate = (blueTeam, redTeam) => {
  try {
    return predictionModel.predict(blueTeam, redTeam);
  } catch (error) {
    console.error('승률 예측 오류:', error);
    return {
      error: '승률 예측 중 오류가 발생했습니다.',
      details: error.message
    };
  }
};

/**
 * 현재 팀 조합에서 최적의 챔피언 추천
 * @param {Array} currentTeam - 현재 팀 조합 (4명까지)
 * @param {string} targetPosition - 타겟 포지션
 * @returns {Array} 추천 챔피언 목록
 */
export const recommendChampions = (currentTeam, targetPosition) => {
  if (!currentTeam || !Array.isArray(currentTeam) || currentTeam.length > 4) {
    return { error: '유효한 팀 데이터가 아닙니다. 1-4명의 챔피언이 필요합니다.' };
  }
  
  if (!targetPosition || !['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'].includes(targetPosition)) {
    return { error: '유효한 포지션이 아닙니다.' };
  }
  
  // 현재 선택된 포지션들
  const selectedPositions = currentTeam.map(champ => champ.individualPosition);
  
  // 이미 해당 포지션이 선택되었는지 확인
  if (selectedPositions.includes(targetPosition)) {
    return { error: `${targetPosition} 포지션은 이미 선택되었습니다.` };
  }
  
  // 포지션별 추천 챔피언 목록 (실제로는 데이터베이스나 API에서 가져와야 함)
  const positionChampions = {
    TOP: [
      { championId: 114, championName: 'Fiora', synergy: '스플릿 푸시 특화' },
      { championId: 54, championName: 'Malphite', synergy: '강력한 이니시에이션' },
      { championId: 86, championName: 'Garen', synergy: '탱킹과 딜링 밸런스' },
    ],
    JUNGLE: [
      { championId: 64, championName: 'Lee Sin', synergy: '초반 갱킹 압박' },
      { championId: 121, championName: 'Kha\'Zix', synergy: '고립 대상 처치 특화' },
      { championId: 254, championName: 'Vi', synergy: '확실한 CC기 제공' },
    ],
    MIDDLE: [
      { championId: 157, championName: 'Yasuo', synergy: '넉업 시너지' },
      { championId: 101, championName: 'Xerath', synergy: '원거리 포킹' },
      { championId: 238, championName: 'Zed', synergy: '핵심 대상 제거' },
    ],
    BOTTOM: [
      { championId: 236, championName: 'Lucian', synergy: '공격적 레이닝' },
      { championId: 67, championName: 'Vayne', synergy: '탱커 카운터' },
      { championId: 21, championName: 'Miss Fortune', synergy: '광역 피해 궁극기' },
    ],
    UTILITY: [
      { championId: 412, championName: 'Thresh', synergy: '강력한 CC와 보호' },
      { championId: 16, championName: 'Soraka', synergy: '지속적인 회복' },
      { championId: 25, championName: 'Morgana', synergy: 'CC 방어막 제공' },
    ]
  };
  
  // 포지션별 추천 챔피언 목록
  const candidates = positionChampions[targetPosition];
  
  // 가상의 적팀 (평균적인 팀 구성)
  const dummyEnemyTeam = [
    { championId: 92, individualPosition: 'TOP' },
    { championId: 35, individualPosition: 'JUNGLE' },
    { championId: 7, individualPosition: 'MIDDLE' },
    { championId: 145, individualPosition: 'BOTTOM' },
    { championId: 25, individualPosition: 'UTILITY' }
  ];
  
  // 각 후보 챔피언에 대해 승률 계산
  const rankedCandidates = candidates.map(candidate => {
    // 후보 챔피언을 포함한 가상의 팀 구성
    const fullTeam = [
      ...currentTeam,
      { championId: candidate.championId, individualPosition: targetPosition }
    ];
    
    // 빈 포지션 채우기 (5인이 될 때까지)
    const remainingPositions = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY']
      .filter(pos => !fullTeam.some(champ => champ.individualPosition === pos));
    
    let completeTeam = [...fullTeam];
    
    remainingPositions.forEach(pos => {
      // 포지션별 기본 챔피언 추가
      const defaultChamp = { 
        championId: positionChampions[pos][0].championId, 
        individualPosition: pos 
      };
      completeTeam.push(defaultChamp);
    });
    
    // 승률 예측
    const prediction = predictionModel.predict(completeTeam, dummyEnemyTeam);
    
    return {
      ...candidate,
      winProbability: prediction.blueTeamWinProbability.toFixed(1),
      teamScore: prediction.blueTeamScore.toFixed(2)
    };
  });
  
  // 승률 기준 정렬
  rankedCandidates.sort((a, b) => parseFloat(b.winProbability) - parseFloat(a.winProbability));
  
  // 시너지 분석
  const synergyAnalysis = rankedCandidates.map(candidate => {
    // 기존 팀과의 시너지 분석
    const synergyDetails = [];
    
    currentTeam.forEach(teammate => {
      const synergyKey1 = `${candidate.championId}_${teammate.championId}`;
      const synergyKey2 = `${teammate.championId}_${candidate.championId}`;
      
      if (predictionModel.weights.synergyMatrix[synergyKey1] || predictionModel.weights.synergyMatrix[synergyKey2]) {
        synergyDetails.push({
          champion: teammate.championName || `Champion #${teammate.championId}`,
          level: 'high',
          description: '강한 시너지'
        });
      }
    });
    
    return {
      ...candidate,
      synergyDetails: synergyDetails.length > 0 ? synergyDetails : [{ level: 'neutral', description: '보통 수준의 시너지' }]
    };
  });
  
  return {
    position: targetPosition,
    recommendations: synergyAnalysis,
    basedOn: `현재 ${currentTeam.length}명 조합에 최적화된 추천`
  };
};

/**
 * 게임 데이터 기반 조합 학습 함수 (가상)
 * 실제로는 TensorFlow.js 등을 사용하여 구현
 * @param {Array} games - 게임 데이터 배열
 * @returns {Object} 학습 결과
 */
export const trainModelWithGames = (games) => {
  // 실제 머신러닝 구현 시 이 부분에서 게임 데이터로 모델 학습
  // 여기서는 더미 데이터 반환
  
  return {
    success: true,
    trainingGames: games.length,
    modelAccuracy: 67.8,
    message: `${games.length}개의 게임 데이터로 모델을 학습했습니다.`,
    topFeatures: [
      { feature: 'Jungle-Mid 시너지', importance: 0.85 },
      { feature: '첫 바론 획득', importance: 0.78 },
      { feature: '10분 골드 차이', importance: 0.72 },
      { feature: '원딜 캐리 성능', importance: 0.68 },
      { feature: '탑 타워 첫 철거', importance: 0.61 }
    ]
  };
};

export default {
  predictWinRate,
  recommendChampions,
  trainModelWithGames
}; 