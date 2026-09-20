/**
 * validateId.ts — 中国居民身份证号码校验（GB 11643-1999）
 *
 * 18 位身份证 = 17 位数字本体 + 1 位校验码。
 * 算法：前 17 位每位乘以对应加权因子求和，对 11 取模，
 * 用余数查表得到校验码，与第 18 位（X 不区分大小写）比对。
 *
 * 本文件为纯函数、零依赖，可直接被 Vitest/Jest 单测覆盖。
 */

/** GB 11643-1999 加权因子表 */
const WEIGHTS: readonly number[] = [
  7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2,
];

/** GB 11643-1999 校验码映射表（下标为「加权和 mod 11」的余数） */
const CHECK_CODES: readonly string[] = [
  '1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2',
];

/** 前 17 位本体必须是 17 位数字 */
const BODY_PATTERN = /^\d{17}$/;

/**
 * 计算 17 位号码本体的校验码（返回大写 '0'-'9' 或 'X'）。
 * @param body 17 位数字字符串
 * @throws 当 body 不是 17 位数字时抛错
 */
export function computeIdChecksum(body: string): string {
  if (!BODY_PATTERN.test(body)) {
    throw new Error('computeIdChecksum: body must be exactly 17 digits');
  }

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += Number(body[i]) * WEIGHTS[i];
  }

  return CHECK_CODES[sum % 11];
}

/**
 * 校验 18 位中国居民身份证号码：
 * 1. 长度必须为 18；
 * 2. 前 17 位必须为数字；
 * 3. 校验码符合 GB 11643-1999（'X' 不区分大小写）。
 */
export function validateChinaId(idNumber: string): boolean {
  if (!idNumber || idNumber.length !== 18) {
    return false;
  }

  const body = idNumber.slice(0, 17);
  if (!BODY_PATTERN.test(body)) {
    return false;
  }

  const expected = computeIdChecksum(body);
  return expected === idNumber[17].toUpperCase();
}
