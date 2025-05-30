// ROFL 파일 파서
// League of Legends 리플레이 파일(.rofl)을 ReplayBook 통합 모듈을 통해 분석

import { parseRoflFile as parseRofl, batchProcessRoflFiles as batchProcess } from './replaybook';

/**
 * ROFL 파일을 파싱하여 필요한 데이터 추출
 * @param {File} file - 업로드된 .rofl 파일
 * @returns {Promise<Object>} - 분석된 JSON 데이터
 */
export const parseRoflFile = async (file) => {
  try {
    // ReplayBook 통합 모듈을 통해 파일 분석
    const replayData = await parseRofl(file);
    return replayData;
  } catch (error) {
    console.error("ROFL 파일 파싱 오류:", error);
    throw new Error("리플레이 파일을 파싱할 수 없습니다: " + error.message);
  }
};

/**
 * 여러 ROFL 파일 일괄 처리
 * @param {File[]} files - 업로드된 .rofl 파일 배열
 * @returns {Promise<Object[]>} - 분석된 JSON 데이터 배열
 */
export const batchProcessRoflFiles = async (files) => {
  try {
    // ReplayBook 통합 모듈을 통해 일괄 처리
    return await batchProcess(files);
  } catch (error) {
    console.error("ROFL 파일 일괄 처리 오류:", error);
    throw new Error("리플레이 파일을 처리할 수 없습니다: " + error.message);
  }
}; 