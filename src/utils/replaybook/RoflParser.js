/**
 * ReplayBook의 ROFL 파서 JavaScript 구현
 * 원본 C# 코드를 참고하여 JavaScript로 구현함
 */

// ROFL 파일 구조 상수
const ROFL_SIGNATURE = 'RIOT';
const ROFL_HEADER_SIZE = 288;
const PAYLOAD_HEADER_SIZE = 84;
const METADATA_OFFSET = 0x120;

/**
 * ROFL 파일 파싱
 * @param {ArrayBuffer} buffer - ROFL 파일 버퍼
 * @returns {Object} 파싱 결과
 */
export const parseRoflFile = (buffer) => {
  try {
    // 파일 유효성 검사
    const signature = new TextDecoder().decode(new Uint8Array(buffer, 0, 4));
    if (signature !== ROFL_SIGNATURE) {
      throw new Error('유효한 ROFL 파일이 아닙니다');
    }

    // 기본 헤더 파싱
    const headerView = new DataView(buffer, 0, ROFL_HEADER_SIZE);
    const fileType = headerView.getUint32(4, true);
    
    // ROFL 파일 버전 확인 (ROFL1 또는 ROFL2)
    if (fileType === 1) {
      // ROFL1 파싱
      return parseROFL1(buffer);
    } else if (fileType === 2) {
      // ROFL2 파싱
      return parseROFL2(buffer);
    } else {
      throw new Error(`알 수 없는 ROFL 파일 유형: ${fileType}`);
    }
  } catch (error) {
    console.error('ROFL 파일 파싱 오류:', error);
    throw error;
  }
};

/**
 * ROFL1 (이전 버전) 파일 파싱
 * @param {ArrayBuffer} buffer - ROFL 파일 버퍼
 * @returns {Object} 파싱 결과
 */
const parseROFL1 = (buffer) => {
  try {
    // 페이로드 헤더 파싱
    const payloadHeaderView = new DataView(buffer, ROFL_HEADER_SIZE, PAYLOAD_HEADER_SIZE);
    const gameId = payloadHeaderView.getBigUint64(0, true);
    const gameLength = payloadHeaderView.getUint32(8, true);
    const keyframeCount = payloadHeaderView.getUint32(12, true);
    const chunkCount = payloadHeaderView.getUint32(16, true);
    const endStartupChunkId = payloadHeaderView.getUint32(20, true);
    const startGameChunkId = payloadHeaderView.getUint32(24, true);
    const keyframeInterval = payloadHeaderView.getUint32(28, true);
    const encryptionKeyLength = payloadHeaderView.getUint8(32);
    
    // 메타데이터 추출
    const metadataOffset = METADATA_OFFSET;
    const metadataLengthView = new DataView(buffer, metadataOffset, 4);
    const metadataLength = metadataLengthView.getUint32(0, true);
    
    if (metadataLength > 0) {
      const metadataJson = new TextDecoder().decode(
        new Uint8Array(buffer, metadataOffset + 4, metadataLength)
      );
      
      try {
        const metadata = JSON.parse(metadataJson);
        
        // 게임 버전 정보 추출
        const gameVersion = metadata.gameVersion || '';
        
        // 플레이어 통계 정보 추출
        const playerStats = processPlayerStats(metadata.statsJson);
        
        return {
          type: 'ROFL1',
          gameId: String(gameId),
          gameLength,
          gameVersion,
          matchId: String(gameId),
          mapId: determineMapId(playerStats),
          playerStats,
          BluePlayers: playerStats.filter(p => p.Team === '100'),
          RedPlayers: playerStats.filter(p => p.Team === '200'),
          IsBlueVictorious: determineBlueVictory(playerStats),
        };
      } catch (error) {
        console.error('메타데이터 JSON 파싱 오류:', error);
        throw error;
      }
    } else {
      throw new Error('메타데이터가 없습니다');
    }
  } catch (error) {
    console.error('ROFL1 파싱 오류:', error);
    throw error;
  }
};

/**
 * ROFL2 (최신 버전) 파일 파싱
 * @param {ArrayBuffer} buffer - ROFL 파일 버퍼
 * @returns {Object} 파싱 결과
 */
const parseROFL2 = (buffer) => {
  try {
    // ROFL2의 메타데이터 위치 및 구조는 ROFL1과 다를 수 있음
    // 실제 ReplayBook 코드를 참조하여 정확한 구현 필요
    
    // 현재는 간단한 구현으로 대체
    const headerView = new DataView(buffer, 0, ROFL_HEADER_SIZE);
    const metadataSize = headerView.getUint32(268, true);
    const metadataOffset = headerView.getUint32(272, true);
    
    if (metadataSize > 0 && metadataOffset > 0) {
      const metadataJson = new TextDecoder().decode(
        new Uint8Array(buffer, metadataOffset, metadataSize)
      );
      
      try {
        const metadata = JSON.parse(metadataJson);
        
        // 게임 버전 정보 추출
        const gameVersion = metadata.gameVersion || '';
        
        // 플레이어 통계 정보 추출
        const playerStats = processPlayerStats(metadata.statsJson || metadata.playerStats);
        
        return {
          type: 'ROFL2',
          gameLength: metadata.gameLength || 0,
          gameVersion,
          playerStats,
          BluePlayers: playerStats.filter(p => p.Team === '100'),
          RedPlayers: playerStats.filter(p => p.Team === '200'),
          IsBlueVictorious: determineBlueVictory(playerStats),
          mapId: determineMapId(playerStats)
        };
      } catch (error) {
        console.error('메타데이터 JSON 파싱 오류:', error);
        throw error;
      }
    } else {
      throw new Error('메타데이터가 없거나 손상되었습니다');
    }
  } catch (error) {
    console.error('ROFL2 파싱 오류:', error);
    throw error;
  }
};

/**
 * 플레이어 통계 JSON 처리
 * @param {string} statsJson - 플레이어 통계 JSON 문자열
 * @returns {Array} 플레이어 통계 객체 배열
 */
const processPlayerStats = (statsJson) => {
  if (!statsJson) {
    return [];
  }
  
  try {
    // JSON 문자열이면 파싱, 아니면 그대로 사용
    const stats = typeof statsJson === 'string' ? JSON.parse(statsJson) : statsJson;
    
    if (Array.isArray(stats)) {
      return stats;
    } else {
      // 일부 버전에서는 stats가 객체 형태로 제공될 수 있음
      return Object.values(stats);
    }
  } catch (error) {
    console.error('플레이어 통계 처리 오류:', error);
    return [];
  }
};

/**
 * 맵 ID 결정
 * @param {Array} playerStats - 플레이어 통계 배열
 * @returns {string} 맵 ID
 */
const determineMapId = (playerStats) => {
  // 간단한 구현으로 대체 - 실제로는 플레이어 수, 라인 정보 등을 활용
  if (playerStats.length === 10) {
    return 'SUMMONERS_RIFT'; // 소환사의 협곡
  } else if (playerStats.length === 6) {
    return 'HOWLING_ABYSS'; // 칼바람 나락
  } else {
    return 'UNKNOWN';
  }
};

/**
 * 블루팀 승리 여부 결정
 * @param {Array} playerStats - 플레이어 통계 배열
 * @returns {boolean} 블루팀 승리 여부
 */
const determineBlueVictory = (playerStats) => {
  // 블루팀과 레드팀 선수들 분류
  const bluePlayers = playerStats.filter(p => p.Team === '100');
  const redPlayers = playerStats.filter(p => p.Team === '200');
  
  // 각 팀에서 한 명의 플레이어만 확인하면 됨 (모두 같은 결과)
  if (bluePlayers.length > 0 && bluePlayers[0].hasOwnProperty('Win')) {
    return bluePlayers[0].Win === 'Win' || bluePlayers[0].Win === true;
  }
  
  // 승리 필드가 없는 경우 게임 종료 시간을 확인
  if (bluePlayers.length > 0 && redPlayers.length > 0) {
    const blueGameEndedInSurrender = bluePlayers[0].GameEndedInSurrender;
    const redGameEndedInSurrender = redPlayers[0].GameEndedInSurrender;
    
    if (blueGameEndedInSurrender && !redGameEndedInSurrender) {
      return false; // 블루팀 항복
    } else if (!blueGameEndedInSurrender && redGameEndedInSurrender) {
      return true; // 레드팀 항복
    }
  }
  
  // 알 수 없는 경우 기본값 반환
  return false;
};

export default {
  parseRoflFile
}; 