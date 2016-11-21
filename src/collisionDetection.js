export function rangeIntersects (min0, max0, min1, max1) {
  return  Math.max(min0, max0) >= Math.min(min1, max1) &&
          Math.min(min0, max0) <= Math.max(min1, max1);
}

export function rectIntersect (box3A, box3B) {
  return  rangeIntersects(box3A.min.x, box3A.max.x, box3B.min.x, box3B.max.x) &&
          rangeIntersects(box3A.min.y, box3A.max.y, box3B.min.y, box3B.max.y);
}
