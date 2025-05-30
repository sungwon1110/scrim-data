/**
 * ReplayBook 통합 모듈
 * ROFL 파일 분석 및 심층 분석 기능 제공
 */

import RoflParser from './RoflParser';
import PositionalAnalytics from './PositionalAnalytics';

/**
 * ROFL 파일 파싱
 * @param {File} file - ROFL 파일
 * @returns {Promise<Object>} 파싱 결과
 */
export const parseRoflFile = async (file) => {
  try {
    // 파일을 ArrayBuffer로 변환
    const buffer = await file.arrayBuffer();
    
    // ROFL 파일 파싱
    const replayData = RoflParser.parseRoflFile(buffer);
    
    return replayData;
  } catch (error) {
    console.error('ROFL 파일 파싱 오류:', error);
    throw error;
  }
};

/**
 * 게임 데이터 심층 분석
 * @param {Object} gameData - 게임 데이터
 * @returns {Object} 분석 결과
 */
export const analyzeGame = (gameData) => {
  try {
    // 포지션별 분석
    const positionAnalysis = PositionalAnalytics.analyzePositions(gameData);
    
    return {
      basicInfo: {
        gameId: gameData.gameId || gameData.matchId,
        gameVersion: gameData.gameVersion,
        gameDuration: gameData.gameLength,
        mapId: gameData.mapId,
        winningTeam: gameData.IsBlueVictorious ? 'blue' : 'red'
      },
      teams: {
        blue: {
          players: gameData.BluePlayers.map(mapPlayerData),
          win: gameData.IsBlueVictorious
        },
        red: {
          players: gameData.RedPlayers.map(mapPlayerData),
          win: !gameData.IsBlueVictorious
        }
      },
      positionAnalysis
    };
  } catch (error) {
    console.error('게임 분석 오류:', error);
    throw error;
  }
};

/**
 * 플레이어 데이터 매핑
 * @param {Object} player - 원본 플레이어 데이터
 * @returns {Object} 매핑된 플레이어 데이터
 */
const mapPlayerData = (player) => {
  return {
    name: player.Name,
    championId: player.Skin || 0,
    championName: player.championName || 'Unknown',
    position: player.TeamPosition || player.individualPosition || 'Unknown',
    stats: {
      kills: player.ChampionsKilled || 0,
      deaths: player.NumDeaths || 0,
      assists: player.Assists || 0,
      totalDamageDealtToChampions: player.TotalDamageDealtToChampions || 0,
      totalDamageTaken: player.TotalDamageTaken || 0,
      goldEarned: player.GoldEarned || 0,
      visionScore: player.VisionScore || 0,
      totalMinionsKilled: (player.MinionsKilled || 0) + (player.NeutralMinionsKilled || 0)
    }
  };
};

/**
 * 여러 ROFL 파일 일괄 처리
 * @param {File[]} files - ROFL 파일 배열
 * @returns {Promise<Object[]>} 분석 결과 배열
 */
export const batchProcessRoflFiles = async (files) => {
  const results = [];
  
  for (const file of files) {
    if (file.name.endsWith('.rofl')) {
      try {
        const rawData = await parseRoflFile(file);
        const analyzedData = analyzeGame(rawData);
        results.push(analyzedData);
      } catch (error) {
        console.error(`파일 처리 오류 (${file.name}):`, error);
      }
    }
  }
  
  return results;
};

export default {
  parseRoflFile,
  analyzeGame,
  batchProcessRoflFiles
}; 