export function rangeIntersects (min0: number, max0: number, min1: number, max1: number) {
  return  Math.max(min0, max0) >= Math.min(min1, max1) &&
          Math.min(min0, max0) <= Math.max(min1, max1);
}

export function rectIntersect (box3A: THREE.Box3, box3B: THREE.Box3) {
  return  rangeIntersects(box3A.min.x, box3A.max.x, box3B.min.x, box3B.max.x) &&
          rangeIntersects(box3A.min.y, box3A.max.y, box3B.min.y, box3B.max.y);
}
