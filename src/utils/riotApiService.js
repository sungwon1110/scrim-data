/**
 * Riot API 서비스
 * 챔피언 데이터, 게임 통계 등을 가져오는 기능 제공
 */

// 실제 사용 시 본인의 Riot API 키로 교체 필요
const RIOT_API_KEY = 'RGAPI-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';
const BASE_URL = 'https://kr.api.riotgames.com/lol';
const DDRAGON_URL = 'https://ddragon.leagueoflegends.com/cdn';

/**
 * 현재 버전의 Data Dragon URL을 반환
 * @param {string} version - 게임 버전 (예: '15.8.1')
 * @returns {string} Data Dragon URL
 */
const getDataDragonUrl = (version) => {
  // 메이저 버전만 추출 (예: '15.8.1' -> '15.8')
  const majorVersion = version.split('.').slice(0, 2).join('.');
  return `${DDRAGON_URL}/${majorVersion}.1`;
};

/**
 * Data Dragon에서 모든 챔피언 정보 가져오기
 * @param {string} version - 게임 버전
 * @param {string} language - 언어 코드 (기본값: 'ko_KR')
 * @returns {Promise<Object>} 챔피언 데이터 객체
 */
export const getAllChampions = async (version = '15.8.1', language = 'ko_KR') => {
  try {
    const url = `${getDataDragonUrl(version)}/data/${language}/champion.json`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data; // 모든 챔피언 데이터 반환
  } catch (error) {
    console.error('챔피언 데이터 가져오기 실패:', error);
    throw new Error('챔피언 데이터를 가져올 수 없습니다.');
  }
};

/**
 * 챔피언 ID를 이름으로 변환
 * @param {number} championId - 챔피언 ID
 * @param {Object} championsData - 모든 챔피언 데이터
 * @returns {string} 챔피언 이름
 */
export const getChampionNameById = (championId, championsData) => {
  for (const champKey in championsData) {
    if (championsData[champKey].key === championId.toString()) {
      return championsData[champKey].name;
    }
  }
  return '알 수 없는 챔피언';
};

/**
 * 챔피언의 역할(태그) 가져오기
 * @param {string} championName - 챔피언 이름
 * @param {Object} championsData - 모든 챔피언 데이터
 * @returns {Array<string>} 챔피언 역할 배열
 */
export const getChampionTags = (championName, championsData) => {
  for (const champKey in championsData) {
    if (championsData[champKey].name === championName) {
      return championsData[champKey].tags;
    }
  }
  return [];
};

/**
 * 챔피언의 주요 역할 판별
 * @param {string} championName - 챔피언 이름
 * @param {Object} championsData - 모든 챔피언 데이터
 * @returns {string} 주요 역할 (Tank, Fighter, Mage, Assassin, Marksman, Support)
 */
export const getPrimaryRole = (championName, championsData) => {
  const tags = getChampionTags(championName, championsData);
  if (tags.length === 0) return 'Unknown';
  
  // 첫 번째 태그를 주 역할로 간주
  return tags[0];
};

/**
 * Riot API를 통해 챔피언 통계 데이터 가져오기
 * @param {string} version - 게임 버전
 * @returns {Promise<Object>} 챔피언별 승률, 픽률 등의 통계 데이터
 */
export const getChampionStats = async (version = '15.8.1') => {
  // 실제 구현에서는 Riot API 또는 다른 통계 서비스에서 데이터 가져오기
  // 현재는 더미 데이터 반환
  return {
    Yasuo: { winRate: 48.5, pickRate: 12.3, banRate: 15.7 },
    Fiora: { winRate: 51.2, pickRate: 8.5, banRate: 7.2 },
    Thresh: { winRate: 50.1, pickRate: 14.8, banRate: 5.3 },
    // 더 많은 챔피언 통계...
  };
};

/**
 * 특정 조합의 시너지 점수 계산
 * @param {Array<string>} championNames - 챔피언 이름 배열
 * @param {Object} championsData - 모든 챔피언 데이터
 * @returns {Object} 조합 시너지 분석 결과
 */
export const calculateTeamSynergy = (championNames, championsData) => {
  if (!championNames || !championsData) return { score: 0, description: '데이터 부족' };
  
  // 역할 분포 확인
  const roles = championNames.map(name => getPrimaryRole(name, championsData));
  const roleCounts = roles.reduce((counts, role) => {
    counts[role] = (counts[role] || 0) + 1;
    return counts;
  }, {});
  
  // 점수 계산 (간단한 예시)
  let score = 0;
  let composition = '';
  let strengths = [];
  let weaknesses = [];
  
  // 탱커 존재 여부 확인
  if (roleCounts['Tank'] >= 1) {
    score += 20;
    strengths.push('탱커가 있어 전선 유지에 강함');
  } else {
    weaknesses.push('탱커 부족으로 전선 유지가 어려울 수 있음');
  }
  
  // 딜러 존재 여부 확인
  const damageCount = (roleCounts['Marksman'] || 0) + (roleCounts['Mage'] || 0) + (roleCounts['Assassin'] || 0);
  if (damageCount >= 2) {
    score += 20;
    strengths.push('충분한 딜러가 있어 데미지 분배가 좋음');
  } else {
    weaknesses.push('딜러 부족으로 후반 화력이 부족할 수 있음');
  }
  
  // 서포터 존재 여부 확인
  if (roleCounts['Support'] >= 1) {
    score += 15;
    strengths.push('서포터가 있어 팀 서포트와 시야 관리가 좋음');
  } else {
    weaknesses.push('서포터 부재로 팀 서포트와 시야 관리가 부족할 수 있음');
  }
  
  // CC 능력 확인 (간소화 버전)
  const hasCCChampion = championNames.some(name => 
    ['Thresh', 'Leona', 'Malphite', 'Amumu', 'Sejuani'].includes(name)
  );
  if (hasCCChampion) {
    score += 15;
    strengths.push('강력한 CC기가 있어 팀파이트 이니시에 강함');
  }
  
  // 조합 유형 판별
  if (roleCounts['Tank'] >= 2) {
    composition = '탱커 중심 조합';
    strengths.push('높은 생존력');
    weaknesses.push('딜 부족 가능성');
  } else if ((roleCounts['Assassin'] || 0) >= 2 || damageCount >= 4) {
    composition = '공격적 조합';
    strengths.push('높은 버스트 데미지');
    weaknesses.push('생존력 취약');
  } else if ((roleCounts['Support'] || 0) + (roleCounts['Tank'] || 0) >= 3) {
    composition = '보호 중심 조합';
    strengths.push('캐리 보호에 탁월');
    weaknesses.push('초반 압박에 취약');
  } else {
    composition = '균형 잡힌 조합';
    strengths.push('상황 적응력이 좋음');
  }
  
  // 점수 범위 조정 (0-100)
  score = Math.min(100, Math.max(0, score + Math.random() * 30));
  
  return {
    score: Math.round(score),
    composition,
    strengths,
    weaknesses
  };
};

export default {
  getAllChampions,
  getChampionNameById,
  getChampionTags,
  getPrimaryRole,
  getChampionStats,
  calculateTeamSynergy
}; 